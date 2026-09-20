"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Globe2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import {
  applyForMembership,
  getMyMembership,
} from "@/services/membership.service";

type MembershipData = {
  id: string;
  userId: string;
  membershipStatus: string;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    ieeeMembershipNumber: string | null;
  };
};

const benefits = [
  {
    icon: BookOpen,
    title: "Learn",
    description:
      "Participate in technical sessions, workshops, talks, and learning activities.",
  },
  {
    icon: Users,
    title: "Connect",
    description:
      "Meet students, faculty, and fellow technology enthusiasts within the university community.",
  },
  {
    icon: Zap,
    title: "Build",
    description:
      "Work on projects, competitions, events, and activities that turn ideas into experience.",
  },
  {
    icon: Globe2,
    title: "Grow",
    description:
      "Develop your technical, professional, and leadership experience through IEEE activities.",
  },
];

export default function MembershipPage() {
  const [membership, setMembership] =
    useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadMembership() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyMembership();

      if (response?.success) {
        setMembership(response.data ?? null);
      } else {
        setMembership(null);
      }
    } catch (err: any) {
      if (
        err?.response?.status === 401 ||
        err?.response?.status === 404
      ) {
        setMembership(null);
        setError("");
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load membership details.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    try {
      setApplying(true);
      setError("");
      setSuccess("");

      const response = await applyForMembership();

      if (response?.success) {
        setMembership(response.data);
        setSuccess(
          "Your registration has been submitted successfully.",
        );
      } else {
        setError(
          response?.message ||
            "Unable to submit your registration.",
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to submit your registration.",
      );
    } finally {
      setApplying(false);
    }
  }

  useEffect(() => {
    loadMembership();
  }, []);

  const status = membership?.membershipStatus?.toUpperCase();

  return (
    <main className="bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
              <Award className="h-3.5 w-3.5" />
              IEEE Geeta University Student Branch
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Register with IEEE
              <span className="block text-[var(--primary)]">
                Geeta University Student Branch
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Join the IEEE community at Geeta University and take part in
              technical events, workshops, projects, competitions, and
              student activities.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {membership ? (
                <a
                  href="#membership-status"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
                >
                  View Registration Status
                  <ArrowRight className="h-4 w-4 !text-white" />
                </a>
              ) : (
                <Link
                  href="/login?redirect=/membership"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold !text-white transition hover:opacity-90"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4 !text-white" />
                </Link>
              )}

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Join the branch
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              A place to learn, participate and grow
            </h2>

            <p className="mt-5 text-base leading-7 text-[var(--muted-foreground)]">
              Registration with the IEEE Geeta University Student Branch
              gives students an opportunity to actively participate in the
              technical and professional activities organized by the branch.
            </p>

            <p className="mt-4 text-base leading-7 text-[var(--muted-foreground)]">
              From technical workshops and projects to competitions and
              student-led initiatives, the branch provides a platform to
              develop practical experience alongside your academic journey.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]">
                <Award className="h-6 w-6 !text-white" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  IEEE Geeta University
                </h3>

                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Student Branch registration
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Create your account, submit your registration, and wait for
                the authorized branch administration to review your
                application.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="border-y border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Why register
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Get involved beyond the classroom
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]">
                    <Icon className="h-5 w-5 !text-white" />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-[var(--foreground)]">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Registration process
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Register in three simple steps
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <ProcessStep
            number="01"
            title="Create your account"
            description="Create your account on the IEEE Geeta University Student Branch platform."
          />

          <ProcessStep
            number="02"
            title="Register with the branch"
            description="Submit your registration through your account with a single application."
          />

          <ProcessStep
            number="03"
            title="Get reviewed"
            description="Your registration is reviewed by the authorized branch administration."
          />
        </div>
      </section>

      <section
        id="membership-status"
        className="border-y border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          {loading ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />

                <p className="text-sm text-[var(--muted-foreground)]">
                  Checking your registration status...
                </p>
              </div>
            </div>
          ) : membership ? (
            <MembershipStatus
              membership={membership}
              status={status}
              success={success}
            />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadMembership}
                className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-[var(--primary)]">
              <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] !text-white/70">
                    Ready to register?
                  </p>

                  <h2 className="mt-3 text-2xl font-bold !text-white sm:text-3xl">
                    Register with the IEEE Geeta University Student Branch.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 !text-white/75 sm:text-base">
                    Create your account and submit your registration. Your
                    application will then be reviewed by the authorized
                    branch administration.
                  </p>
                </div>

                <Link
                  href="/login?redirect=/membership"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold !text-[var(--primary)] transition hover:bg-white/90"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4 !text-[var(--primary)]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <span className="text-sm font-bold text-[var(--primary)]">
        {number}
      </span>

      <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

function MembershipStatus({
  membership,
  status,
  success,
}: {
  membership: MembershipData;
  status?: string;
  success: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Your registration
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {membership.user?.firstName}{" "}
            {membership.user?.lastName || ""}
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {membership.user?.email}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          label="IEEE Membership Number"
          value={
            membership.user?.ieeeMembershipNumber ||
            "Not available"
          }
        />

        <InfoCard
          label="Registration Date"
          value={formatDate(membership.createdAt)}
        />

        <InfoCard
          label="Joined Date"
          value={
            membership.joinedAt
              ? formatDate(membership.joinedAt)
              : "Not available"
          }
        />
      </div>

      <div className="mt-6">
        {status === "PENDING" && (
          <StatusMessage
            icon={Clock3}
            title="Registration under review"
            text="Your registration has been submitted and is waiting for approval from the branch administration."
            className="border-amber-200 bg-amber-50 text-amber-900"
            iconClassName="text-amber-600"
          />
        )}

        {status === "ACTIVE" && (
          <StatusMessage
            icon={CheckCircle2}
            title="Registration approved"
            text="You are registered with the IEEE Geeta University Student Branch."
            className="border-emerald-200 bg-emerald-50 text-emerald-900"
            iconClassName="text-emerald-600"
          />
        )}

        {status === "REJECTED" && (
          <StatusMessage
            icon={XCircle}
            title="Registration rejected"
            text={
              membership.rejectionReason ||
              "No rejection reason was provided."
            }
            className="border-red-200 bg-red-50 text-red-900"
            iconClassName="text-red-600"
          />
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusMessage({
  icon: Icon,
  title,
  text,
  className,
  iconClassName,
}: {
  icon: typeof Clock3;
  title: string;
  text: string;
  className: string;
  iconClassName: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${className}`}>
      <div className="flex gap-4">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} />

        <div>
          <h3 className="text-sm font-semibold">{title}</h3>

          <p className="mt-1 text-sm leading-6 opacity-80">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    ACTIVE:
      "border-emerald-200 bg-emerald-100 text-emerald-700",
    PENDING:
      "border-amber-200 bg-amber-100 text-amber-700",
    REJECTED:
      "border-red-200 bg-red-100 text-red-700",
    SUSPENDED:
      "border-red-200 bg-red-100 text-red-700",
    EXPIRED:
      "border-gray-200 bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
        styles[status || ""] ||
        "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}