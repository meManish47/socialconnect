import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC`,
      [params.userId],
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch followers" },
      { status: 500 },
    );
  }
}
