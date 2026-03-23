import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();
    if (!login || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    const { rows } = await db.query(
      `SELECT id, email, username, password_hash, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at
       FROM users
       WHERE email = $1 OR username = $1
       LIMIT 1`,
      [login],
    );
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    await db.query("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1", [user.id]);
    const token = await signToken({ userId: user.id, username: user.username, email: user.email });

    const { password_hash, ...safeUser } = user as { password_hash: string; [key: string]: unknown };
    void password_hash;
    const response = NextResponse.json({ token, user: safeUser }, { status: 200 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Login failed" },
      { status: 500 },
    );
  }
}
