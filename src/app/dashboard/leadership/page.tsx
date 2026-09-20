"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type BranchPosition =
  | "IEEE_COUNSELOR"
  | "FACULTY_MEMBER"
  | "CHAIRMAN"
  | "VICE_CHAIRMAN"
  | "JOINT_SECRETARY"
  | "WEBMASTER"
  | "PHOTOGRAPHER"
  | "TREASURER";

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type MemberProfile = {
  id: string;
  userId: string;
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
  isActive: boolean;
  ieeeMembershipNumber: string | null;
  profileImage: string | null;
  memberProfile: MemberProfile | null;
};

type Leadership = {
  id: string;
  userId: string;
  position: BranchPosition;
  academicYearId: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  academicYear?: AcademicYear;
};

const positions: {
  value: BranchPosition;
  label: string;
}[] = [
  {
    value: "IEEE_COUNSELOR",
    label: "IEEE Counselor",
  },
  {
    value: "FACULTY_MEMBER",
    label: "Faculty Member",
  },
  {
    value: "CHAIRMAN",
    label: "Chairman",
  },
  {
    value: "VICE_CHAIRMAN",
    label: "Vice Chairman",
  },
  {
    value: "JOINT_SECRETARY",
    label: "Joint Secretary",
  },
  {
    value: "WEBMASTER",
    label: "Webmaster",
  },
  {
    value: "PHOTOGRAPHER",
    label: "Photographer",
  },
  {
    value: "TREASURER",
    label: "Treasurer",
  },
];

const studentPositions: BranchPosition[] = [
  "CHAIRMAN",
  "VICE_CHAIRMAN",
  "JOINT_SECRETARY",
  "PHOTOGRAPHER",
  "TREASURER",
];

function positionLabel(position: string) {
  return (
    positions.find((item) => item.value === position)?.label ||
    position
      .split("_")
      .map((item) => item.charAt(0) + item.slice(1).toLowerCase())
      .join(" ")
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getFullName(user?: User) {
  if (!user) {
    return "Unknown member";
  }

  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
}

function getInitials(user?: User) {
  if (!user) {
    return "U";
  }

  return (
    `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
      .toUpperCase()
      .trim() || "U"
  );
}

function normalizeLeadership(item: unknown): Leadership {
  const value = item as Record<string, unknown>;

  return {
    id: String(value.id ?? ""),
    userId: String(value.userId ?? ""),
    position: value.position as BranchPosition,
    academicYearId: String(value.academicYearId ?? ""),
    startDate: (value.startDate as string | null) ?? null,
    endDate: (value.endDate as string | null) ?? null,
    isCurrent: Boolean(value.isCurrent),
    createdAt: String(value.createdAt ?? ""),
    updatedAt: String(value.updatedAt ?? ""),
    user: value.user as User | undefined,
    academicYear: value.academicYear as AcademicYear | undefined,
  };
}

function canSelectUser(user: User, position: BranchPosition) {
  if (!user.isActive) {
    return false;
  }

  if (position === "IEEE_COUNSELOR") {
    return user.role === "IEEE_COUNSELOR";
  }

  if (position === "FACULTY_MEMBER") {
    return user.role === "FACULTY_MEMBER";
  }

  if (position === "WEBMASTER") {
    return user.role === "WEBMASTER";
  }

  if (studentPositions.includes(position)) {
    return (
      user.role === position &&
      user.memberProfile?.membershipStatus === "ACTIVE"
    );
  }

  return false;
}

export default function BranchLeadershipPage() {
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPosition, setSelectedPosition] =
    useState<BranchPosition>("CHAIRMAN");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [userSearch, setUserSearch] = useState("");

  const [yearName, setYearName] = useState("");
  const [yearStartDate, setYearStartDate] = useState("");
  const [yearEndDate, setYearEndDate] = useState("");
  const [yearIsCurrent, setYearIsCurrent] = useState(false);

  const [selectedLeadership, setSelectedLeadership] =
    useState<Leadership | null>(null);

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");

      const [
        leadershipResponse,
        usersResponse,
        academicYearsResponse,
      ] = await Promise.all([
        api.get("/users/leadership"),
        api.get("/users"),
        api.get("/academic-years"),
      ]);

      const leadershipData =
        leadershipResponse.data?.data ??
        leadershipResponse.data ??
        [];

      const usersData =
        usersResponse.data?.data ??
        usersResponse.data ??
        [];

      const academicYearsData =
        academicYearsResponse.data?.data ??
        academicYearsResponse.data ??
        [];

      setLeadership(
        Array.isArray(leadershipData)
          ? leadershipData.map(normalizeLeadership)
          : [],
      );

      setUsers(Array.isArray(usersData) ? usersData : []);

      setAcademicYears(
        Array.isArray(academicYearsData)
          ? academicYearsData
          : [],
      );
    } catch (requestError: unknown) {
      const errorValue = requestError as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        errorValue.response?.data?.message ||
          "Unable to load branch leadership data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData();
  }, []);

  useEffect(() => {
    if (!selectedAcademicYearId && academicYears.length) {
      const currentYear =
        academicYears.find((year) => year.isCurrent) ??
        academicYears[0];

      setSelectedAcademicYearId(currentYear.id);
    }
  }, [academicYears, selectedAcademicYearId]);

  useEffect(() => {
    if (!showAddModal && !showYearModal && !showEditModal && !showDeleteModal) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "";

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" && !modalLoading) {
        return;
      }

      closeAllModals();
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    showAddModal,
    showYearModal,
    showEditModal,
    showDeleteModal,
    modalLoading,
  ]);

  function closeAllModals() {
    if (modalLoading) {
      return;
    }

    setShowAddModal(false);
    setShowYearModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedLeadership(null);
    setActionError("");
    setUserSearch("");
    setSelectedUserId("");
    setSelectedPosition("CHAIRMAN");
    setStartDate("");
    setEndDate("");
    setYearName("");
    setYearStartDate("");
    setYearEndDate("");
    setYearIsCurrent(false);
  }

  function openAddModal() {
    setActionError("");
    setUserSearch("");
    setSelectedUserId("");
    setSelectedPosition("CHAIRMAN");
    setStartDate("");
    setEndDate("");

    const currentYear =
      academicYears.find((year) => year.isCurrent) ??
      academicYears[0];

    setSelectedAcademicYearId(currentYear?.id ?? "");
    setShowAddModal(true);
  }

  function openEditModal(item: Leadership) {
    setSelectedLeadership(item);
    setSelectedUserId(item.userId);
    setSelectedPosition(item.position);
    setSelectedAcademicYearId(item.academicYearId);
    setStartDate(
      item.startDate
        ? new Date(item.startDate).toISOString().slice(0, 10)
        : "",
    );
    setEndDate(
      item.endDate
        ? new Date(item.endDate).toISOString().slice(0, 10)
        : "",
    );
    setActionError("");
    setShowEditModal(true);
  }

  function openDeleteModal(item: Leadership) {
    setSelectedLeadership(item);
    setActionError("");
    setShowDeleteModal(true);
  }

  function openYearModal() {
    setActionError("");
    setYearName("");
    setYearStartDate("");
    setYearEndDate("");
    setYearIsCurrent(false);
    setShowYearModal(true);
  }

  async function createAcademicYear() {
    if (!yearName.trim()) {
      setActionError("Academic year name is required.");
      return;
    }

    if (!yearStartDate || !yearEndDate) {
      setActionError("Start date and end date are required.");
      return;
    }

    if (
      new Date(yearEndDate).getTime() <=
      new Date(yearStartDate).getTime()
    ) {
      setActionError("End date must be after start date.");
      return;
    }

    try {
      setModalLoading(true);
      setActionError("");

      const response = await api.post("/academic-years", {
        name: yearName.trim(),
        startDate: new Date(
          `${yearStartDate}T00:00:00`,
        ).toISOString(),
        endDate: new Date(
          `${yearEndDate}T23:59:59`,
        ).toISOString(),
        isCurrent: yearIsCurrent,
      });

      const createdYear =
        response.data?.data ??
        response.data;

      if (createdYear?.id) {
        setAcademicYears((current) => {
          const updated = yearIsCurrent
            ? current.map((year) => ({
                ...year,
                isCurrent: false,
              }))
            : current;

          return [createdYear, ...updated];
        });

        setSelectedAcademicYearId(createdYear.id);
      }

      setShowYearModal(false);
      setYearName("");
      setYearStartDate("");
      setYearEndDate("");
      setYearIsCurrent(false);
      setActionError("");
    } catch (requestError: unknown) {
      const errorValue = requestError as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setActionError(
        errorValue.response?.data?.message ||
          "Unable to create academic year.",
      );
    } finally {
      setModalLoading(false);
    }
  }

  async function assignLeadership() {
    if (!selectedUserId) {
      setActionError("Please select a user.");
      return;
    }

    if (!selectedAcademicYearId) {
      setActionError("Please select an academic year.");
      return;
    }

    if (!startDate || !endDate) {
      setActionError("Start date and end date are required.");
      return;
    }

    if (
      new Date(endDate).getTime() <=
      new Date(startDate).getTime()
    ) {
      setActionError("End date must be after start date.");
      return;
    }

    try {
      setModalLoading(true);
      setActionError("");

      const response = await api.post("/users/leadership", {
        userId: selectedUserId,
        position: selectedPosition,
        academicYearId: selectedAcademicYearId,
        startDate: new Date(
          `${startDate}T00:00:00`,
        ).toISOString(),
        endDate: new Date(
          `${endDate}T23:59:59`,
        ).toISOString(),
      });

      const createdLeadership =
        response.data?.data ??
        response.data;

      if (createdLeadership?.id) {
        const selectedUser = users.find(
          (user) => user.id === selectedUserId,
        );

        const academicYear = academicYears.find(
          (year) => year.id === selectedAcademicYearId,
        );

        const normalized = normalizeLeadership({
          ...createdLeadership,
          user:
            createdLeadership.user ??
            selectedUser,
          academicYear:
            createdLeadership.academicYear ??
            academicYear,
        });

        setLeadership((current) => [
          normalized,
          ...current,
        ]);
      } else {
        await loadPageData();
      }

      setShowAddModal(false);
      setSelectedUserId("");
      setSelectedPosition("CHAIRMAN");
      setStartDate("");
      setEndDate("");
      setActionError("");
    } catch (requestError: unknown) {
      const errorValue = requestError as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setActionError(
        errorValue.response?.data?.message ||
          "Unable to assign this leadership position.",
      );
    } finally {
      setModalLoading(false);
    }
  }

  async function updateLeadership() {
    if (!selectedLeadership) {
      return;
    }

    if (!selectedUserId) {
      setActionError("Please select a user.");
      return;
    }

    if (!selectedAcademicYearId) {
      setActionError("Please select an academic year.");
      return;
    }

    if (!startDate || !endDate) {
      setActionError("Start date and end date are required.");
      return;
    }

    if (
      new Date(endDate).getTime() <=
      new Date(startDate).getTime()
    ) {
      setActionError("End date must be after start date.");
      return;
    }

    try {
      setModalLoading(true);
      setActionError("");

      const response = await api.patch(
        `/users/leadership/${selectedLeadership.id}`,
        {
          userId: selectedUserId,
          position: selectedPosition,
          academicYearId: selectedAcademicYearId,
          startDate: new Date(
            `${startDate}T00:00:00`,
          ).toISOString(),
          endDate: new Date(
            `${endDate}T23:59:59`,
          ).toISOString(),
        },
      );

      const updatedLeadership =
        response.data?.data ??
        response.data;

      if (updatedLeadership?.id) {
        const selectedUser = users.find(
          (user) => user.id === selectedUserId,
        );

        const academicYear = academicYears.find(
          (year) => year.id === selectedAcademicYearId,
        );

        const normalized = normalizeLeadership({
          ...updatedLeadership,
          user:
            updatedLeadership.user ??
            selectedUser,
          academicYear:
            updatedLeadership.academicYear ??
            academicYear,
        });

        setLeadership((current) =>
          current.map((item) =>
            item.id === normalized.id
              ? normalized
              : item,
          ),
        );
      } else {
        await loadPageData();
      }

      setShowEditModal(false);
      setSelectedLeadership(null);
      setActionError("");
    } catch (requestError: unknown) {
      const errorValue = requestError as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setActionError(
        errorValue.response?.data?.message ||
          "Unable to update this leadership position.",
      );
    } finally {
      setModalLoading(false);
    }
  }

  async function removeLeadership() {
    if (!selectedLeadership) {
      return;
    }

    try {
      setModalLoading(true);
      setActionError("");

      await api.delete(
        `/users/leadership/${selectedLeadership.id}`,
      );

      setLeadership((current) =>
        current.filter(
          (item) =>
            item.id !== selectedLeadership.id,
        ),
      );

      setShowDeleteModal(false);
      setSelectedLeadership(null);
      setActionError("");
    } catch (requestError: unknown) {
      const errorValue = requestError as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setActionError(
        errorValue.response?.data?.message ||
          "Unable to remove this leadership position.",
      );
    } finally {
      setModalLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      if (!canSelectUser(user, selectedPosition)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = getFullName(user).toLowerCase();
      const email = user.email.toLowerCase();
      const rollNumber =
        user.memberProfile?.rollNumber?.toLowerCase() ?? "";
      const ieeeNumber =
        user.ieeeMembershipNumber?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        rollNumber.includes(query) ||
        ieeeNumber.includes(query)
      );
    });
  }, [
    users,
    userSearch,
    selectedPosition,
  ]);

  const filteredLeadership = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leadership.filter((item) => {
      if (
        yearFilter !== "ALL" &&
        item.academicYearId !== yearFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = getFullName(item.user).toLowerCase();
      const position =
        positionLabel(item.position).toLowerCase();
      const email =
        item.user?.email?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        position.includes(query) ||
        email.includes(query)
      );
    });
  }, [
    leadership,
    search,
    yearFilter,
  ]);

  const currentLeadership = useMemo(
    () =>
      filteredLeadership.filter(
        (item) => item.isCurrent,
      ),
    [filteredLeadership],
  );

  const historicalLeadership = useMemo(
    () =>
      filteredLeadership.filter(
        (item) => !item.isCurrent,
      ),
    [filteredLeadership],
  );

  const currentYear = academicYears.find(
    (year) => year.isCurrent,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--muted-foreground)]/15" />
          <div className="mt-3 h-8 w-72 animate-pulse rounded bg-[var(--muted-foreground)]/15" />
          <div className="mt-2 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--muted-foreground)]/15" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
            />
          ))}
        </div>

        <div className="h-14 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="border-b border-[var(--border)] pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">
              Branch Administration
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Branch Leadership
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Manage IEEE Geeta University Student Branch leadership assignments and academic-year records.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openYearModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
            >
              <CalendarDays className="h-4 w-4" />
              New Academic Year
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold !text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Leadership
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-semibold">
              Unable to load leadership
            </p>

            <p className="mt-0.5">
              {error}
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          iconBackground="bg-blue-50"
          label="Leadership Positions"
          value={String(leadership.length)}
        />

        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          iconBackground="bg-emerald-50"
          label="Current Positions"
          value={String(
            leadership.filter(
              (item) => item.isCurrent,
            ).length,
          )}
        />

        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-amber-600" />}
          iconBackground="bg-amber-50"
          label="Current Academic Year"
          value={
            currentYear?.name ??
            "Not configured"
          }
        />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, position or email"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="relative">
            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(event.target.value)
              }
              className="h-10 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="ALL">
                All Academic Years
              </option>

              {academicYears.map((year) => (
                <option
                  key={year.id}
                  value={year.id}
                >
                  {year.name}
                  {year.isCurrent
                    ? " — Current"
                    : ""}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          </div>
        </div>
      </section>

      {!error && leadership.length === 0 && (
        <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <Users className="h-6 w-6 text-[var(--primary)]" />
          </div>

          <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">
            No leadership assigned
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            Start by creating an academic year or assigning the first branch leadership position.
          </p>
        </section>
      )}

      {!error &&
        leadership.length > 0 &&
        filteredLeadership.length === 0 && (
          <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
            <Search className="mx-auto h-7 w-7 text-[var(--muted-foreground)]" />

            <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">
              No matching leadership
            </h2>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Try a different search or academic year.
            </p>
          </section>
        )}

      {currentLeadership.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Current Leadership
              </h2>

              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                Active branch leadership assignments.
              </p>
            </div>

            {currentYear && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                {currentYear.name}
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentLeadership.map((item) => (
              <LeadershipCard
                key={item.id}
                item={item}
                onClick={() =>
                  setSelectedLeadership(item)
                }
                onEdit={() =>
                  openEditModal(item)
                }
                onDelete={() =>
                  openDeleteModal(item)
                }
              />
            ))}
          </div>
        </section>
      )}

      {historicalLeadership.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Previous Leadership
            </h2>

            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Historical leadership assignments.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {historicalLeadership.map((item) => (
              <LeadershipCard
                key={item.id}
                item={item}
                onClick={() =>
                  setSelectedLeadership(item)
                }
                onEdit={() =>
                  openEditModal(item)
                }
                onDelete={() =>
                  openDeleteModal(item)
                }
              />
            ))}
          </div>
        </section>
      )}

      {selectedLeadership &&
        !showEditModal &&
        !showDeleteModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedLeadership(null);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
                    Leadership Record
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {positionLabel(
                      selectedLeadership.position,
                    )}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedLeadership(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-4">
                  {selectedLeadership.user
                    ?.profileImage ? (
                    <img
                      src={
                        selectedLeadership.user
                          .profileImage
                      }
                      alt={getFullName(
                        selectedLeadership.user,
                      )}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-700">
                      {getInitials(
                        selectedLeadership.user,
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {getFullName(
                        selectedLeadership.user,
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedLeadership.user
                        ?.email ??
                        "Email not available"}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        selectedLeadership.isCurrent
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedLeadership.isCurrent
                        ? "Current"
                        : "Previous"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Position"
                    value={positionLabel(
                      selectedLeadership.position,
                    )}
                  />

                  <DetailItem
                    label="Account Role"
                    value={
                      selectedLeadership.user
                        ?.role ?? "Not available"
                    }
                  />

                  <DetailItem
                    label="Academic Year"
                    value={
                      selectedLeadership
                        .academicYear?.name ??
                      "Not available"
                    }
                  />

                  <DetailItem
                    label="Start Date"
                    value={formatDate(
                      selectedLeadership.startDate,
                    )}
                  />

                  <DetailItem
                    label="End Date"
                    value={formatDate(
                      selectedLeadership.endDate,
                    )}
                  />

                  <DetailItem
                    label="Department"
                    value={
                      selectedLeadership.user
                        ?.memberProfile
                        ?.department ??
                      "Not available"
                    }
                  />
                </div>

                <div className="flex gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        selectedLeadership,
                      )
                    }
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold !text-white hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openDeleteModal(
                        selectedLeadership,
                      )
                    }
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {showAddModal && (
        <LeadershipFormModal
          title="Add Leadership Position"
          description="Assign an eligible existing user to a branch leadership position."
          positions={positions}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          users={filteredUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          academicYears={academicYears}
          selectedAcademicYearId={selectedAcademicYearId}
          setSelectedAcademicYearId={
            setSelectedAcademicYearId
          }
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          actionError={actionError}
          modalLoading={modalLoading}
          onClose={closeAllModals}
          onSubmit={() =>
            void assignLeadership()
          }
          submitLabel="Assign Position"
          openYearModal={openYearModal}
        />
      )}

      {showEditModal && selectedLeadership && (
        <LeadershipFormModal
          title="Update Leadership Position"
          description="Update the assigned user, position, academic year or leadership term."
          positions={positions}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          users={filteredUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          academicYears={academicYears}
          selectedAcademicYearId={selectedAcademicYearId}
          setSelectedAcademicYearId={
            setSelectedAcademicYearId
          }
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          actionError={actionError}
          modalLoading={modalLoading}
          onClose={closeAllModals}
          onSubmit={() =>
            void updateLeadership()
          }
          submitLabel="Save Changes"
          openYearModal={openYearModal}
        />
      )}

      {showDeleteModal && selectedLeadership && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-red-600">
                Remove Leadership
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Remove this position?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This will remove the leadership assignment for{" "}
                <span className="font-semibold text-slate-700">
                  {getFullName(
                    selectedLeadership.user,
                  )}
                </span>
                .
              </p>
            </div>

            <div className="p-5">
              {actionError && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={closeAllModals}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() =>
                    void removeLeadership()
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold !text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {modalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  {modalLoading
                    ? "Removing..."
                    : "Remove Position"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showYearModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
                  Academic Configuration
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  New Academic Year
                </h2>
              </div>

              <button
                type="button"
                disabled={modalLoading}
                onClick={() => {
                  setShowYearModal(false);
                  setActionError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {actionError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Academic Year
                </label>

                <input
                  value={yearName}
                  onChange={(event) => {
                    setYearName(event.target.value);
                    setActionError("");
                  }}
                  placeholder="e.g. 2027-28"
                  maxLength={50}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DateField
                  label="Start Date"
                  value={yearStartDate}
                  onChange={setYearStartDate}
                />

                <DateField
                  label="End Date"
                  value={yearEndDate}
                  onChange={setYearEndDate}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={yearIsCurrent}
                  onChange={(event) => {
                    setYearIsCurrent(
                      event.target.checked,
                    );
                    setActionError("");
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    Set as current academic year
                  </span>

                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    The backend will automatically unset the previous current academic year.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() => {
                    setShowYearModal(false);
                    setActionError("");
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() =>
                    void createAcademicYear()
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold !text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {modalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarDays className="h-4 w-4" />
                  )}

                  {modalLoading
                    ? "Creating..."
                    : "Create Academic Year"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadershipFormModal({
  title,
  description,
  positions,
  selectedPosition,
  setSelectedPosition,
  users,
  userSearch,
  setUserSearch,
  selectedUserId,
  setSelectedUserId,
  academicYears,
  selectedAcademicYearId,
  setSelectedAcademicYearId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  actionError,
  modalLoading,
  onClose,
  onSubmit,
  submitLabel,
  openYearModal,
}: {
  title: string;
  description: string;
  positions: {
    value: BranchPosition;
    label: string;
  }[];
  selectedPosition: BranchPosition;
  setSelectedPosition: (
    value: BranchPosition,
  ) => void;
  users: User[];
  userSearch: string;
  setUserSearch: (
    value: string,
  ) => void;
  selectedUserId: string;
  setSelectedUserId: (
    value: string,
  ) => void;
  academicYears: AcademicYear[];
  selectedAcademicYearId: string;
  setSelectedAcademicYearId: (
    value: string,
  ) => void;
  startDate: string;
  setStartDate: (
    value: string,
  ) => void;
  endDate: string;
  setEndDate: (
    value: string,
  ) => void;
  actionError: string;
  modalLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  openYearModal: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
              Branch Administration
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            disabled={modalLoading}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {actionError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <FormSelect
            label="Position"
            value={selectedPosition}
            onChange={(value) => {
              setSelectedPosition(
                value as BranchPosition,
              );
              setSelectedUserId("");
              setUserSearch("");
            }}
            options={positions}
          />

          <div>
            <label className="text-sm font-semibold text-slate-900">
              User
            </label>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={userSearch}
                onChange={(event) =>
                  setUserSearch(
                    event.target.value,
                  )
                }
                placeholder="Search eligible user"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-slate-200">
              {users.length === 0 ? (
                <div className="px-4 py-7 text-center">
                  <UserRound className="mx-auto h-6 w-6 text-slate-400" />

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    No eligible users found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Create or activate the required account first.
                  </p>
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() =>
                      setSelectedUserId(
                        user.id,
                      )
                    }
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left last:border-b-0 ${
                      selectedUserId === user.id
                        ? "bg-blue-50"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                        {getInitials(user)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {getFullName(user)}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] font-medium text-blue-600">
                        {user.role}
                      </p>
                    </div>

                    {selectedUserId ===
                      user.id && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-900">
              Academic Year
            </label>

            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <select
                  value={
                    selectedAcademicYearId
                  }
                  onChange={(event) =>
                    setSelectedAcademicYearId(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">
                    Select academic year
                  </option>

                  {academicYears.map(
                    (year) => (
                      <option
                        key={year.id}
                        value={year.id}
                      >
                        {year.name}
                        {year.isCurrent
                          ? " — Current"
                          : ""}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={openYearModal}
                className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />

            <DateField
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs leading-5 text-blue-700">
              Faculty positions use their corresponding faculty roles. Student leadership requires an active IEEE GU membership.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={modalLoading}
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                modalLoading ||
                !selectedUserId ||
                !selectedAcademicYearId ||
                !startDate ||
                !endDate
              }
              onClick={onSubmit}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold !text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {modalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}

              {modalLoading
                ? "Saving..."
                : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadershipCard({
  item,
  onClick,
  onEdit,
  onDelete,
}: {
  item: Leadership;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)]/40 hover:shadow-sm">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          {item.user?.profileImage ? (
            <img
              src={item.user.profileImage}
              alt={getFullName(item.user)}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
              {getInitials(item.user)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {getFullName(item.user)}
                </h3>

                <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                  {item.user?.email ??
                    "Email not available"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${
                  item.isCurrent
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                {item.isCurrent
                  ? "Current"
                  : "Previous"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <p className="text-sm font-semibold text-[var(--primary)]">
            {positionLabel(
              item.position,
            )}
          </p>

          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-[var(--muted-foreground)]">
              Academic Year
            </span>

            <span className="font-medium text-[var(--foreground)]">
              {item.academicYear?.name ??
                "Not available"}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="text-[var(--muted-foreground)]">
              Term
            </span>

            <span className="font-medium text-[var(--foreground)]">
              {formatDate(item.startDate)} —{" "}
              {formatDate(item.endDate)}
            </span>
          </div>
        </div>
      </button>

      <div className="mt-4 flex gap-2 border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Update
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBackground,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBackground: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBackground}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-semibold text-[var(--foreground)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-900">
        {label}
      </label>

      <div className="relative mt-2">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-900">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}