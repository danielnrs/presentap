import { defineEventHandler, getQuery, readBody, createError } from "h3";
import { prisma } from "@/server/db";

// Cache sementara untuk cooldown RFID
const rfidCooldownCache = new Map<string, number>();
const COOLDOWN_MS = 500; // 0.5 detik

const sendMessageToWebSocketClients = (message: any) => {
  try {
    if (globalThis.wsClients && globalThis.wsClients.length > 0) {
      globalThis.wsClients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(message));
        }
      });
    }
  } catch (error) {
    console.error("Gagal mengirim pesan WebSocket:", error);
  }
}

export default defineEventHandler(async (event) => {
  const method = event.method;

  // --- GET: Ambil data kehadiran
  if (method === "GET") {
    const query = getQuery(event);
    const isAll = query.all === "1";
    const start = query.start ? new Date(query.start as string) : undefined;
    const end = query.end ? new Date(query.end as string) : undefined;

    let whereFilter = {};

    if (start && end) {
      whereFilter = {
        checkInTime: { gte: start, lte: end },
      };
    } else if (!isAll) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereFilter = {
        checkInTime: { gte: today },
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereFilter,
      include: { student: true },
      orderBy: { checkInTime: "desc" },
    });

    return attendances.map((att) => ({
      id: att.id,
      studentId: att.studentId,
      studentName: att.student.name,
      nis: att.student.nis,
      kelas: att.student.class,
      rfid: att.student.rfid,
      checkInTime: att.checkInTime,
      checkOutTime: att.checkOutTime,
      info: att.info ?? null,
    }));
  }

  // --- POST: Buat absensi baru
  if (method === "POST") {
    const body = await readBody(event);
    const { rfid, nis, info, timestamp } = body;

    if (!rfid && !nis) {
      return { success: false, message: "RFID atau NIS harus diisi" };
    }

    // Cari siswa berdasarkan rfid atau nis
    const student = rfid
      ? await prisma.students.findUnique({ where: { rfid } })
      : await prisma.students.findUnique({ where: { nis } });

    if (!student) {
      sendMessageToWebSocketClients({rfid: rfid});
      return { success: false, message: "Siswa tidak ditemukan" };
    }

    const checkTime = timestamp ? new Date(timestamp) : new Date();

    // Cooldown RFID
    const now = Date.now();
    const lastTap = rfidCooldownCache.get(student.rfid);
    if (lastTap && now - lastTap < COOLDOWN_MS) {
      return {
        success: false,
        message: "Tunggu sebentar sebelum presensi lagi.",
      };
    }
    rfidCooldownCache.set(student.rfid, now);

    // Cek presensi hari ini
    const startOfDay = new Date(checkTime);
    startOfDay.setHours(0, 0, 0, 0);

    let attendance = await prisma.attendance.findFirst({
      where: { studentId: student.id, checkInTime: { gte: startOfDay } },
    });

    let action = "";
    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: {
          studentId: student.id,
          checkInTime: checkTime,
          info: info || "Hadir",
        },
      });
      action = "check-in";
      console.log(`
      === PRESENSI MASUK (IN) ===
      Nama  : ${student.name}
      NIS   : ${student.nis}
      Kelas : ${student.class}
      RFID  : ${student.rfid || 'TIDAK ADA'}
      Waktu : ${checkTime.toLocaleString('id-ID')}`);
    } else if (!attendance.checkOutTime) {
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOutTime: checkTime },
      });
      action = "check-out";
      console.log(`
      === PRESENSI PULANG (OUT) ===
      Nama  : ${student.name}
      NIS   : ${student.nis}
      Kelas : ${student.class}
      RFID  : ${student.rfid || 'TIDAK ADA'}
      Waktu : ${checkTime.toLocaleString('id-ID')}`);
    } else {
      return { success: false, message: "Sudah melakukan presensi hari ini." };
    }

    // --- Broadcast ke WebSocket client ---
    const payload = {
      id: attendance.id,
      studentId: student.id,
      studentName: student.name,
      nis: student.nis,
      kelas: student.class,
      rfid: student.rfid,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      info: attendance.info ?? null,
      action,
    };

    sendMessageToWebSocketClients(payload);

    return {
      success: true,
      message: `${action} berhasil`,
      attendance: payload,
    };
  }

  // --- DELETE: Hapus presensi
  if (method === "DELETE") {
    const query = getQuery(event);
    const id = query.id as string;
    if (!id) return { success: false, message: "ID diperlukan" };

    await prisma.attendance.delete({ where: { id: Number(id) } });
    return { success: true, message: "Presensi dihapus" };
  }
});
