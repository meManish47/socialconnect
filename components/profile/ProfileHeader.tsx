"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PublicUser } from "@/types";

interface ProfileHeaderProps {
  user: PublicUser;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onToggleFollow?: () => Promise<void>;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  onToggleFollow,
}: ProfileHeaderProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#161a22] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={user.avatar_url || "https://placehold.co/80x80/png"}
            alt={`${user.username} avatar`}
            width={64}
            height={64}
            className="rounded-full ring-2 ring-transparent transition hover:ring-[#6366f1]"
          />
          <div>
            <h1 className="font-heading text-xl">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-zinc-400">@{user.username}</p>
          </div>
        </div>
        {!isOwnProfile && onToggleFollow ? (
          <Button onClick={onToggleFollow} className="rounded-full bg-[#6366f1]">
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-zinc-200">{user.bio || "No bio yet."}</p>
      <div className="mt-3 flex gap-4 text-sm text-zinc-400">
        <span>{user.posts_count} posts</span>
        <span>{user.followers_count} followers</span>
        <span>{user.following_count} following</span>
      </div>
    </section>
  );
}
