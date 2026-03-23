import { createClient } from "@supabase/supabase-js";

function getSupabaseEnv(): { url: string; serviceRoleKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase env vars are not configured");
  }
  return { url, serviceRoleKey };
}

function getSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseEnv();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function uploadImage(
  bucket: "avatars" | "post-images",
  file: File,
  pathPrefix: string,
): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${extension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const supabaseAdmin = getSupabaseAdminClient();
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, fileBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
