import Link from "next/link";
import { Home, User } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-20 space-y-2 rounded-2xl border border-white/10 bg-[#161a22] p-3">
        <Link
          href="/feed"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#e8e8e8] transition hover:bg-white/5"
        >
          <Home className="h-4 w-4" /> Feed
        </Link>
        <Link
          href="/profile/me"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#e8e8e8] transition hover:bg-white/5"
        >
          <User className="h-4 w-4" /> My Profile
        </Link>
      </div>
    </aside>
  );
}
