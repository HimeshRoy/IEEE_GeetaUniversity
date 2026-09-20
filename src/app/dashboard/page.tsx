"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import WebHeadDashboard from "@/components/dashboard/WebHeadDashboard";
import CounselorDashboard from "@/components/dashboard/CounselorDashboard";
import PhotographerDashboard from "@/components/dashboard/PhotographerDashboard";
export default function DashboardPage() {
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

        const currentUser =
          response?.data ?? response;

        if (
          !currentUser?.id ||
          !currentUser?.role
        ) {
          throw new Error(
            "Invalid user response",
          );
        }

        setUser(currentUser);
      } catch {
        if (!mounted) {
          return;
        }

        clearUser();
        router.replace(
          "/login?redirect=/dashboard",
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

  if (user.role === "STUDENT") {
    return <StudentDashboard />;
  }

  if (user.role === "WEBMASTER") {
    return <WebHeadDashboard />;
  }

  if (user.role === "IEEE_COUNSELOR") {
    return <CounselorDashboard />;
  }

  if (
    user.role === "FACULTY_ADVISOR" ||
    user.role === "CHAIRMAN"
  ) {
    return <WebHeadDashboard />;
  }

  if( user.role === "PHOTOGRAPHER"){
    return <PhotographerDashboard/>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--muted)]">
          Dashboard
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          Welcome, {user.firstName}
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Your role-specific dashboard is being prepared.
        </p>
      </div>
    </div>
  );
}