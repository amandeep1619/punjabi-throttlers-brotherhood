"use client";

import { useEffect } from "react";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";

export default function ClientProviders({
  initialUser,
  children,
}: {
  initialUser: AuthUser;
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);

  // Hydrate the client-side auth cache once from the server-rendered session,
  // so Navbar/logout can read it without prop-drilling through every layout.
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  return children;
}
