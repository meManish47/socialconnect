"use client";

import { useEffect, useState } from "react";
import { PostWithAuthor } from "@/types";

interface UsePostsResult {
  posts: PostWithAuthor[];
  loading: boolean;
  error: string | null;
  reload: (options?: { showLoader?: boolean }) => Promise<void>;
}

export function usePosts(endpoint = "/api/feed"): UsePostsResult {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async (options?: { showLoader?: boolean }) => {
    const showLoader = options?.showLoader ?? true;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      const json = (await res.json()) as { data?: PostWithAuthor[]; message?: string };
      if (!res.ok) {
        setError(json.message ?? "Failed to load posts");
        return;
      }
      setPosts(json.data ?? []);
    } catch {
      setError("Failed to load posts");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [endpoint]);

  return { posts, loading, error, reload };
}
