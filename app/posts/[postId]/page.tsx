"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommentSection } from "@/components/post/CommentSection";
import { PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { PostWithAuthor } from "@/types";

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/posts/${params.postId}`);
    if (!res.ok) return;
    setPost((await res.json()) as PostWithAuthor);
  }, [params.postId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#111318]">
      <Navbar />
      <div className="mx-auto flex w-full max-w-5xl gap-6 px-4 py-6">
        <Sidebar />
        <main className="w-full max-w-[680px] space-y-4">
          {post ? <PostCard post={post} meId={user?.id} onChanged={load} /> : <p>Loading post...</p>}
          <CommentSection postId={params.postId} />
        </main>
      </div>
    </div>
  );
}
