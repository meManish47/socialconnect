import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (auth.userId === params.userId) {
      return NextResponse.json({ message: "Cannot follow yourself" }, { status: 400 });
    }

    await client.query("BEGIN");
    const inserted = await client.query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id",
      [auth.userId, params.userId],
    );
    if (!inserted.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Already following" }, { status: 400 });
    }
    await client.query("UPDATE users SET following_count = following_count + 1 WHERE id = $1", [auth.userId]);
    await client.query("UPDATE users SET followers_count = followers_count + 1 WHERE id = $1", [params.userId]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Followed user" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to follow user" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await client.query("BEGIN");
    const deleted = await client.query(
      "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING id",
      [auth.userId, params.userId],
    );
    if (!deleted.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Not following user" }, { status: 400 });
    }
    await client.query("UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1", [auth.userId]);
    await client.query("UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = $1", [params.userId]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Unfollowed user" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to unfollow user" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
