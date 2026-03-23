"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111318]/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href="/feed"
          className="font-heading text-lg font-bold text-[#e8e8e8]"
        >
          SocialConnect
        </Link>
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-[#6366f1] transition ring-transparent">
                  <Image
                    src={user.avatar_url || "https://placehold.co/40x40/png"}
                    alt={`${user.username} avatar`}
                    width={40}
                    height={40}
                    className="rounded-full w-full h-full object-cover"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#0d1117] border-white/10"
              >
                <DropdownMenuItem >
                  <Link href="/profile/me" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <Link href="/login">
              <Button variant="ghost" className="rounded-full">
                <LogIn className="mr-1 h-4 w-4" />
                Login
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
