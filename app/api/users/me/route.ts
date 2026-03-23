import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, validateImage } from "@/lib/middleware";
import { uploadImage } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { rows } = await db.query(
      `SELECT id, email, username, first_name, last_name, bio, avatar_url, website, location,
              posts_count, followers_count, following_count, last_login, created_at, updated_at
       FROM users WHERE id = $1`,
      [auth.userId],
    );
    if (!rows[0]) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const bio = (formData.get("bio") as string | null)?.slice(0, 160) ?? null;
    const website = (formData.get("website") as string | null) ?? null;
    const location = (formData.get("location") as string | null) ?? null;
    const first_name = (formData.get("first_name") as string | null) ?? null;
    const last_name = (formData.get("last_name") as string | null) ?? null;
    const avatar = formData.get("avatar") as File | null;

    let avatarUrl: string | null = null;
    if (avatar && avatar.size > 0) {
      const imageError = validateImage(avatar);
      if (imageError) return NextResponse.json({ message: imageError }, { status: 400 });
      avatarUrl = await uploadImage("avatars", avatar, auth.userId);
    }

    const { rows } = await db.query(
      `UPDATE users
       SET bio = COALESCE($1, bio),
           website = COALESCE($2, website),
           location = COALESCE($3, location),
           first_name = COALESCE($4, first_name),
           last_name = COALESCE($5, last_name),
           avatar_url = COALESCE($6, avatar_url),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, last_login, created_at, updated_at`,
      [bio, website, location, first_name, last_name, avatarUrl, auth.userId],
    );
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    );
  }
}
