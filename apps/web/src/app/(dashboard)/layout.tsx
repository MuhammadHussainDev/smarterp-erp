"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    if (!isAuthenticated) {
      setAuth(JSON.parse(userStr), token);
    }
  }, [isAuthenticated, setAuth, router]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
