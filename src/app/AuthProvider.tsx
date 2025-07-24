"use client";
import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type Role = "customer" | "admin" | null;

interface AuthContextType {
  user: import("firebase/auth").User | null | undefined;
  loading: boolean;
  role: Role;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  role: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      const fetchRole = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        setRole(data?.role ?? null);
        // Role-based redirect after login or first visit
        if (pathname === "/login") {
          if (data?.role === "admin") router.replace("/dashboard");
          else if (data?.role === "customer") router.replace("/");
        } else if ((pathname === "/" || pathname === "/") && data?.role === "admin") {
          router.replace("/dashboard");
        }
        // Remove any other forced redirects to /shop for customers
      };
      fetchRole();
    } else {
      setRole(null);
    }
  }, [user, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
} 