"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!login || !password) return toast.error("Fill all fields");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message ?? "Login failed");
    toast.success("Welcome back");
    router.push("/feed");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={submit} className="w-full space-y-3 rounded-2xl border border-white/10 bg-[#161a22] p-5">
        <h1 className="font-heading text-2xl">Login</h1>
        <Input placeholder="Email or username" value={login} onChange={(e) => setLogin(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button className="w-full rounded-full bg-[#6366f1]" type="submit">
          Sign in
        </Button>
        <p className="text-sm text-zinc-400">
          New here?{" "}
          <Link href="/register" className="text-[#6366f1]">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}
