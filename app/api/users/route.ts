import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaginationParams } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { page, limit, offset } = getPaginationParams(req.nextUrl);
    const totalResult = await db.query("SELECT COUNT(*)::int AS count FROM users");
    const total = totalResult.rows[0].count as number;
    const { rows } = await db.query(
      `SELECT id, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return NextResponse.json({ data: rows, page, limit, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 },
    );
  }
}
