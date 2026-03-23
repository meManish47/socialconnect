"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as User;
        setUser(data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return { user, loading };
}
