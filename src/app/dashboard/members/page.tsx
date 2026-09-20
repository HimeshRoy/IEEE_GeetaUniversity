"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type MemberProfile = {
  membershipStatus: string;
  department: string | null;
  course: string | null;
  year: string | null;
  rollNumber: string | null;
};

type LeadershipPosition = {
  id: string;
  position: string;
  isCurrent: boolean;
};

type Member = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  ieeeMembershipNumber: string | null;
  profileImage: string | null;
  bio: string | null;
  createdAt: string;
  memberProfile: MemberProfile | null;
  leadershipPositions: LeadershipPosition[];
};

function formatRole(role: string) {
  return role.replaceAll("_", " ");
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getRoleClasses(role: string) {
  switch (role) {
    case "WEB_HEAD":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "HOD":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "FACULTY_ADVISOR":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "FACULTY":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "STUDENT":
      return "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]";
    default:
      return "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]";
  }
}

function getMembershipClasses(status: string) {
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
      return "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]";
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMembers() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/members");

        if (!mounted) return;

        const data = response.data?.data ?? response.data ?? [];
        setMembers(Array.isArray(data) ? data : []);
      } catch (requestError: any) {
        if (!mounted) return;

        setError(
          requestError?.response?.data?.message ||
            "Unable to load members.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadMembers();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const fullName =
        `${member.firstName} ${member.lastName ?? ""}`.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.ieeeMembershipNumber
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        member.memberProfile?.rollNumber
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "ALL" || member.role === roleFilter;

      const membershipStatus =
        member.memberProfile?.membershipStatus || "NO PROFILE";

      const matchesStatus =
        statusFilter === "ALL" || membershipStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  const roles = useMemo(
    () => Array.from(new Set(members.map((member) => member.role))).sort(),
    [members],
  );

  const membershipStatuses = useMemo(
    () =>
      Array.from(
        new Set(
          members.map(
            (member) =>
              member.memberProfile?.membershipStatus || "NO PROFILE",
          ),
        ),
      ).sort(),
    [members],
  );

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="mb-7">
          <div className="h-4 w-24 rounded bg-[var(--background)]" />
          <div className="mt-3 h-8 w-64 rounded bg-[var(--background)]" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-[var(--background)]" />
        </div>

        <div className="h-16 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-48 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-base font-semibold text-red-800">
            Unable to load members
          </h1>
          <p className="mt-1.5 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-7">
          <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
            Member Management
          </p>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Member Directory
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                View branch members, faculty, leadership and membership
                information.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Users className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {filteredMembers.length}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {filteredMembers.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, IEEE number or roll number"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            >
              <option value="ALL">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            >
              <option value="ALL">All Membership Status</option>
              {membershipStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-14 text-center">
            <Users className="mx-auto h-8 w-8 text-[var(--muted)]" />
            <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">
              No members found
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              There are currently no users available in the member directory.
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-14 text-center">
            <Search className="mx-auto h-8 w-8 text-[var(--muted)]" />
            <h2 className="mt-3 text-base font-semibold text-[var(--foreground)]">
              No matching members
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Try changing the search or filters.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMembers.map((member) => {
              const fullName =
                `${member.firstName} ${member.lastName ?? ""}`.trim();

              const membershipStatus =
                member.memberProfile?.membershipStatus || "NO PROFILE";

              const currentLeadership =
                member.leadershipPositions?.filter(
                  (position) => position.isCurrent,
                ) ?? [];

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--primary)] hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold !text-white">
                        {member.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-[var(--foreground)]">
                        {fullName}
                      </h2>

                      <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                        {member.email}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getRoleClasses(
                            member.role,
                          )}`}
                        >
                          {formatRole(member.role)}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getMembershipClasses(
                            membershipStatus,
                          )}`}
                        >
                          {formatStatus(membershipStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
                    {member.ieeeMembershipNumber && (
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          IEEE {member.ieeeMembershipNumber}
                        </span>
                      </div>
                    )}

                    {member.memberProfile?.course && (
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {member.memberProfile.course}
                        </span>
                      </div>
                    )}

                    {currentLeadership.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-[var(--primary)]">
                        <UserRound className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {currentLeadership
                            .map((position) =>
                              formatRole(position.position),
                            )
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-[var(--primary)]">
                  Member Profile
                </p>

                <h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">
                  {selectedMember.firstName}{" "}
                  {selectedMember.lastName ?? ""}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                aria-label="Close member profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-3">
                {selectedMember.profileImage ? (
                  <img
                    src={selectedMember.profileImage}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold !text-white">
                    {selectedMember.firstName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {selectedMember.firstName}{" "}
                    {selectedMember.lastName ?? ""}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getRoleClasses(
                        selectedMember.role,
                      )}`}
                    >
                      {formatRole(selectedMember.role)}
                    </span>

                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getMembershipClasses(
                        selectedMember.memberProfile?.membershipStatus ||
                          "NO PROFILE",
                      )}`}
                    >
                      {formatStatus(
                        selectedMember.memberProfile?.membershipStatus ||
                          "NO PROFILE",
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>
                  <p className="mt-1.5 break-all text-sm font-medium text-[var(--foreground)]">
                    {selectedMember.email}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[var(--foreground)]">
                    {selectedMember.phone || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    IEEE Membership
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[var(--foreground)]">
                    {selectedMember.ieeeMembershipNumber ||
                      "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <UserRound className="h-3.5 w-3.5" />
                    Account
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[var(--foreground)]">
                    {selectedMember.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              {selectedMember.memberProfile && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Academic Information
                  </h3>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[var(--muted)]">Department</p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        {selectedMember.memberProfile.department ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--muted)]">Course</p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        {selectedMember.memberProfile.course ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--muted)]">Year</p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        {selectedMember.memberProfile.year ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--muted)]">
                        Roll Number
                      </p>
                      <p className="mt-1 text-sm text-[var(--foreground)]">
                        {selectedMember.memberProfile.rollNumber ||
                          "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMember.leadershipPositions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Leadership
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedMember.leadershipPositions.map((position) => (
                      <span
                        key={position.id}
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          position.isCurrent
                            ? "border-[var(--primary)] bg-[var(--background)] text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {formatRole(position.position)}
                        {position.isCurrent ? " · Current" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMember.bio && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Bio
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {selectedMember.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}