"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function PostForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > 280) {
      toast.error("Post content must be 1-280 characters");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (image) formData.append("image", image);
      const res = await fetch("/api/posts", { method: "POST", body: formData });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(json.message ?? "Failed to create post");
        return;
      }
      setContent("");
      setImage(null);
      toast.success("Post created");
      await onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/10 bg-[#161a22] p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        placeholder="What's happening?"
        className="border-white/10 bg-[#0f0f0f] text-[#e8e8e8] focus-visible:ring-[#6366f1]"
      />
      <div className="flex items-center justify-between gap-2">
        <Input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="max-w-xs border-white/10 bg-[#0f0f0f]"
        />
        <Button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#6366f1] text-white hover:bg-[#4f52d8]"
        >
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
}
