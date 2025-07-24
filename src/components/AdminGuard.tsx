"use client";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.replace("/login?returnTo=/dashboard");
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") return null;
  return <>{children}</>;
} 