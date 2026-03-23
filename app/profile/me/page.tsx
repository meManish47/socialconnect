"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { User } from "@/types";

export default function MePage() {
  const [user, setUser] = useState<User | null>(null);

  const load = async () => {
    const res = await fetch("/api/users/me");
    if (!res.ok) return;
    setUser((await res.json()) as User);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-[#111318]">
      <Navbar />
      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 py-6">
        <Sidebar />
        <main className="w-full max-w-[680px] space-y-4">
          <h1 className="font-heading text-2xl">Edit Profile</h1>
          {user ? <ProfileEditForm user={user} onSaved={load} /> : <p className="text-zinc-400">Loading...</p>}
        </main>
      </div>
    </div>
  );
}
