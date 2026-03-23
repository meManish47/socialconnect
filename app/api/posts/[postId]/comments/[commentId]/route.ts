import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string; commentId: string } },
) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await client.query("BEGIN");
    const deleted = await client.query(
      "DELETE FROM comments WHERE id = $1 AND post_id = $2 AND user_id = $3 RETURNING id",
      [params.commentId, params.postId, auth.userId],
    );
    if (!deleted.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Comment not found or forbidden" }, { status: 404 });
    }
    await client.query("UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1", [params.postId]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete comment" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
