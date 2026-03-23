import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await client.query("BEGIN");
    const inserted = await client.query(
      "INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id",
      [auth.userId, params.postId],
    );
    if (!inserted.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Already liked" }, { status: 400 });
    }
    await client.query("UPDATE posts SET like_count = like_count + 1 WHERE id = $1", [params.postId]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Post liked" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to like post" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await client.query("BEGIN");
    const deleted = await client.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING id", [
      auth.userId,
      params.postId,
    ]);
    if (!deleted.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Not liked yet" }, { status: 400 });
    }
    await client.query("UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1", [params.postId]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Post unliked" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to unlike post" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
