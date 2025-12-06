import { defineEventHandler, getQuery, readBody, sendError, createError } from "h3";
import { prisma } from "@/server/db";

export default defineEventHandler(async (event) => {
  const method = event.req.method;

  try {
    if (method === "GET") {
      const students = await prisma.students.findMany({
        select: {
          id: true,
          nis: true,
          rfid: true,
          name: true,
          class: true,
        },
      });

      return students.map((student) => ({
        id: student.id,
        nis: student.nis,
        rfid: student.rfid,
        name: student.name,
        kelas: student.class,
      }));
    }

    if (method === "POST") {
      const body = await readBody(event);

      const existingRFID = await prisma.students.findFirst({
        where: { rfid: body.rfid },
      });

      if (existingRFID) {
        return sendError(
          event,
          createError({
            statusCode: 400,
            statusMessage: "RFID sudah terdaftar",
          })
        );
      }

      const newStudent = await prisma.students.create({
        data: {
          nis: body.nis,
          rfid: body.rfid,
          name: body.name,
          class: body.kelas,
        },
      });

      return { message: "Student added successfully", student: newStudent };
    }

    if (method === "PUT") {
      const body = await readBody(event);

      const updatedStudent = await prisma.students.update({
        where: { id: body.id },
        data: {
          nis: body.nis,
          rfid: body.rfid,
          name: body.name,
          class: body.kelas,
        },
      });

      return {
        message: "Student updated successfully",
        student: updatedStudent,
      };
    }

    if (method === "DELETE") {
      const query = getQuery(event);
      const studentId = Number(query.id);

      await prisma.students.delete({ where: { id: studentId } });

      return { message: "Student deleted successfully" };
    }

    return { error: "Method not allowed" };

  } catch (error) {
    console.error("Error handling students API:", error);
    return { error: "Failed to process request" };
  }
});
