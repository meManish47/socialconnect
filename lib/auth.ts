import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, JWTPayload, jwtVerify } from "jose";
import { JwtPayload } from "@/types";

function getJwtKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtKey());
}

export async function verifyTokenFromString(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtKey());
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyToken(req?: NextRequest): Promise<JwtPayload | null> {
  const token = req?.cookies.get("token")?.value ?? cookies().get("token")?.value;
  if (!token) return null;
  return verifyTokenFromString(token);
}
