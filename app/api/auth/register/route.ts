import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export async function POST(req: Request) {
  try {
    const { email, username, password, first_name, last_name } = await req.json();

    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "Username must be 3-30 chars, letters/numbers/underscore only" },
        { status: 400 },
      );
    }

    const existing = await db.query("SELECT id FROM users WHERE email = $1 OR username = $2", [
      email,
      username,
    ]);
    if (existing.rowCount) {
      return NextResponse.json({ message: "Email or username already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at`,
      [email, username, passwordHash, first_name, last_name],
    );
    const user = rows[0];
    const token = await signToken({ userId: user.id, username: user.username, email: user.email });

    const response = NextResponse.json({ token, user }, { status: 201 });
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
      { message: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 },
    );
  }
}
