"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Heart, MessageCircle, Trash2 } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [editContent, setEditContent] = useState(post.content);
  const [currentImageUrl, setCurrentImageUrl] = useState(post.image_url);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLikedByMe(Boolean(post.liked_by_me));
    setLikeCount(post.like_count);
    setContent(post.content);
    setEditContent(post.content);
    setCurrentImageUrl(post.image_url);
    setNewImageFile(null);
    setNewImagePreviewUrl(null);
  }, [post.liked_by_me, post.like_count, post.content, post.image_url]);

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

  const saveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return toast.error("Post content cannot be empty");
    if (trimmed.length > 280)
      return toast.error("Post content must be 280 characters or less");

    const previousContent = content;
    const previousImageUrl = currentImageUrl;
    const optimisticImage = newImagePreviewUrl
      ? newImagePreviewUrl
      : currentImageUrl;

    setContent(trimmed);
    setCurrentImageUrl(optimisticImage);
    setIsSaving(true);

    const formData = new FormData();
    formData.append("content", trimmed);
    if (newImageFile) {
      formData.append("image", newImageFile);
    }

    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      body: formData,
    });
    const responseData = (await res.json()) as unknown;

    if (!res.ok) {
      const errorMessage = (responseData as { message?: string })?.message;
      setContent(previousContent);
      setCurrentImageUrl(previousImageUrl);
      setIsSaving(false);
      return toast.error(errorMessage ?? "Update failed");
    }

    // Update with confirmed response payload
    const updatedPost = responseData as PostWithAuthor;
    toast.success("Post edited");
    setIsEditing(false);
    setIsSaving(false);
    setNewImageFile(null);
    setNewImagePreviewUrl(null);

    if (updatedPost?.content) setContent(updatedPost.content);
    if (updatedPost?.image_url !== undefined)
      setCurrentImageUrl(updatedPost.image_url);
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
        <Link
          href={`/profile/${post.author.id}`}
          className="font-medium text-[#e8e8e8]"
        >
          @{post.author.username}
        </Link>
        <span className="text-xs text-zinc-400">
          {new Date(post.created_at).toLocaleString()}
        </span>
      </div>
      {isEditing ? (
        <div className="mb-3 space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full resize-none rounded-xl border border-white/20 bg-[#0f1320] p-3 text-sm text-white outline-none focus:border-indigo-500"
            maxLength={280}
            rows={4}
          />
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              Change image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setNewImageFile(file);
                if (!file) {
                  setNewImagePreviewUrl(null);
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () =>
                  setNewImagePreviewUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
              className="text-sm text-zinc-300"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              className="rounded-full bg-[#6366f1]"
              onClick={saveEdit}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                setIsEditing(false);
                setEditContent(content);
                setNewImageFile(null);
                setNewImagePreviewUrl(null);
              }}
            >
              Cancel
            </Button>
          </div>
          {(newImagePreviewUrl || currentImageUrl) && (
            <div className="mt-2">
              <p className="text-xs text-zinc-400">Preview</p>
              <Image
                src={
                  newImagePreviewUrl ||
                  currentImageUrl ||
                  "https://placehold.co/600x400"
                }
                alt="post image preview"
                width={600}
                height={400}
                className="mt-1 h-auto w-full rounded-xl border border-white/10 object-cover"
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 whitespace-pre-wrap text-sm text-[#e8e8e8]">
            {content}
          </p>
          {currentImageUrl ? (
            <Image
              src={currentImageUrl}
              alt="post image"
              width={600}
              height={400}
              className="mb-3 h-auto w-full rounded-xl border border-white/10 object-cover"
            />
          ) : null}
        </>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={toggleLike}
          disabled={likePending}
        >
          <Heart
            className={`mr-1 h-4 w-4 ${likedByMe ? "fill-red-500 text-red-500" : ""}`}
          />
          {likeCount}
        </Button>
        <Link href={`/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="rounded-full">
            <MessageCircle className="mr-1 h-4 w-4" />
            {post.comment_count}
          </Button>
        </Link>
        {meId === post.author_id && !isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        ) : null}
        {meId === post.author_id ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-red-400"
            onClick={deletePost}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </article>
  );
}
