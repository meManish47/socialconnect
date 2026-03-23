import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const { rows } = await db.query(
      `SELECT id, username, first_name, last_name, bio, avatar_url, website, location,
              posts_count, followers_count, following_count, created_at
       FROM users WHERE id = $1`,
      [userId],
    );
    if (!rows[0]) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}
