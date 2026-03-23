"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommentWithAuthor } from "@/types";

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [content, setContent] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = (await res.json()) as CommentWithAuthor[];
    if (res.ok) setComments(data);
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message ?? "Failed to add comment");
    setContent("");
    toast.success("Comment added");
    await load();
  };

  return (
    <section className="space-y-3">
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment"
          className="border-white/10 bg-[#0f0f0f] focus-visible:ring-[#6366f1]"
        />
        <Button type="submit" className="rounded-full bg-[#6366f1]">
          Comment
        </Button>
      </form>
      {comments.length === 0 ? <p className="text-sm text-zinc-400">No comments yet.</p> : null}
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-white/10 bg-[#161a22] p-3">
          <p className="mb-1 text-sm font-medium">@{comment.author.username}</p>
          <p className="text-sm text-zinc-200">{comment.content}</p>
        </div>
      ))}
    </section>
  );
}
