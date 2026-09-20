"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

type MembershipStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "EXPIRED"
  | "REJECTED";

type Membership = {
  id: string;
  userId: string;
  membershipStatus: MembershipStatus;
  joinedAt: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  rollNumber: string | null;
  profileVisibility: string;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  ieeeMembershipNumber: string | null;
  profileImage: string | null;
};

function getFullName(user: CurrentUser) {
  return `${user.firstName}${
    user.lastName ? ` ${user.lastName}` : ""
  }`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getStatusConfig(status: MembershipStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        icon: CheckCircle2,
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        panel:
          "border-emerald-200 bg-emerald-50",
        iconClass: "text-emerald-600",
      };

    case "PENDING":
      return {
        label: "Pending Review",
        icon: Clock3,
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        panel:
          "border-amber-200 bg-amber-50",
        iconClass: "text-amber-600",
      };

    case "SUSPENDED":
      return {
        label: "Suspended",
        icon: AlertCircle,
        badge:
          "border-orange-200 bg-orange-50 text-orange-700",
        panel:
          "border-orange-200 bg-orange-50",
        iconClass: "text-orange-600",
      };

    case "EXPIRED":
      return {
        label: "Expired",
        icon: AlertCircle,
        badge:
          "border-slate-200 bg-slate-100 text-slate-700",
        panel:
          "border-slate-200 bg-slate-50",
        iconClass: "text-slate-600",
      };

    case "REJECTED":
      return {
        label: "Rejected",
        icon: XCircle,
        badge:
          "border-red-200 bg-red-50 text-red-700",
        panel:
          "border-red-200 bg-red-50",
        iconClass: "text-red-600",
      };
  }
}

export default function StudentMembership() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [membership, setMembership] =
    useState<Membership | null>(null);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadMembership(refresh = false) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [userResponse, membershipResponse] =
        await Promise.all([
          getCurrentUser(),
          api.get("/membership/me"),
        ]);

      const currentUser =
        userResponse?.data ?? userResponse;

      const membershipData =
        membershipResponse.data?.data ??
        membershipResponse.data;

      setUser(currentUser);
      setMembership(membershipData);
    } catch (requestError: any) {
      const status = requestError?.response?.status;

      if (status === 404) {
        try {
          const userResponse = await getCurrentUser();
          const currentUser =
            userResponse?.data ?? userResponse;

          setUser(currentUser);
          setMembership(null);
          setError("");
        } catch {
          setError(
            "Unable to load your membership information.",
          );
        }
      } else {
        setError(
          requestError?.response?.data?.message ||
            "Unable to load your membership information.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadMembership();
  }, []);

  async function applyForMembership() {
    try {
      setApplying(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/membership/apply",
      );

      const createdMembership =
        response.data?.data ?? response.data;

      setMembership(createdMembership);

      setSuccess(
        "Your IEEE GU Student Branch membership application has been submitted successfully.",
      );
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to submit your membership application.",
      );
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-[var(--muted)]/20" />
          <div className="mt-3 h-8 w-64 rounded bg-[var(--muted)]/20" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-[var(--muted)]/20" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-36 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
          <div className="h-36 rounded-xl border border-[var(--border)] bg-[var(--card)] lg:col-span-2" />
        </div>

        <div className="h-72 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <h1 className="text-sm font-semibold text-red-800">
              Unable to load your account
            </h1>

            <p className="mt-1 text-sm text-red-700">
              Please sign in again to access your
              membership information.
            </p>

            <Link
              href="/login?redirect=/dashboard/membership"
              className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold !text-white hover:bg-red-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = membership
    ? getStatusConfig(membership.membershipStatus)
    : null;

  const StatusIcon = status?.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">
            Member Services
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            My Membership
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
            View and manage your IEEE Geeta University
            Student Branch membership.
          </p>
        </div>

        
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!membership ? (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  IEEE GU Student Branch Membership
                </h2>

                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Your account does not currently have a
                  membership application.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Apply for membership
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Submit your membership application to the
                IEEE Geeta University Student Branch. Your
                application will remain pending until it is
                reviewed by an authorized branch administrator.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <InfoPoint
                  icon={<FileText className="h-4 w-4" />}
                  title="Apply"
                  text="Submit your application."
                />

                <InfoPoint
                  icon={<Clock3 className="h-4 w-4" />}
                  title="Review"
                  text="Branch administration reviews it."
                />

                <InfoPoint
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Approval"
                  text="Membership becomes active after approval."
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  void applyForMembership()
                }
                disabled={applying}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold !text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applying && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {applying
                  ? "Submitting..."
                  : "Apply for Membership"}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {status && StatusIcon && (
            <section
              className={`rounded-xl border px-5 py-4 ${status.panel}`}
            >
              <div className="flex items-start gap-3">
                <StatusIcon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${status.iconClass}`}
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      Membership Status
                    </h2>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {membership.membershipStatus ===
                      "ACTIVE" &&
                      "Your IEEE GU Student Branch membership is active."}

                    {membership.membershipStatus ===
                      "PENDING" &&
                      "Your application has been submitted and is awaiting branch administration review."}

                    {membership.membershipStatus ===
                      "SUSPENDED" &&
                      "Your membership is currently suspended. Please contact branch administration for more information."}

                    {membership.membershipStatus ===
                      "EXPIRED" &&
                      "Your membership is currently marked as expired."}

                    {membership.membershipStatus ===
                      "REJECTED" &&
                      "Your membership application was rejected. Please review the reason below and contact branch administration if clarification is required."}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />

                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-[var(--foreground)]">
                    {getFullName(user)}
                  </h2>

                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-4">
                <MembershipInfo
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={user.email}
                />

                <MembershipInfo
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={
                    user.phone || "Not provided"
                  }
                />

                <MembershipInfo
                  icon={<Hash className="h-4 w-4" />}
                  label="IEEE Membership Number"
                  value={
                    user.ieeeMembershipNumber ||
                    "Not provided"
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[var(--foreground)]">
                    Membership Information
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Information associated with your branch membership.
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MembershipInfo
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Membership Status"
                  value={status?.label || "Unknown"}
                />

                <MembershipInfo
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Joined Date"
                  value={formatDate(
                    membership.joinedAt,
                  )}
                />

                <MembershipInfo
                  icon={<FileText className="h-4 w-4" />}
                  label="Department"
                  value={
                    membership.department ||
                    "Not provided"
                  }
                />

                <MembershipInfo
                  icon={<FileText className="h-4 w-4" />}
                  label="Course"
                  value={
                    membership.course ||
                    "Not provided"
                  }
                />

                <MembershipInfo
                  icon={<Hash className="h-4 w-4" />}
                  label="Year"
                  value={
                    membership.year ||
                    "Not provided"
                  }
                />

                <MembershipInfo
                  icon={<Hash className="h-4 w-4" />}
                  label="Roll Number"
                  value={
                    membership.rollNumber ||
                    "Not provided"
                  }
                />

                <MembershipInfo
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Application Date"
                  value={formatDate(
                    membership.createdAt,
                  )}
                />

                <MembershipInfo
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Last Updated"
                  value={formatDate(
                    membership.updatedAt,
                  )}
                />
              </div>
            </div>
          </section>

          {membership.approvedAt && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">
                    Membership Decision
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Decision recorded on{" "}
                    {formatDate(
                      membership.approvedAt,
                    )}
                  </p>
                </div>
              </div>
            </section>
          )}

          {membership.rejectionReason && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <h2 className="text-sm font-semibold text-red-800">
                    Rejection Reason
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-red-700">
                    {membership.rejectionReason}
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function UserAvatar({
  user,
}: {
  user: CurrentUser;
}) {
  const [imageError, setImageError] = useState(false);

  if (user.profileImage && !imageError) {
    return (
      <img
        src={user.profileImage}
        alt={getFullName(user)}
        onError={() => setImageError(true)}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }

  const initials = `${user.firstName?.charAt(0) ?? ""}${
    user.lastName?.charAt(0) ?? ""
  }`.toUpperCase();

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
      {initials || "U"}
    </div>
  );
}

function MembershipInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <span className="text-[var(--primary)]">
          {icon}
        </span>
        <span>{label}</span>
      </div>

      <p className="mt-1.5 break-words text-sm font-medium text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function InfoPoint({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-center gap-2">
        <span className="text-[var(--primary)]">
          {icon}
        </span>

        <span className="text-xs font-semibold text-[var(--foreground)]">
          {title}
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
        {text}
      </p>
    </div>
  );
}