"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: "admin" | "customer";
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, loading, role: userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login with returnTo
        router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      } else if (role && userRole !== role) {
        // Logged in but wrong role
        if (userRole === "admin") router.replace("/dashboard");
        else if (userRole === "customer") router.replace("/shop");
        else router.replace("/");
      }
    }
  }, [user, loading, userRole, role, pathname, router]);

  if (loading || !user || (role && userRole !== role)) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
} 