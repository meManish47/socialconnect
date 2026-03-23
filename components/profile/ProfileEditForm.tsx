"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";

export function ProfileEditForm({
  user,
  onSaved,
}: {
  user: User;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    bio: user.bio ?? "",
    website: user.website ?? "",
    location: user.location ?? "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (avatar) formData.append("avatar", avatar);
    const res = await fetch("/api/users/me", { method: "PUT", body: formData });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message ?? "Failed to save profile");
    toast.success("Profile updated");
    await onSaved();
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-white/10 bg-[#161a22] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Profile Picture
          </label>
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white/20">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Current avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {(user.first_name?.[0] || "") + (user.last_name?.[0] || "")}
                </span>
              )}
            </div>
            <Input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            First Name
          </label>
          <Input
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Last Name
          </label>
          <Input
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Bio
        </label>
        <Textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          maxLength={160}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Website
        </label>
        <Input
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          Location
        </label>
        <Input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </div>

      <Button type="submit" className="rounded-full bg-[#6366f1]">
        Save Changes
      </Button>
    </form>
  );
}
