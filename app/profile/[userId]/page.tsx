"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { PostWithAuthor, PublicUser } from "@/types";

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { user: me } = useAuth();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const load = useCallback(async () => {
    const profileRes = await fetch(`/api/users/${params.userId}`);
    if (!profileRes.ok) return;
    setUser((await profileRes.json()) as PublicUser);

    const postsRes = await fetch("/api/posts");
    const postsJson = (await postsRes.json()) as { data: PostWithAuthor[] };
    setPosts((postsJson.data ?? []).filter((p) => p.author_id === params.userId));

    const followingRes = await fetch(`/api/users/${me?.id ?? ""}/following`);
    if (followingRes.ok) {
      const following = (await followingRes.json()) as Array<{ id: string }>;
      setIsFollowing(following.some((f) => f.id === params.userId));
    }
  }, [me?.id, params.userId]);

  useEffect(() => {
    if (me) void load();
  }, [load, me]);

  const toggleFollow = async (): Promise<void> => {
    const res = await fetch(`/api/users/${params.userId}/follow`, { method: isFollowing ? "DELETE" : "POST" });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) {
      toast.error(json.message ?? "Failed");
      return;
    }
    toast.success(isFollowing ? "Unfollowed" : "Followed");
    await load();
  };

  if (!user) return <p className="p-6 text-zinc-400">Loading profile...</p>;
  return (
    <div className="min-h-screen bg-[#111318]">
      <Navbar />
      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 py-6">
        <Sidebar />
        <main className="w-full max-w-[680px] space-y-4">
          <ProfileHeader
            user={user}
            isOwnProfile={me?.id === user.id}
            isFollowing={isFollowing}
            onToggleFollow={toggleFollow}
          />
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              meId={me?.id}
              onDelete={(postId) => setPosts((current) => current.filter((post) => post.id !== postId))}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
