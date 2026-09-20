"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import WebHeadMembership from "@/components/dashboard/WebHeadMembership";
import StudentMembership from "@/components/dashboard/StudentMembership";

export default function MembershipPage() {
  const router = useRouter();
  const {
    user,
    setUser,
    clearUser,
    isLoading,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setLoading(true);

        const response = await getCurrentUser();

        if (!mounted) {
          return;
        }

        const currentUser = response?.data ?? response;
        setUser(currentUser);
      } catch {
        if (!mounted) {
          return;
        }

        clearUser();
        router.replace(
          "/login?redirect=/dashboard/membership",
        );
      }
    }

    if (!user) {
      void loadUser();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [
    clearUser,
    router,
    setLoading,
    setUser,
    user,
  ]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
      </div>
    );
  }

  const isAuthorizedHead =
    user.role === "WEBMASTER" ||
    user.role === "IEEE_COUNSELOR" ||
    user.role === "FACULTY_ADVISOR" ||
    (user.role === "CHAIRMAN" &&
      user.leadershipPositions?.some(
        (position) =>
          position.position === "CHAIRMAN" &&
          position.isCurrent,
      ));

  if (isAuthorizedHead) {
    return <WebHeadMembership />;
  }

  return <StudentMembership />;
}