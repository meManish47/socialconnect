import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaginationParams, requireAuth, validateImage } from "@/lib/middleware";
import { uploadImage } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const { page, limit, offset } = getPaginationParams(req.nextUrl);

    const totalResult = await db.query("SELECT COUNT(*)::int AS count FROM posts WHERE is_active = TRUE");
    const total = totalResult.rows[0].count as number;

    const { rows } = await db.query(
      `SELECT p.*,
              json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'avatar_url', u.avatar_url
              ) AS author,
              CASE WHEN $1::uuid IS NULL THEN FALSE
                   ELSE EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $1)
              END AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [auth?.userId ?? null, limit, offset],
    );
    return NextResponse.json({ data: rows, page, limit, total }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const formData = await req.formData();
    const content = (formData.get("content") as string | null)?.trim() ?? "";
    const image = formData.get("image") as File | null;
    if (!content || content.length > 280) {
      return NextResponse.json({ message: "Content must be 1-280 characters" }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (image && image.size > 0) {
      const imageError = validateImage(image);
      if (imageError) return NextResponse.json({ message: imageError }, { status: 400 });
      imageUrl = await uploadImage("post-images", image, auth.userId);
    }

    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO posts (content, author_id, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [content, auth.userId, imageUrl],
    );
    await client.query("UPDATE users SET posts_count = posts_count + 1 WHERE id = $1", [auth.userId]);
    await client.query("COMMIT");
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create post" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
