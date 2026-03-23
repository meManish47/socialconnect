"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PostWithAuthor } from "@/types";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: PostWithAuthor;
  meId?: string;
  onChanged?: () => Promise<void>;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, meId, onChanged, onDelete }: PostCardProps) {
  const [likedByMe, setLikedByMe] = useState(Boolean(post.liked_by_me));
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [likePending, setLikePending] = useState(false);

  useEffect(() => {
    setLikedByMe(Boolean(post.liked_by_me));
    setLikeCount(post.like_count);
  }, [post.liked_by_me, post.like_count]);

  const toggleLike = async () => {
    if (likePending) return;
    const previousLiked = likedByMe;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;
    const nextCount = previousCount + (nextLiked ? 1 : -1);

    setLikePending(true);
    setLikedByMe(nextLiked);
    setLikeCount(Math.max(nextCount, 0));

    const method = previousLiked ? "DELETE" : "POST";
    const res = await fetch(`/api/posts/${post.id}/like`, { method });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) {
      setLikedByMe(previousLiked);
      setLikeCount(previousCount);
      setLikePending(false);
      toast.error(json.message ?? "Action failed");
      return;
    }

    setLikePending(false);
    if (onChanged) await onChanged();
  };

  const deletePost = async () => {
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message ?? "Delete failed");
    toast.success("Post deleted");
    if (onDelete) onDelete(post.id);
    if (onChanged) await onChanged();
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[#161a22] p-4 transition-all hover:-translate-y-0.5">
      <div className="mb-2 flex items-center justify-between">
        <Link href={`/profile/${post.author.id}`} className="font-medium text-[#e8e8e8]">
          @{post.author.username}
        </Link>
        <span className="text-xs text-zinc-400">{new Date(post.created_at).toLocaleString()}</span>
      </div>
      <p className="mb-3 whitespace-pre-wrap text-sm text-[#e8e8e8]">{post.content}</p>
      {post.image_url ? (
        <Image
          src={post.image_url}
          alt="post image"
          width={600}
          height={400}
          className="mb-3 h-auto w-full rounded-xl border border-white/10 object-cover"
        />
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={toggleLike}
          disabled={likePending}
        >
          <Heart className={`mr-1 h-4 w-4 ${likedByMe ? "fill-red-500 text-red-500" : ""}`} />
          {likeCount}
        </Button>
        <Link href={`/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="rounded-full">
            <MessageCircle className="mr-1 h-4 w-4" />
            {post.comment_count}
          </Button>
        </Link>
        {meId === post.author_id ? (
          <Button variant="ghost" size="sm" className="rounded-full text-red-400" onClick={deletePost}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}
