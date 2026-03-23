"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameRegex.test(form.username)) {
      return toast.error("Username must be 3-30 letters, numbers, underscore");
    }
    if (!form.email || !form.password || !form.first_name || !form.last_name) {
      return toast.error("Please complete all fields");
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message ?? "Registration failed");
    toast.success("Account created");
    router.push("/feed");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={submit} className="w-full space-y-3 rounded-2xl border border-white/10 bg-[#161a22] p-5">
        <h1 className="font-heading text-2xl">Create Account</h1>
        <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <Button className="w-full rounded-full bg-[#6366f1]" type="submit">
          Register
        </Button>
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#6366f1]">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
