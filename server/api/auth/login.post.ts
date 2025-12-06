import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const config = useRuntimeConfig()

// Helper function to generate JWT token
const generateToken = (userId: number, username: string) => {
  return jwt.sign(
    { userId, username },
    config.jwtSecret || 'your-secret-key', // In production, use a strong secret key from environment variables
    { expiresIn: '24h' }
  );
};

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    return { status: 405, message: "Method Not Allowed" };
  }

  const body = await readBody(event);
  const { action } = body;

  // === LOGIN ===
  if (!action || action === "login") {
    const { username, password } = body;

    if (!username || !password) {
      return { status: 400, message: "Username dan password wajib diisi." };
    }

    // Cari admin berdasarkan username
    const user = await prisma.admin.findUnique({
      where: { username },
    });

    if (!user) {
      return { status: 401, message: "Username atau password salah." };
    }

    // Cek password (diasumsikan sudah di-hash di database)
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { status: 401, message: "Username atau password salah." };
    }

    // Jangan return password ke client
    const { password: _, ...userSafe } = user;

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    // Set HTTP-only cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    return {
      status: 200,
      data: {
        user: userSafe,
        token: token // Also return token in response for client-side storage if needed
      },
      message: "Login berhasil",
    };
  }

  // === REGISTER ===
  if (action === "register") {
    const { username, password } = body;

    if (!username || !password) {
      return { status: 400, message: "Username dan password wajib diisi." };
    }
    if (password.length < 5) {
      return { status: 400, message: "Password minimal 5 karakter." };
    }

    // Cek username sudah terdaftar
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return { status: 409, message: "Username sudah terdaftar." };
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Simpan admin baru
    const newUser = await prisma.admin.create({
      data: {
        username,
        password: hashed,
      },
    });

    // Jangan return password ke client
    const { password: _, ...userSafe } = newUser;

    return {
      status: 200,
      user: userSafe,
      message: "Registrasi berhasil",
    };
  }

  // Jika action tidak dikenali
  return { status: 400, message: "Aksi tidak dikenali." };
});
