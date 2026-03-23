import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTokenFromString } from "@/lib/auth";

export default async function Home() {
  const token = cookies().get("token")?.value;
  if (token) {
    const payload = await verifyTokenFromString(token);
    if (payload) redirect("/feed");
  }
  redirect("/login");
}
