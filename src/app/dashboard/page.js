"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    // Redirect to role-specific dashboard
    const role = session.user?.role || "user";
    const paths = {
      admin: "/dashboard/admin",
      organiser: "/dashboard/organiser",
      user: "/dashboard/user",
    };
    router.replace(paths[role] || paths.user);
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return null;
}