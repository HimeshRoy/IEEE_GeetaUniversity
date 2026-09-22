"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, UserRound } from "lucide-react";

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

const POSITION_LABELS: Record<LeadershipPosition, string> = {
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

const POSITION_DESCRIPTIONS: Record<LeadershipPosition, string> = {
  IEEE_COUNSELOR: "Faculty guidance and branch mentorship",
  FACULTY_ADVISOR: "Supports the branch through academic and institutional guidance",
  FACULTY_MEMBER: "Faculty support and academic guidance",
  CHAIRMAN: "Leads the student branch",
  VICE_CHAIRMAN: "Supports branch leadership and operations",
  JOINT_SECRETARY: "Coordinates branch activities and communication",
  WEBMASTER: "Manages the branch's digital platform",
  PHOTOGRAPHER: "Documents branch activities and events",
  TREASURER: "Supports financial administration",
};

function getFullName(member: LeadershipMember) {
  return [member.user.firstName, member.user.lastName].filter(Boolean).join(" ");
}

function getInitials(member: LeadershipMember) {
  const first = member.user.firstName?.charAt(0) ?? "";
  const last = member.user.lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
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
  const name = member ? getFullName(member) : "Position Vacant";
  const initials = member ? getInitials(member) : "";
  const membershipId = member?.user.ieeeMembershipNumber ?? null;

  return (
    <article
      className={[
        "group relative w-full overflow-hidden rounded-2xl mx-auto",
        isVacant
          ? "border-2 border-dashed border-[var(--border)] bg-[var(--surface)]/50"
          : "border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--background)]",
        "shadow-lg shadow-black/[0.03] backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--primary)]/10",
        !isVacant && "hover:border-[var(--primary)]/30",
        featured ? "max-w-[350px] p-6 sm:p-7" : "max-w-[310px] p-4 sm:p-5",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-x-0 top-0 h-1.5 transition-colors duration-300",
          isVacant
            ? "bg-[var(--border)]"
            : "bg-gradient-to-r from-[var(--primary)] to-blue-500 group-hover:to-purple-500",
        ].join(" ")}
      />

      <div className={["flex items-center", featured ? "gap-4 sm:gap-5" : "gap-3 sm:gap-4"].join(" ")}>
        <div
          className={[
            "shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:ring-4",
            isVacant
              ? "border-2 border-dashed border-[var(--border)] bg-[var(--background)] group-hover:ring-[var(--border)]/20"
              : "ring-2 ring-[var(--primary)]/20 ring-offset-2 ring-offset-[var(--background)] bg-[var(--background)] group-hover:ring-[var(--primary)]/40",
            featured ? "h-[64px] w-[64px] sm:h-[76px] sm:w-[76px]" : "h-[54px] w-[54px] sm:h-[64px] sm:w-[64px]",
          ].join(" ")}
        >
          {member?.user.profileImage ? (
            <img
              src={member.user.profileImage}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface)]">
              {member && initials ? (
                <span className="text-base font-bold tracking-wider text-[var(--primary)]">
                  {initials}
                </span>
              ) : (
                <UserRound
                  className={[
                    featured ? "h-7 w-7 sm:h-8 sm:w-8" : "h-5 w-5 sm:h-6 sm:w-6",
                    "text-[var(--muted-foreground)] opacity-60 transition-opacity group-hover:opacity-100",
                  ].join(" ")}
                />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={[
              "inline-flex max-w-full rounded-md px-2 py-0.5",
              isVacant
                ? "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)]"
                : "bg-[var(--primary)]/10 text-[var(--primary)]",
            ].join(" ")}
          >
            <span className="truncate text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
              {POSITION_LABELS[position]}
            </span>
          </div>

          <h3
            className={[
              "mt-2 sm:mt-2.5 truncate font-bold tracking-tight",
              featured ? "text-lg sm:text-xl" : "text-base sm:text-lg",
              isVacant ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]",
            ].join(" ")}
          >
            {name}
          </h3>

          {member && membershipId && (
            <p className="mt-1 truncate text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
              ID: {membershipId}
            </p>
          )}

          {member && !membershipId && (
            <p className="mt-1 text-[11px] sm:text-xs text-[var(--muted-foreground)] opacity-70">
              ID not available
            </p>
          )}

          {isVacant && (
            <p className="mt-1 text-[11px] sm:text-xs text-[var(--muted-foreground)] opacity-70">
              Currently unassigned
            </p>
          )}
        </div>
      </div>

      {!isVacant && featured && (
        <p className="mt-4 sm:mt-5 border-t border-[var(--border)]/60 pt-3 sm:pt-4 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
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
    <div className="mx-auto max-w-2xl text-center px-4 sm:px-0">
      <span className="inline-flex rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] backdrop-blur-md">
        {eyebrow}
      </span>

      <h2 className="mt-4 sm:mt-5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>

      <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

function VerticalConnector() {
  return (
    <div aria-hidden="true" className="relative h-12 sm:h-14 w-10 -my-2 sm:-my-3 z-0 flex justify-center">
      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
      <svg className="absolute inset-0 h-full w-full drop-shadow-sm" viewBox="0 0 40 48" preserveAspectRatio="none">
        <path
          d="M20 0 L20 48"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
          style={{ animation: 'dash-flow 20s linear infinite' }}
        />
      </svg>
      {/* Absolute Dots prevent oval stretching */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-primary/60" />
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

      <div className="relative mt-12 sm:mt-16 flex flex-col items-center">
        {/* Top Node */}
        <div className="relative z-10 w-full flex justify-center px-4">
          <PersonCard member={counselor} position="IEEE_COUNSELOR" featured />
        </div>

        {/* Mobile Vertical Connector */}
        <div className="sm:hidden flex justify-center -my-2 relative z-0">
          <VerticalConnector />
        </div>

        {/* Desktop SVG Branch (1 to 2) */}
        <div className="relative h-16 sm:h-20 w-full max-w-4xl -my-2 z-0 hidden sm:block">
          <svg
            className="absolute inset-0 h-full w-full drop-shadow-md"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M50 0 C50 50, 25 50, 25 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M50 0 C50 50, 75 50, 75 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
          <div className="absolute bottom-0 left-[25%] -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-primary/70" />
          <div className="absolute bottom-0 left-[75%] -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-primary/70" />
        </div>

        {/* Bottom Nodes (No gap to preserve exact 25% / 75% alignment) */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 relative z-10">
          <div className="px-4 flex flex-col items-center">
            <PersonCard member={facultyAdvisor} position="FACULTY_ADVISOR" />
            <div className="sm:hidden flex justify-center -mb-8 mt-2 relative z-0">
              <VerticalConnector />
            </div>
          </div>
          <div className="px-4 flex flex-col items-center mt-6 sm:mt-0">
            <PersonCard member={facultyMember} position="FACULTY_MEMBER" />
          </div>
        </div>
      </div>
    </section>
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
    <section className="mt-24 sm:mt-32">
      <SectionHeading
        eyebrow="Student Branch"
        title="Student Branch Leadership"
        description="A coordinated leadership structure driving activities, collaboration, and innovation."
      />

      <div className="mt-12 sm:mt-16 flex flex-col items-center">
        {/* Core Hierarchy Chain */}
        <div className="relative z-10 w-full flex justify-center px-4">
          <PersonCard member={chairman} position="CHAIRMAN" featured />
        </div>

        <VerticalConnector />

        <div className="relative z-10 w-full flex justify-center px-4">
          <PersonCard member={viceChairman} position="VICE_CHAIRMAN" />
        </div>

        <VerticalConnector />

        <div className="relative z-10 w-full flex justify-center px-4">
          <PersonCard member={jointSecretary} position="JOINT_SECRETARY" />
        </div>

        {/* Mobile Vertical Connector */}
        <div className="sm:hidden flex justify-center -my-2 relative z-0">
          <VerticalConnector />
        </div>

        {/* Desktop SVG Branch (1 to 3) */}
        <div className="relative h-16 sm:h-20 w-full max-w-5xl -my-2 z-0 hidden sm:block">
          <svg
            className="absolute inset-0 h-full w-full drop-shadow-md"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M50 0 C50 50, 16.66 50, 16.66 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M50 0 L50 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M50 0 C50 50, 83.33 50, 83.33 100"
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
          <div className="absolute bottom-0 left-[16.66%] -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-primary/70" />
          <div className="absolute bottom-0 left-[50%] -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-primary/70" />
          <div className="absolute bottom-0 left-[83.33%] -translate-x-1/2 translate-y-1/2 h-2 w-2 rounded-full bg-primary/70" />
        </div>

        {/* Bottom Nodes (No gap to preserve exact 16.66% / 50% / 83.33% alignment) */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 relative z-10">
          <div className="px-3 flex flex-col items-center">
            <PersonCard member={webmaster} position="WEBMASTER" />
            <div className="sm:hidden flex justify-center -mb-8 mt-2 relative z-0">
              <VerticalConnector />
            </div>
          </div>
          <div className="px-3 flex flex-col items-center mt-6 sm:mt-0">
            <PersonCard member={photographer} position="PHOTOGRAPHER" />
            <div className="sm:hidden flex justify-center -mb-8 mt-2 relative z-0">
              <VerticalConnector />
            </div>
          </div>
          <div className="px-3 flex flex-col items-center mt-6 sm:mt-0">
            <PersonCard member={treasurer} position="TREASURER" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LeadershipPage() {
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLeadership() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get<LeadershipResponse>("/users/leadership");

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to load leadership.");
        }

        if (!mounted) return;

        const currentLeadership = response.data.data.filter(
          (member) => member.isCurrent && member.user
        );

        setLeadership(currentLeadership);
      } catch (error) {
        if (!mounted) return;
        setError(getErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadLeadership();
    return () => { mounted = false; };
  }, []);

  const structure = useMemo(() => {
    function find(position: LeadershipPosition) {
      return leadership.find((member) => member.position === position);
    }

    return {
      counselor: find("IEEE_COUNSELOR"),
      facultyAdvisor: find("FACULTY_ADVISOR"),
      facultyMember: find("FACULTY_MEMBER"),
      chairman: find("CHAIRMAN"),
      viceChairman: find("VICE_CHAIRMAN"),
      jointSecretary: find("JOINT_SECRETARY"),
      webmaster: find("WEBMASTER"),
      photographer: find("PHOTOGRAPHER"),
      treasurer: find("TREASURER"),
    };
  }, [leadership]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] pb-24">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface)]/40 to-transparent">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[400px] w-[400px] sm:h-[500px] sm:w-[500px] rounded-full bg-[var(--primary)]/[0.06] blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -right-40 top-20 h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] rounded-full bg-blue-500/[0.04] blur-3xl animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        </div>

        <Container>
          <div className="relative py-16 text-center sm:py-24 lg:py-28 px-4 sm:px-0">
            <span className="inline-flex rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] shadow-sm backdrop-blur-md">
              IEEE Geeta University
            </span>

            <h1 className="mx-auto mt-5 sm:mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Meet Our{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-blue-500 bg-clip-text text-transparent">
                Leadership
              </span>{" "}
              Team
            </h1>

            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 text-[var(--muted-foreground)]">
              Meet the individuals guiding the IEEE Geeta University Student Branch and contributing to its growth, activities, and technical community.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="py-14 sm:py-20 lg:py-24">
            {isLoading && (
              <div className="flex min-h-[400px] sm:min-h-[500px] items-center justify-center">
                <div className="flex flex-col items-center text-center animate-in fade-in duration-500 px-4">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/5">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
                  </div>
                  <p className="mt-4 sm:mt-5 font-semibold text-[var(--foreground)]">Loading leadership</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Fetching the current branch structure...</p>
                </div>
              </div>
            )}

            {!isLoading && error && (
              <div className="mx-auto flex min-h-[400px] max-w-xl items-center justify-center px-4">
                <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-8 sm:p-10 text-center shadow-sm backdrop-blur-sm">
                  <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-500/10">
                    <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" />
                  </div>
                  <h2 className="mt-5 sm:mt-6 text-lg sm:text-xl font-bold text-[var(--foreground)]">Unable to load leadership</h2>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">{error}</p>
                </div>
              </div>
            )}

            {!isLoading && !error && leadership.length === 0 && (
              <div className="mx-auto flex min-h-[400px] max-w-xl items-center justify-center px-4">
                <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 sm:p-10 text-center shadow-sm backdrop-blur-sm">
                  <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[var(--primary)]/10">
                    <UserRound className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--primary)]" />
                  </div>
                  <h2 className="mt-5 sm:mt-6 text-lg sm:text-xl font-bold text-[var(--foreground)]">Leadership unavailable</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
                    No current leadership assignments are available in the branch system yet.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !error && leadership.length > 0 && (
              <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
                <FacultyTree
                  counselor={structure.counselor}
                  facultyAdvisor={structure.facultyAdvisor}
                  facultyMember={structure.facultyMember}
                />

                <StudentTree
                  chairman={structure.chairman}
                  viceChairman={structure.viceChairman}
                  jointSecretary={structure.jointSecretary}
                  webmaster={structure.webmaster}
                  photographer={structure.photographer}
                  treasurer={structure.treasurer}
                />
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}