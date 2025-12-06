// server/api/attendances/search.ts
import { defineEventHandler, getQuery } from "h3";
import { prisma } from "@/server/db";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const search = query.query as string; // nama / nis
    const date = query.date as string;

    if (!search || !date) {
      return {
        success: false,
        message: "Parameter query dan date wajib diisi",
        data: [],
      };
    }

    // Gunakan tanggal lokal langsung (asumsi server WIB)
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    // ambil siswa sesuai nis atau nama
    const students = await prisma.students.findMany({
      where: {
        OR: [{ nis: search }, { name: { contains: search } }],
      },
      include: {
        attendances: {
          where: {
            checkInTime: {
              gte: start,
              lte: end,
            },
          },
          orderBy: { checkInTime: "asc" },
        },
      },
    });

    // format hasil agar sesuai kebutuhan frontend
    const result = students.map((s) => ({
      name: s.name,
      nis: s.nis,
      class: s.class,
      attendance: s.attendances[0]
        ? {
            checkInTime: s.attendances[0].checkInTime,
            checkOutTime: s.attendances[0].checkOutTime,
            info: s.attendances[0].info || "Hadir",
          }
        : null, // null berarti alpha
    }));

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    console.error("Error di search.ts:", err);
    return {
      success: false,
      message: "Terjadi kesalahan server",
      data: [],
    };
  }
});
