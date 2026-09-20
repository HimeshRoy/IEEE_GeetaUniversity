"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Hash,
  Loader2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

type MembershipStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "EXPIRED"
  | "REJECTED";

type MemberProfile = {
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

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: string;
  ieeeMembershipNumber: string | null;
  profileImage: string | null;
};

type MembershipApplication = MemberProfile & {
  user?: UserData;
};

function getFullName(user?: UserData) {
  if (!user) {
    return "Unknown applicant";
  }

  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
}

function getInitials(user?: UserData) {
  if (!user) {
    return "U";
  }

  const first = user.firstName?.charAt(0) ?? "";
  const last = user.lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "U";
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

function formatDateTime(value: string | null) {
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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getStatusLabel(status: MembershipStatus) {
  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0) + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function getStatusClasses(status: MembershipStatus) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "SUSPENDED":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "EXPIRED":
      return "border-slate-200 bg-slate-100 text-slate-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]";
  }
}

export default function WebHeadMembership() {
  const [applications, setApplications] = useState<
    MembershipApplication[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState<MembershipApplication | null>(null);

  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] =
    useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/membership/pending");

      const data =
        response.data?.data ?? response.data ?? [];

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid membership response received from the server.",
        );
      }

      setApplications(data);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load membership applications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  useEffect(() => {
    if (!selectedApplication) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !actionLoading) {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [selectedApplication, actionLoading]);

  function closeModal() {
    if (actionLoading) {
      return;
    }

    setSelectedApplication(null);
    setRejecting(false);
    setRejectionReason("");
    setActionError("");
  }

  function openApplication(
    application: MembershipApplication,
  ) {
    setSelectedApplication(application);
    setRejecting(false);
    setRejectionReason("");
    setActionError("");
  }

  async function approveApplication(
    application: MembershipApplication,
  ) {
    if (application.membershipStatus !== "PENDING") {
      return;
    }

    try {
      setActionLoading(application.id);
      setActionError("");

      await api.patch(
        `/membership/${application.id}/approve`,
      );

      setApplications((current) =>
        current.filter(
          (item) => item.id !== application.id,
        ),
      );

      closeModal();
    } catch (requestError: any) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to approve this membership application.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectApplication(
    application: MembershipApplication,
  ) {
    if (application.membershipStatus !== "PENDING") {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError(
        "A rejection reason is required.",
      );
      return;
    }

    try {
      setActionLoading(application.id);
      setActionError("");

      await api.patch(
        `/membership/${application.id}/reject`,
        {
          rejectionReason: reason,
        },
      );

      setApplications((current) =>
        current.filter(
          (item) => item.id !== application.id,
        ),
      );

      closeModal();
    } catch (requestError: any) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to reject this membership application.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter((application) => {
      const user = application.user;

      const name = getFullName(user).toLowerCase();
      const email = user?.email?.toLowerCase() ?? "";
      const phone = user?.phone?.toLowerCase() ?? "";
      const ieeeNumber =
        user?.ieeeMembershipNumber?.toLowerCase() ?? "";
      const rollNumber =
        application.rollNumber?.toLowerCase() ?? "";
      const department =
        application.department?.toLowerCase() ?? "";
      const course =
        application.course?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        ieeeNumber.includes(query) ||
        rollNumber.includes(query) ||
        department.includes(query) ||
        course.includes(query)
      );
    });
  }, [applications, search]);

  const pendingCount = applications.filter(
    (application) =>
      application.membershipStatus === "PENDING",
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--muted)]/20" />

          <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[var(--muted)]/20" />

          <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--muted)]/20" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

          <div className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        </div>

        <div className="h-14 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
              />
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="border-b border-[var(--border)] pb-5">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Member Management
        </p>

        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Membership
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Review and process IEEE Geeta University
              Student Branch membership applications.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <Clock3 className="h-3.5 w-3.5" />
            {pendingCount} pending
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-semibold">
              Unable to load membership applications
            </p>

            <p className="mt-0.5">
              {error}
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Pending Applications
              </p>

              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                Review Access
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-600">
                Authorized
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email, IEEE number, roll number or course"
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </section>

      {!error && applications.length === 0 ? (
        <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">
            No pending applications
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            There are currently no membership applications
            waiting for review.
          </p>
        </section>
      ) : !error &&
        filteredApplications.length === 0 ? (
        <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--background)]">
            <Search className="h-6 w-6 text-[var(--muted-foreground)]" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">
            No matching applications
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            No pending application matches your current
            search.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredApplications.map(
            (application) => {
              const user = application.user;
              const fullName = getFullName(user);

              return (
                <article
                  key={application.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)]/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={fullName}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
                        {getInitials(user)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {fullName}
                          </h2>

                          <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                            {user?.email ||
                              "Email not available"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
                    <ApplicationValue
                      icon={
                        <Hash className="h-3.5 w-3.5" />
                      }
                      label="IEEE Membership"
                      value={
                        user?.ieeeMembershipNumber ||
                        "Not provided"
                      }
                    />

                    <ApplicationValue
                      icon={
                        <UserRound className="h-3.5 w-3.5" />
                      }
                      label="Roll Number"
                      value={
                        application.rollNumber ||
                        "Not provided"
                      }
                    />

                    <ApplicationValue
                      icon={
                        <ShieldCheck className="h-3.5 w-3.5" />
                      }
                      label="Course"
                      value={
                        application.course ||
                        "Not provided"
                      }
                    />

                    <ApplicationValue
                      icon={
                        <Clock3 className="h-3.5 w-3.5" />
                      }
                      label="Applied"
                      value={formatDate(
                        application.createdAt,
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openApplication(application)
                    }
                    className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold !text-white transition hover:opacity-90"
                  >
                    Review Application
                  </button>
                </article>
              );
            },
          )}
        </section>
      )}

      {selectedApplication && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-application-title"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
                  Membership Review
                </p>

                <h2
                  id="membership-application-title"
                  className="mt-1 text-lg font-semibold text-slate-900"
                >
                  Application Details
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={Boolean(actionLoading)}
                aria-label="Close application"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-150px)] overflow-y-auto bg-white p-5">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
                {selectedApplication.user?.profileImage ? (
                  <img
                    src={
                      selectedApplication.user.profileImage
                    }
                    alt={getFullName(
                      selectedApplication.user,
                    )}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
                    {getInitials(
                      selectedApplication.user,
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {getFullName(
                      selectedApplication.user,
                    )}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {selectedApplication.user?.email ||
                      "Email not available"}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                      selectedApplication.membershipStatus,
                    )}`}
                  >
                    {getStatusLabel(
                      selectedApplication.membershipStatus,
                    )}
                  </span>
                </div>
              </div>

              {actionError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={
                    selectedApplication.user
                      ?.email || "Not provided"
                  }
                />

                <DetailItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={
                    selectedApplication.user
                      ?.phone || "Not provided"
                  }
                />

                <DetailItem
                  icon={<Hash className="h-4 w-4" />}
                  label="IEEE Membership Number"
                  value={
                    selectedApplication.user
                      ?.ieeeMembershipNumber ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={<Hash className="h-4 w-4" />}
                  label="Roll Number"
                  value={
                    selectedApplication.rollNumber ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={
                    <ShieldCheck className="h-4 w-4" />
                  }
                  label="Department"
                  value={
                    selectedApplication.department ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={
                    <ShieldCheck className="h-4 w-4" />
                  }
                  label="Course"
                  value={
                    selectedApplication.course ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={
                    <UserRound className="h-4 w-4" />
                  }
                  label="Year"
                  value={
                    selectedApplication.year ||
                    "Not provided"
                  }
                />

                <DetailItem
                  icon={
                    <Clock3 className="h-4 w-4" />
                  }
                  label="Application Submitted"
                  value={formatDateTime(
                    selectedApplication.createdAt,
                  )}
                />
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-600">
                    Profile Visibility
                  </p>

                  <span className="text-sm font-medium text-slate-900">
                    {selectedApplication.profileVisibility ||
                      "Not specified"}
                  </span>
                </div>
              </div>

              {selectedApplication.membershipStatus ===
                "PENDING" && (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  {!rejecting ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={() =>
                          void approveApplication(
                            selectedApplication,
                          )
                        }
                        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold !text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading ===
                        selectedApplication.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}

                        {actionLoading ===
                        selectedApplication.id
                          ? "Approving..."
                          : "Approve Membership"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={() => {
                          setRejecting(true);
                          setActionError("");
                        }}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Application
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="rejection-reason"
                        className="text-sm font-semibold text-slate-900"
                      >
                        Rejection Reason
                      </label>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Provide a clear reason that can be
                        communicated to the applicant.
                      </p>

                      <textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(event) => {
                          setRejectionReason(
                            event.target.value,
                          );
                          setActionError("");
                        }}
                        rows={4}
                        maxLength={1000}
                        autoFocus
                        placeholder="Enter the reason for rejecting this application..."
                        className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />

                      <div className="mt-1 flex justify-end text-[11px] text-slate-400">
                        {rejectionReason.length}/1000
                      </div>

                      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          disabled={Boolean(actionLoading)}
                          onClick={() => {
                            setRejecting(false);
                            setRejectionReason("");
                            setActionError("");
                          }}
                          className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={
                            Boolean(actionLoading) ||
                            !rejectionReason.trim()
                          }
                          onClick={() =>
                            void rejectApplication(
                              selectedApplication,
                            )
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold !text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          selectedApplication.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}

                          {actionLoading ===
                          selectedApplication.id
                            ? "Rejecting..."
                            : "Confirm Rejection"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationValue({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[var(--muted-foreground)]">
        {icon}
      </span>

      <span className="text-xs text-[var(--muted-foreground)]">
        {label}
      </span>

      <span className="ml-auto max-w-[55%] truncate text-right text-xs font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="text-blue-600">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <p className="mt-1.5 break-words text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}