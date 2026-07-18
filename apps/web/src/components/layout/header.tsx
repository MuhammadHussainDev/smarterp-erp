"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-8">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <NotificationBell />
        <span className="text-sm text-muted-foreground">
          {user?.firstName} {user?.lastName}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-md bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
