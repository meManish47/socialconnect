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
          {user ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-[#161a22] p-4 text-sm text-zinc-400">
                <span className="mr-4">{user.posts_count} posts</span>
                <span className="mr-4">{user.followers_count} followers</span>
                <span>{user.following_count} following</span>
              </div>
              <ProfileEditForm user={user} onSaved={load} />
            </>
          ) : (
            <p className="text-zinc-400">Loading...</p>
          )}
        </main>
      </div>
    </div>
  );
}
