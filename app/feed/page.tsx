"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { PostForm } from "@/components/post/PostForm";
import { PostCard } from "@/components/post/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { PostWithAuthor } from "@/types";

export default function FeedPage() {
  const { user } = useAuth();
  const { posts, loading, error, reload } = usePosts("/api/feed");
  const [localPosts, setLocalPosts] = useState<PostWithAuthor[]>([]);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const removePost = (postId: string) => {
    setLocalPosts((current) => current.filter((post) => post.id !== postId));
  };

  return (
    <div className="min-h-screen bg-[#111318]">
      <Navbar />
      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 py-6">
        <Sidebar />
        <main className="w-full max-w-[680px] space-y-4">
          <PostForm onCreated={() => reload({ showLoader: false })} />
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 rounded-2xl bg-white/10" />
              <Skeleton className="h-32 rounded-2xl bg-white/10" />
            </div>
          ) : null}
          {error=="Unauthorized" ? <p className="text-sm text-red-400">You need to login first!</p> : error ? <p className="text-sm text-red-400">{error}</p> : null  }
          {!loading && !error && localPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#161a22] p-6 text-center">
              <MessageCircle className="mx-auto mb-2 h-6 w-6 text-zinc-500" />
              <p className="text-zinc-400">Your feed is empty. Start by creating a post.</p>
            </div>
          ) : null}
          {localPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              meId={user?.id}
              onDelete={removePost}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
