import { NextRequest } from "next/server";
import { verifyTokenFromString } from "@/lib/auth";
import { JwtPayload } from "@/types";

export async function requireAuth(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyTokenFromString(token);
}

export function getPaginationParams(url: URL): { page: number; limit: number; offset: number } {
  const pageRaw = Number(url.searchParams.get("page") ?? "1");
  const limitRaw = Number(url.searchParams.get("limit") ?? "10");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;
  return { page, limit, offset: (page - 1) * limit };
}

export function validateImage(file: File): string | null {
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) return "Only JPEG and PNG files are allowed";
  if (file.size > 2 * 1024 * 1024) return "Image must be less than 2MB";
  return null;
}
