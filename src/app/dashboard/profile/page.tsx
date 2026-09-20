"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getCurrentUser } from "@/lib/api";

type MemberProfile = {
  membershipStatus: string;
  joinedAt: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  rollNumber: string | null;
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: string;
  ieeeMembershipNumber: string | null;
  profileImage: string | null;
  bio: string | null;
  createdAt: string;
  memberProfile: MemberProfile | null;
};

const FACULTY_PROFILE_ROLES = [
  "FACULTY",
  "FACULTY_ADVISOR",
  "FACULTY_MEMBER",
  "IEEE_COUNSELOR",
];

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatRole(role: string) {
  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "SUSPENDED":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "EXPIRED":
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await getCurrentUser();

        if (!mounted) return;

        setUser(response?.data ?? response);
      } catch (requestError: any) {
        if (!mounted) return;

        setError(
          requestError?.response?.data?.message ||
            "Unable to load your profile.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl animate-pulse">
        <div className="mb-7">
          <div className="h-4 w-20 rounded bg-[var(--background)]" />
          <div className="mt-3 h-8 w-40 rounded bg-[var(--background)]" />
        </div>

        <div className="h-48 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="h-72 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
          <div className="h-72 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-base font-semibold text-red-800">
            Unable to load profile
          </h1>

          <p className="mt-1.5 text-sm text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <UserRound className="mx-auto h-8 w-8 text-[var(--muted)]" />

          <p className="mt-3 text-sm text-[var(--muted)]">
            Profile information is not available.
          </p>
        </div>
      </div>
    );
  }

  const fullName =
    `${user.firstName} ${user.lastName || ""}`.trim();

  const profile = user.memberProfile;

  const showAcademicInformation =
    !FACULTY_PROFILE_ROLES.includes(user.role);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-7">
        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          Account
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1.5 text-sm text-[var(--muted)]">
              View and manage your IEEE Geeta University Student Branch
              profile.
            </p>
          </div>

          <Link
            href="/dashboard/profile/edit"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-sm font-semibold !text-white transition hover:opacity-90"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background)]">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-8 w-8 text-[var(--muted)]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {fullName}
              </h2>

              <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">
                {formatRole(user.role)}
              </span>
            </div>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {user.email}
            </p>

            {profile?.membershipStatus && (
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                  profile.membershipStatus,
                )}`}
              >
                IEEE Membership ·{" "}
                {profile.membershipStatus.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {user.bio && (
          <div className="border-t border-[var(--border)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              About
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground)]">
              {user.bio}
            </p>
          </div>
        )}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Personal Information
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)]">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Mail className="h-4 w-4 shrink-0 text-[var(--primary)]" />

              <div className="min-w-0">
                <p className="text-[11px] text-[var(--muted)]">
                  Email
                </p>

                <p className="mt-0.5 truncate text-sm font-medium text-[var(--foreground)]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <Phone className="h-4 w-4 shrink-0 text-[var(--primary)]" />

              <div>
                <p className="text-[11px] text-[var(--muted)]">
                  Phone
                </p>

                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                  {user.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--primary)]" />

              <div>
                <p className="text-[11px] text-[var(--muted)]">
                  Role
                </p>

                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                  {formatRole(user.role)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <CalendarDays className="h-4 w-4 shrink-0 text-[var(--primary)]" />

              <div>
                <p className="text-[11px] text-[var(--muted)]">
                  Account Created
                </p>

                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              IEEE Membership Information
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)]">
            <div className="px-5 py-3.5">
              <p className="text-[11px] text-[var(--muted)]">
                IEEE Membership Number
              </p>

              <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                {user.ieeeMembershipNumber || "Not provided"}
              </p>
            </div>

            <div className="px-5 py-3.5">
              <p className="text-[11px] text-[var(--muted)]">
                Membership Status
              </p>

              <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                {profile?.membershipStatus
                  ? profile.membershipStatus.replace("_", " ")
                  : "Not applied"}
              </p>
            </div>

            {showAcademicInformation && (
              <>
                <div className="px-5 py-3.5">
                  <p className="text-[11px] text-[var(--muted)]">
                    Department
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                    {profile?.department || "Not provided"}
                  </p>
                </div>

                <div className="px-5 py-3.5">
                  <p className="text-[11px] text-[var(--muted)]">
                    Course
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                    {profile?.course || "Not provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
                  <div className="px-5 py-3.5">
                    <p className="text-[11px] text-[var(--muted)]">
                      Year
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                      {profile?.year || "Not provided"}
                    </p>
                  </div>

                  <div className="px-5 py-3.5">
                    <p className="text-[11px] text-[var(--muted)]">
                      Roll Number
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                      {profile?.rollNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="px-5 py-3.5">
              <p className="text-[11px] text-[var(--muted)]">
                Joined IEEE Branch
              </p>

              <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">
                {formatDate(profile?.joinedAt || null)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}