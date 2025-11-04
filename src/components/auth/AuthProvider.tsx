"use client";

import React, { createContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const PROTECTED_ROUTES = ["/", "/calendar", "/wishlist"];
const PUBLIC_ROUTES = ["/login"];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    // normalize trailing slashes: "/login/" -> "/login"
    const normalized = pathname !== "/" && pathname.endsWith("/")
      ? pathname.replace(/\/+$/, "")
      : pathname;

    const isProtectedRoute = PROTECTED_ROUTES.includes(normalized);
    const isPublicRoute = PUBLIC_ROUTES.includes(normalized);

    if (isProtectedRoute && !user) {
      router.push("/login");
    }

    if (isPublicRoute && user) {
      router.push("/calendar");
    }
  }, [user, loading, pathname, router]);

  if (loading || (PROTECTED_ROUTES.includes(pathname) && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
