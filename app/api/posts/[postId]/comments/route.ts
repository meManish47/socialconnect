import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function GET(_: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'avatar_url', u.avatar_url
              ) AS author
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [params.postId],
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { content } = await req.json();
    if (!content || content.length > 280) {
      return NextResponse.json({ message: "Comment must be 1-280 characters" }, { status: 400 });
    }
    await client.query("BEGIN");
    const { rows } = await client.query(
      "INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *",
      [content, auth.userId, params.postId],
    );
    await client.query("UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1", [params.postId]);
    await client.query("COMMIT");
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add comment" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
