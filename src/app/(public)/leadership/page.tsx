"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  UserRound,
} from "lucide-react";

import { api } from "@/lib/api";
import Container from "@/components/ui/Container";

type LeadershipPosition =
  | "IEEE_COUNSELOR"
  | "FACULTY_ADVISOR"
  | "FACULTY_MEMBER"
  | "CHAIRMAN"
  | "VICE_CHAIRMAN"
  | "JOINT_SECRETARY"
  | "WEBMASTER"
  | "PHOTOGRAPHER"
  | "TREASURER";

type LeadershipMember = {
  id: string;
  position: LeadershipPosition;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    profileImage: string | null;
    bio: string | null;
    ieeeMembershipNumber: string | null;
  };
};

type LeadershipResponse = {
  success: boolean;
  message?: string;
  data: LeadershipMember[];
};

const POSITION_LABELS: Record<
  LeadershipPosition,
  string
> = {
  IEEE_COUNSELOR: "IEEE Counselor",
  FACULTY_ADVISOR: "Faculty Advisor",
  FACULTY_MEMBER: "Faculty Member",
  CHAIRMAN: "Chairman",
  VICE_CHAIRMAN: "Vice Chairman",
  JOINT_SECRETARY: "Joint Secretary",
  WEBMASTER: "Webmaster",
  PHOTOGRAPHER: "Photographer",
  TREASURER: "Treasurer",
};

const POSITION_DESCRIPTIONS: Record<
  LeadershipPosition,
  string
> = {
  IEEE_COUNSELOR:
    "Faculty guidance and branch mentorship",
  FACULTY_ADVISOR:
    "Supports the branch through academic and institutional guidance",
  FACULTY_MEMBER:
    "Faculty support and academic guidance",
  CHAIRMAN:
    "Leads the student branch",
  VICE_CHAIRMAN:
    "Supports branch leadership and operations",
  JOINT_SECRETARY:
    "Coordinates branch activities and communication",
  WEBMASTER:
    "Manages the branch's digital platform",
  PHOTOGRAPHER:
    "Documents branch activities and events",
  TREASURER:
    "Supports financial administration",
};

function getFullName(member: LeadershipMember) {
  return [member.user.firstName, member.user.lastName]
    .filter(Boolean)
    .join(" ");
}

function getInitials(member: LeadershipMember) {
  const first =
    member.user.firstName?.charAt(0) ?? "";

  const last =
    member.user.lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load the current leadership team.";
}

function PersonCard({
  member,
  position,
  featured = false,
}: {
  member?: LeadershipMember;
  position: LeadershipPosition;
  featured?: boolean;
}) {
  const isVacant = !member;

  const name = member
    ? getFullName(member)
    : "Position Vacant";

  const initials = member
    ? getInitials(member)
    : "";

  const membershipId =
    member?.user.ieeeMembershipNumber ?? null;

  return (
    <article
      className={[
        "group relative w-full overflow-hidden rounded-2xl",
        "border border-[var(--border)]",
        "bg-[var(--surface)]",
        "shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
        "transition-all duration-200",
        "hover:-translate-y-1",
        "hover:shadow-[0_14px_40px_rgba(15,23,42,0.10)]",
        featured
          ? "max-w-[350px] p-6"
          : "max-w-[310px] p-4",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-x-0 top-0 h-1",
          isVacant
            ? "bg-[var(--border)]"
            : "bg-[var(--primary)]",
        ].join(" ")}
      />

      <div
        className={[
          "flex items-center",
          featured ? "gap-4" : "gap-3",
        ].join(" ")}
      >
        <div
          className={[
            "shrink-0 overflow-hidden rounded-full",
            "border-2",
            isVacant
              ? "border-[var(--border)] bg-[var(--background)]"
              : "border-[var(--primary)]/20 bg-[var(--background)]",
            featured
              ? "h-[72px] w-[72px]"
              : "h-[58px] w-[58px]",
          ].join(" ")}
        >
          {member?.user.profileImage ? (
            <img
              src={member.user.profileImage}
              alt={name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {member && initials ? (
                <span className="text-sm font-bold text-[var(--primary)]">
                  {initials}
                </span>
              ) : (
                <UserRound
                  className={[
                    featured
                      ? "h-7 w-7"
                      : "h-5 w-5",
                    "text-[var(--muted-foreground)]",
                  ].join(" ")}
                />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={[
              "inline-flex max-w-full rounded-full px-2.5 py-1",
              isVacant
                ? "border border-[var(--border)] bg-[var(--background)]"
                : "bg-[var(--primary)]",
            ].join(" ")}
          >
            <span
              className={[
                "truncate text-[10px] font-bold uppercase tracking-[0.08em]",
                isVacant
                  ? "text-[var(--muted-foreground)]"
                  : "text-white",
              ].join(" ")}
            >
              {POSITION_LABELS[position]}
            </span>
          </div>

          <h3
            className={[
              "mt-2 truncate font-bold",
              featured ? "text-lg" : "text-base",
              isVacant
                ? "text-[var(--muted-foreground)]"
                : "text-[var(--foreground)]",
            ].join(" ")}
          >
            {name}
          </h3>

          {member && membershipId && (
            <p className="mt-1 truncate text-xs font-medium text-[var(--primary)]">
              IEEE Membership ID: {membershipId}
            </p>
          )}

          {member && !membershipId && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              IEEE Membership ID not available
            </p>
          )}

          {isVacant && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              This position is currently unassigned
            </p>
          )}
        </div>
      </div>

      {!isVacant && featured && (
        <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {POSITION_DESCRIPTIONS[position]}
        </p>
      )}
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
        {eyebrow}
      </span>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
        {description}
      </p>
    </div>
  );
}

function FacultyTree({
  counselor,
  facultyAdvisor,
  facultyMember,
}: {
  counselor?: LeadershipMember;
  facultyAdvisor?: LeadershipMember;
  facultyMember?: LeadershipMember;
}) {
  return (
    <section>
      <SectionHeading
        eyebrow="Faculty Leadership"
        title="Faculty Leadership"
        description="Guiding, supporting, and mentoring the IEEE student community."
      />

      <div className="relative mt-12">
        <div className="flex justify-center">
          <PersonCard
            member={counselor}
            position="IEEE_COUNSELOR"
            featured
          />
        </div>

        <div className="relative mx-auto h-24 w-full max-w-3xl">
          <svg
            className="absolute inset-0 hidden h-full w-full sm:block"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M400 0 C400 30 400 42 270 58 C220 64 170 70 150 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            <path
              d="M400 0 C400 30 400 42 530 58 C580 64 630 70 650 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            <circle
              cx="400"
              cy="3"
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />

            <circle
              cx="150"
              cy="97"
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />

            <circle
              cx="650"
              cy="97"
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />
          </svg>

          <svg
            className="absolute inset-0 h-full w-full sm:hidden"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M50 0 C50 25 35 35 50 52 C65 68 50 75 50 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            <circle
              cx="50"
              cy="3"
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />

            <circle
              cx="50"
              cy="97"
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-8">
          <PersonCard
            member={facultyAdvisor}
            position="FACULTY_ADVISOR"
          />

          <PersonCard
            member={facultyMember}
            position="FACULTY_MEMBER"
          />
        </div>
      </div>
    </section>
  );
}

function VerticalConnector() {
  return (
    <div
      aria-hidden="true"
      className="relative h-12 w-10"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 40 48"
        preserveAspectRatio="none"
      >
        <path
          d="M20 0 C20 14 31 18 31 27 C31 36 20 36 20 48"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />

        <circle
          cx="20"
          cy="2"
          r="3"
          fill="var(--primary)"
          fillOpacity="0.8"
        />

        <circle
          cx="20"
          cy="46"
          r="3"
          fill="var(--primary)"
          fillOpacity="0.8"
        />
      </svg>
    </div>
  );
}

function StudentTree({
  chairman,
  viceChairman,
  jointSecretary,
  webmaster,
  photographer,
  treasurer,
}: {
  chairman?: LeadershipMember;
  viceChairman?: LeadershipMember;
  jointSecretary?: LeadershipMember;
  webmaster?: LeadershipMember;
  photographer?: LeadershipMember;
  treasurer?: LeadershipMember;
}) {
  return (
    <section className="mt-20 sm:mt-24">
      <SectionHeading
        eyebrow="Student Branch"
        title="Student Branch Leadership"
        description="A coordinated leadership structure driving activities, collaboration, and innovation."
      />

      <div className="mt-10">
        <div className="flex justify-center">
          <PersonCard
            member={chairman}
            position="CHAIRMAN"
            featured
          />
        </div>

        <div className="flex justify-center">
          <VerticalConnector />
        </div>

        <div className="flex justify-center">
          <PersonCard
            member={viceChairman}
            position="VICE_CHAIRMAN"
          />
        </div>

        <div className="flex justify-center">
          <VerticalConnector />
        </div>

        <div className="flex justify-center">
          <PersonCard
            member={jointSecretary}
            position="JOINT_SECRETARY"
          />
        </div>

        <div className="relative mx-auto mt-8 max-w-6xl">
          <svg
            className="absolute left-1/2 top-0 hidden h-16 w-full -translate-x-1/2 sm:block"
            viewBox="0 0 1200 70"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M600 0 C600 18 600 28 390 42 C270 50 210 55 180 70"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            <path
              d="M600 0 C600 25 600 35 600 70"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            <path
              d="M600 0 C600 18 600 28 810 42 C930 50 990 55 1020 70"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            <circle
              cx="600"
              cy="3"
              r="4"
              fill="var(--primary)"
              fillOpacity="0.8"
            />
          </svg>

          <div className="flex justify-center sm:hidden">
            <VerticalConnector />
          </div>

          <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-3 sm:gap-8 sm:pt-16">
            <div className="relative flex justify-center">
              <PersonCard
                member={webmaster}
                position="WEBMASTER"
              />
            </div>

            <div className="relative flex justify-center">
              <PersonCard
                member={photographer}
                position="PHOTOGRAPHER"
              />
            </div>

            <div className="relative flex justify-center">
              <PersonCard
                member={treasurer}
                position="TREASURER"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LeadershipPage() {
  const [leadership, setLeadership] = useState<
    LeadershipMember[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function loadLeadership() {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await api.get<LeadershipResponse>(
            "/users/leadership",
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Failed to load leadership.",
          );
        }

        if (!mounted) {
          return;
        }

        const currentLeadership =
          response.data.data.filter(
            (member) =>
              member.isCurrent &&
              member.user,
          );

        setLeadership(currentLeadership);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setError(getErrorMessage(error));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLeadership();

    return () => {
      mounted = false;
    };
  }, []);

  const structure = useMemo(() => {
    function find(
      position: LeadershipPosition,
    ) {
      return leadership.find(
        (member) =>
          member.position === position,
      );
    }

    return {
      counselor:
        find("IEEE_COUNSELOR"),

      facultyAdvisor:
        find("FACULTY_ADVISOR"),

      facultyMember:
        find("FACULTY_MEMBER"),

      chairman:
        find("CHAIRMAN"),

      viceChairman:
        find("VICE_CHAIRMAN"),

      jointSecretary:
        find("JOINT_SECRETARY"),

      webmaster:
        find("WEBMASTER"),

      photographer:
        find("PHOTOGRAPHER"),

      treasurer:
        find("TREASURER"),
    };
  }, [leadership]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)]">
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--primary)]/[0.045] blur-3xl" />

          <div className="absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-[var(--primary)]/[0.04] blur-3xl" />
        </div>

        <Container>
          <div className="relative py-16 text-center sm:py-20 lg:py-24">
            <span className="inline-flex rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
              IEEE Geeta University
            </span>

            <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              Meet Our{" "}
              <span className="text-[var(--primary)]">
                Leadership
              </span>{" "}
              Team
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
              Meet the individuals guiding the IEEE
              Geeta University Student Branch and
              contributing to its growth, activities,
              and technical community.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="py-14 sm:py-18 lg:py-20">
            {isLoading && (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                  </div>

                  <p className="mt-4 font-medium text-[var(--foreground)]">
                    Loading leadership
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Fetching the current branch structure...
                  </p>
                </div>
              </div>
            )}

            {!isLoading && error && (
              <div className="mx-auto flex min-h-[420px] max-w-xl items-center justify-center">
                <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/[0.08]">
                    <AlertCircle className="h-6 w-6 text-[var(--primary)]" />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-[var(--foreground)]">
                    Unable to load leadership
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {!isLoading &&
              !error &&
              leadership.length === 0 && (
                <div className="mx-auto flex min-h-[420px] max-w-xl items-center justify-center">
                  <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/[0.08]">
                      <UserRound className="h-6 w-6 text-[var(--primary)]" />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[var(--foreground)]">
                      Leadership information unavailable
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                      No current leadership assignments
                      are available in the branch system yet.
                    </p>
                  </div>
                </div>
              )}

            {!isLoading &&
              !error &&
              leadership.length > 0 && (
                <div>
                  <FacultyTree
                    counselor={structure.counselor}
                    facultyAdvisor={
                      structure.facultyAdvisor
                    }
                    facultyMember={
                      structure.facultyMember
                    }
                  />

                  <StudentTree
                    chairman={structure.chairman}
                    viceChairman={
                      structure.viceChairman
                    }
                    jointSecretary={
                      structure.jointSecretary
                    }
                    webmaster={
                      structure.webmaster
                    }
                    photographer={
                      structure.photographer
                    }
                    treasurer={
                      structure.treasurer
                    }
                  />
                </div>
              )}
          </div>
        </Container>
      </section>
    </main>
  );
}