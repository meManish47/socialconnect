import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, validateImage } from "@/lib/middleware";
import { uploadImage } from "@/lib/supabase";

export async function GET(
  _: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    const { rows } = await db.query(
      `SELECT p.*,
              json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'avatar_url', u.avatar_url
              ) AS author
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.id = $1 AND p.is_active = TRUE`,
      [params.postId],
    );
    if (!rows[0])
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch post",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    const auth = await requireAuth(req);
    if (!auth)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let content = "";
    let imageUrl: string | null = null;

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      content = (formData.get("content") as string | null)?.trim() ?? "";
      const image = formData.get("image") as File | null;
      if (image && image.size > 0) {
        const imageError = validateImage(image);
        if (imageError)
          return NextResponse.json({ message: imageError }, { status: 400 });
        imageUrl = await uploadImage("post-images", image, auth.userId);
      }
    } else {
      const body = await req.json();
      content = (body?.content as string | null)?.trim() ?? "";
    }

    if (!content || content.length > 280) {
      return NextResponse.json(
        { message: "Content must be 1-280 characters" },
        { status: 400 },
      );
    }

    const { rows } = await db.query(
      `UPDATE posts
       SET content = $1,
           image_url = COALESCE($2, image_url),
           updated_at = NOW()
       WHERE id = $3 AND author_id = $4 AND is_active = TRUE
       RETURNING *`,
      [content, imageUrl, params.postId, auth.userId],
    );

    if (!rows[0])
      return NextResponse.json(
        { message: "Post not found or forbidden" },
        { status: 404 },
      );
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update post",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } },
) {
  const client = await db.connect();
  try {
    const auth = await requireAuth(req);
    if (!auth)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE posts
       SET is_active = FALSE, updated_at = NOW()
       WHERE id = $1 AND author_id = $2 AND is_active = TRUE
       RETURNING id`,
      [params.postId, auth.userId],
    );
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Post not found or forbidden" },
        { status: 404 },
      );
    }
    await client.query(
      "UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = $1",
      [auth.userId],
    );
    await client.query("COMMIT");
    return NextResponse.json({ message: "Post deleted" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete post",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
