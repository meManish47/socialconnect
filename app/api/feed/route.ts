import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaginationParams, requireAuth } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { page, limit, offset } = getPaginationParams(req.nextUrl);

    const followingResult = await db.query("SELECT following_id FROM follows WHERE follower_id = $1", [
      auth.userId,
    ]);
    const followingIds = followingResult.rows.map((row) => row.following_id as string);

    const postsQuery =
      followingIds.length > 0
        ? {
            text: `SELECT p.*,
                          json_build_object(
                            'id', u.id, 'username', u.username, 'first_name', u.first_name,
                            'last_name', u.last_name, 'avatar_url', u.avatar_url
                          ) AS author,
                          EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked_by_me
                   FROM posts p
                   JOIN users u ON u.id = p.author_id
                   WHERE p.is_active = TRUE AND p.author_id = ANY($2::uuid[])
                   ORDER BY p.created_at DESC
                   LIMIT $3 OFFSET $4`,
            values: [auth.userId, followingIds, limit, offset],
          }
        : {
            text: `SELECT p.*,
                          json_build_object(
                            'id', u.id, 'username', u.username, 'first_name', u.first_name,
                            'last_name', u.last_name, 'avatar_url', u.avatar_url
                          ) AS author,
                          EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked_by_me
                   FROM posts p
                   JOIN users u ON u.id = p.author_id
                   WHERE p.is_active = TRUE
                   ORDER BY p.created_at DESC
                   LIMIT $2 OFFSET $3`,
            values: [auth.userId, limit, offset],
          };

    const totalResult =
      followingIds.length > 0
        ? await db.query(
            "SELECT COUNT(*)::int AS count FROM posts WHERE is_active = TRUE AND author_id = ANY($1::uuid[])",
            [followingIds],
          )
        : await db.query("SELECT COUNT(*)::int AS count FROM posts WHERE is_active = TRUE");

    const { rows } = await db.query(postsQuery.text, postsQuery.values);
    return NextResponse.json(
      { data: rows, page, limit, total: totalResult.rows[0].count as number },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch feed" },
      { status: 500 },
    );
  }
}
