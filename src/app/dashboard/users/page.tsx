"use client";

import { useEffect, useMemo, useState } from "react";
import { api, getCurrentUser } from "@/lib/api";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
  Mail,
  Phone,
  Hash,
  CalendarDays,
  Loader2,
  UserRound,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";

type UserRole =
  | "STUDENT"
  | "FACULTY"
  | "FACULTY_ADVISOR"
  | "IEEE_COUNSELOR"
  | "FACULTY_MEMBER"
  | "CHAIRMAN"
  | "VICE_CHAIRMAN"
  | "JOINT_SECRETARY"
  | "WEBMASTER"
  | "PHOTOGRAPHER"
  | "TREASURER";

type ManualUserRole =
  | "STUDENT"
  | "FACULTY"
  | "FACULTY_ADVISOR"
  | "IEEE_COUNSELOR"
  | "FACULTY_MEMBER"
  | "CHAIRMAN"
  | "VICE_CHAIRMAN"
  | "JOINT_SECRETARY"
  | "PHOTOGRAPHER"
  | "TREASURER";

type MembershipStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "EXPIRED"
  | "REJECTED";

type MemberProfile = {
  id: string;
  membershipStatus: MembershipStatus;
  joinedAt: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  rollNumber: string | null;
  profileVisibility: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  ieeeMembershipNumber: string | null;
  profileImage: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  memberProfile: MemberProfile | null;
};

type RoleFilter = "ALL" | UserRole;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type ManualUserForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ieeeMembershipNumber: string;
  password: string;
  confirmPassword: string;
  role: ManualUserRole;
};

const roles: RoleFilter[] = [
  "ALL",
  "STUDENT",
  "FACULTY",
  "FACULTY_ADVISOR",
  "IEEE_COUNSELOR",
  "FACULTY_MEMBER",
  "CHAIRMAN",
  "VICE_CHAIRMAN",
  "JOINT_SECRETARY",
  "WEBMASTER",
  "PHOTOGRAPHER",
  "TREASURER",
];

const manualRoles: ManualUserRole[] = [
  "STUDENT",
  "FACULTY",
  "FACULTY_ADVISOR",
  "IEEE_COUNSELOR",
  "FACULTY_MEMBER",
  "CHAIRMAN",
  "VICE_CHAIRMAN",
  "JOINT_SECRETARY",
  "PHOTOGRAPHER",
  "TREASURER",
];

const initialManualUserForm: ManualUserForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  ieeeMembershipNumber: "",
  password: "",
  confirmPassword: "",
  role: "STUDENT",
};

function getFullName(user: UserRecord) {
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`;
}

function getInitials(user: UserRecord) {
  const first = user.firstName?.charAt(0) ?? "";
  const last = user.lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "U";
}

function getRoleLabel(role: UserRole | ManualUserRole) {
  return role
    .split("_")
    .map(
      (part) =>
        part.charAt(0) + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function getRoleBadgeClass(role: UserRole) {
  switch (role) {
    case "WEBMASTER":
      return "bg-blue-50 text-blue-700";
    case "IEEE_COUNSELOR":
      return "bg-indigo-50 text-indigo-700";
    case "FACULTY_ADVISOR":
      return "bg-sky-50 text-sky-700";
    case "FACULTY_MEMBER":
      return "bg-violet-50 text-violet-700";
    case "CHAIRMAN":
    case "VICE_CHAIRMAN":
    case "JOINT_SECRETARY":
    case "TREASURER":
    case "PHOTOGRAPHER":
      return "bg-blue-50 text-blue-700";
    case "FACULTY":
      return "bg-slate-100 text-slate-700";
    case "STUDENT":
      return "bg-cyan-50 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function isActiveMember(user: UserRecord) {
  return (
    user.role === "STUDENT" &&
    user.memberProfile?.membershipStatus === "ACTIVE"
  );
}

function getMembershipLabel(user: UserRecord) {
  if (user.role !== "STUDENT") {
    return "Not Required";
  }

  if (!user.memberProfile) {
    return "Not Active";
  }

  switch (user.memberProfile.membershipStatus) {
    case "ACTIVE":
      return "Active Member";
    case "PENDING":
      return "Not Active · Pending Approval";
    case "REJECTED":
      return "Not Active · Rejected";
    case "SUSPENDED":
      return "Not Active · Suspended";
    case "EXPIRED":
      return "Not Active · Expired";
    default:
      return "Not Active";
  }
}

function getMembershipClass(user: UserRecord) {
  if (user.role !== "STUDENT") {
    return "bg-slate-100 text-slate-600";
  }

  if (user.memberProfile?.membershipStatus === "ACTIVE") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (user.memberProfile?.membershipStatus === "PENDING") {
    return "bg-amber-100 text-amber-700";
  }

  if (user.memberProfile?.membershipStatus === "REJECTED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

function UserAvatar({
  user,
  large = false,
}: {
  user: UserRecord;
  large?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  if (user.profileImage && !imageError) {
    return (
      <img
        src={user.profileImage}
        alt={getFullName(user)}
        onError={() => setImageError(true)}
        className={`shrink-0 rounded-full object-cover ${
          large ? "h-16 w-16" : "h-12 w-12"
        }`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700 ${
        large ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"
      }`}
    >
      {getInitials(user)}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [selectedUser, setSelectedUser] =
    useState<UserRecord | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserLoading, setAddUserLoading] =
    useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [addUserSuccess, setAddUserSuccess] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [manualUserForm, setManualUserForm] =
    useState<ManualUserForm>(initialManualUserForm);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      const data = response.data?.data ?? response.data;

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid users response received from the server.",
        );
      }

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    try {
      const response = await getCurrentUser();
      const user = response?.data ?? response;

      if (user?.id) {
        setCurrentUserId(user.id);
      }
    } catch {
      setCurrentUserId(null);
    }
  }

  useEffect(() => {
    void Promise.all([
      loadUsers(),
      loadCurrentUser(),
    ]);
  }, []);

  useEffect(() => {
    if (!selectedUser && !showAddUser) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !actionLoading &&
        !addUserLoading
      ) {
        setSelectedUser(null);
        setShowAddUser(false);
        setActionError("");
        setActionSuccess("");
        setAddUserError("");
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
  }, [
    selectedUser,
    showAddUser,
    actionLoading,
    addUserLoading,
  ]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = getFullName(user).toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone ?? "")
          .toLowerCase()
          .includes(query) ||
        (user.ieeeMembershipNumber ?? "")
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          user.isActive) ||
        (statusFilter === "INACTIVE" &&
          !user.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const statistics = useMemo(() => {
    const active = users.filter(
      (user) => user.isActive,
    ).length;

    const activeMembers = users.filter(
      (user) => isActiveMember(user),
    ).length;

    return {
      total: users.length,
      active,
      inactive: users.length - active,
      students: users.filter(
        (user) => user.role === "STUDENT",
      ).length,
      activeMembers,
      administrative: users.filter(
        (user) =>
          user.role === "WEBMASTER" ||
          user.role === "IEEE_COUNSELOR" ||
          user.role === "FACULTY_ADVISOR" ||
          user.role === "FACULTY_MEMBER" ||
          user.role === "CHAIRMAN" ||
          user.role === "VICE_CHAIRMAN" ||
          user.role === "JOINT_SECRETARY" ||
          user.role === "PHOTOGRAPHER" ||
          user.role === "TREASURER",
      ).length,
    };
  }, [users]);

  function openUser(user: UserRecord) {
    setSelectedUser(user);
    setActionError("");
    setActionSuccess("");
  }

  function closeModal() {
    if (actionLoading) {
      return;
    }

    setSelectedUser(null);
    setActionError("");
    setActionSuccess("");
  }

  function openAddUser() {
    setSelectedUser(null);
    setManualUserForm(initialManualUserForm);
    setAddUserError("");
    setAddUserSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAddUser(true);
  }

  function closeAddUser() {
    if (addUserLoading) {
      return;
    }

    setShowAddUser(false);
    setManualUserForm(initialManualUserForm);
    setAddUserError("");
    setAddUserSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function updateManualUserField(
    field: keyof ManualUserForm,
    value: string,
  ) {
    setManualUserForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createManualUser(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const firstName =
      manualUserForm.firstName.trim();
    const lastName =
      manualUserForm.lastName.trim();
    const email =
      manualUserForm.email.trim().toLowerCase();
    const phone =
      manualUserForm.phone.trim();
    const ieeeMembershipNumber =
      manualUserForm.ieeeMembershipNumber.trim();
    const password = manualUserForm.password;
    const confirmPassword =
      manualUserForm.confirmPassword;

    if (firstName.length < 2) {
      setAddUserError(
        "First name must contain at least 2 characters.",
      );
      return;
    }

    if (lastName.length > 50) {
      setAddUserError(
        "Last name cannot exceed 50 characters.",
      );
      return;
    }

    if (!email) {
      setAddUserError("Email address is required.");
      return;
    }

    if (
      phone &&
      (phone.length < 10 || phone.length > 15)
    ) {
      setAddUserError(
        "Phone number must contain between 10 and 15 characters.",
      );
      return;
    }

    if (password.length < 8) {
      setAddUserError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setAddUserError(
        "Password and confirm password do not match.",
      );
      return;
    }

    try {
      setAddUserLoading(true);
      setAddUserError("");
      setAddUserSuccess("");

      const response = await api.post(
        "/users/privileged",
        {
          firstName,
          lastName: lastName || undefined,
          email,
          phone: phone || undefined,
          ieeeMembershipNumber:
            ieeeMembershipNumber || undefined,
          password,
          role: manualUserForm.role,
        },
      );

      const createdUser =
        response.data?.data ?? response.data;

      if (!createdUser?.id) {
        throw new Error(
          "The server did not return the created user.",
        );
      }

      setUsers((currentUsers) => [
        createdUser,
        ...currentUsers,
      ]);

      setAddUserSuccess(
        `${getRoleLabel(
          manualUserForm.role,
        )} account created successfully.`,
      );

      setManualUserForm(initialManualUserForm);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setAddUserError(
        err instanceof Error
          ? err.message
          : "Unable to create the user account.",
      );
    } finally {
      setAddUserLoading(false);
    }
  }

  async function updateStatus(user: UserRecord) {
    if (user.id === currentUserId) {
      setActionError(
        "You cannot change your own account status.",
      );
      return;
    }

    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `${nextStatus ? "Activate" : "Deactivate"} ${getFullName(
        user,
      )}'s account?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionSuccess("");

      const response = await api.patch(
        `/users/${user.id}/status`,
        {
          isActive: nextStatus,
        },
      );

      const updatedUser =
        response.data?.data ?? response.data;

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                ...(updatedUser ?? {}),
                isActive: nextStatus,
              }
            : item,
        ),
      );

      setSelectedUser((currentUser) =>
        currentUser &&
        currentUser.id === user.id
          ? {
              ...currentUser,
              ...(updatedUser ?? {}),
              isActive: nextStatus,
            }
          : currentUser,
      );

      setActionSuccess(
        `Account ${
          nextStatus
            ? "activated"
            : "deactivated"
        } successfully.`,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update account status.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
            <UserRound className="h-4 w-4" />
            Account Management
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Users
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Manage all registered and manually created accounts across the IEEE Geeta University Student Branch.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddUser}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold !text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{actionSuccess}</span>

          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="font-medium text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          value={statistics.total}
          label="Total Users"
        />

        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          value={statistics.active}
          label="Active Accounts"
        />

        <StatCard
          icon={<UserX className="h-5 w-5" />}
          value={statistics.inactive}
          label="Inactive"
        />

        <StatCard
          icon={<UserRound className="h-5 w-5" />}
          value={statistics.students}
          label="Students"
        />

        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          value={statistics.activeMembers}
          label="Active Members"
        />

        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          value={statistics.administrative}
          label="Leadership"
        />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, phone or IEEE membership number"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm !text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as RoleFilter,
              )
            }
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm !text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "ALL"
                  ? "All Roles"
                  : getRoleLabel(role)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as StatusFilter,
              )
            }
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm !text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </section>

      {loading ? (
        <section className="flex min-h-[320px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
        </section>
      ) : users.length === 0 && !error ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No users found"
          description="There are currently no registered user accounts."
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="No matching users"
          description="Try changing the search term or filters."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => {
            const isCurrentUser =
              user.id === currentUserId;

            const activeMember =
              isActiveMember(user);

            return (
              <article
                key={user.id}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)]/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={user} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-[var(--foreground)]">
                          {getFullName(user)}
                        </h2>

                        <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                          {user.email}
                        </p>
                      </div>

                      {isCurrentUser && (
                        <span className="shrink-0 rounded-full bg-[var(--primary)] px-2 py-1 text-[10px] font-semibold !text-white">
                          You
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getRoleBadgeClass(
                          user.role,
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive
                          ? "Account Active"
                          : "Account Inactive"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getMembershipClass(
                          user,
                        )}`}
                      >
                        {getMembershipLabel(user)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex-1 space-y-2 border-t border-[var(--border)] pt-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {user.email}
                    </span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  {user.ieeeMembershipNumber && (
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <Hash className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {user.ieeeMembershipNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openUser(user)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold !text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void updateStatus(user)
                    }
                    disabled={
                      actionLoading ||
                      isCurrentUser
                    }
                    className={`h-9 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      user.isActive
                        ? "border border-red-200 bg-red-50 !text-red-600 hover:bg-red-100"
                        : "bg-[var(--primary)] !text-white hover:opacity-90"
                    }`}
                  >
                    {user.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>

                {user.role === "STUDENT" &&
                  !activeMember && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-[11px] font-medium text-amber-700">
                        IEEE member-only actions are disabled until membership becomes active.
                      </p>
                    </div>
                  )}
              </article>
            );
          })}
        </section>
      )}

      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span>
            Showing {filteredUsers.length} of{" "}
            {users.length} users
          </span>

          {(search ||
            roleFilter !== "ALL" ||
            statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
                  User Account
                </p>

                <h2
                  id="user-details-title"
                  className="mt-1 text-lg font-semibold text-slate-900"
                >
                  User Details
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                aria-label="Close user details"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-160px)] overflow-y-auto bg-white p-5">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
                <UserAvatar
                  user={selectedUser}
                  large
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {getFullName(selectedUser)}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getRoleBadgeClass(
                        selectedUser.role,
                      )}`}
                    >
                      {getRoleLabel(
                        selectedUser.role,
                      )}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        selectedUser.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedUser.isActive
                        ? "Account Active"
                        : "Account Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <DetailRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={selectedUser.email}
                />

                <DetailRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={
                    selectedUser.phone ||
                    "Not provided"
                  }
                />

                <DetailRow
                  icon={
                    <ShieldCheck className="h-4 w-4" />
                  }
                  label="Role"
                  value={getRoleLabel(
                    selectedUser.role,
                  )}
                />

                <DetailRow
                  icon={
                    <UserCheck className="h-4 w-4" />
                  }
                  label="Account Status"
                  value={
                    selectedUser.isActive
                      ? "Active"
                      : "Inactive"
                  }
                  valueClass={
                    selectedUser.isActive
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                />

                <DetailRow
                  icon={
                    <ShieldCheck className="h-4 w-4" />
                  }
                  label="IEEE Membership"
                  value={getMembershipLabel(
                    selectedUser,
                  )}
                  valueClass={
                    selectedUser.role !== "STUDENT"
                      ? "text-slate-600"
                      : selectedUser.memberProfile
                          ?.membershipStatus ===
                        "ACTIVE"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                />

                <DetailRow
                  icon={<Hash className="h-4 w-4" />}
                  label="IEEE Membership Number"
                  value={
                    selectedUser.ieeeMembershipNumber ||
                    "Not provided"
                  }
                />

                {selectedUser.memberProfile && (
                  <>
                    <DetailRow
                      icon={
                        <CalendarDays className="h-4 w-4" />
                      }
                      label="Membership Joined"
                      value={formatDate(
                        selectedUser.memberProfile
                          .joinedAt,
                      )}
                    />

                    <DetailRow
                      icon={
                        <CalendarDays className="h-4 w-4" />
                      }
                      label="Membership Approved"
                      value={formatDate(
                        selectedUser.memberProfile
                          .approvedAt,
                      )}
                    />
                  </>
                )}

                <DetailRow
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                  label="Account Created"
                  value={formatDate(
                    selectedUser.createdAt,
                  )}
                  last
                />
              </div>

              {selectedUser.memberProfile?.rejectionReason && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-medium text-red-600">
                    Membership Note
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {
                      selectedUser.memberProfile
                        .rejectionReason
                    }
                  </p>
                </div>
              )}

              {selectedUser.bio && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Bio
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-900">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {selectedUser.role === "STUDENT" &&
                !isActiveMember(selectedUser) && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700">
                      IEEE Membership Not Active
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Member-only actions remain disabled until this student has an active IEEE GU membership.
                    </p>
                  </div>
                )}

              {actionError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              {actionSuccess && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {actionSuccess}
                </div>
              )}

              {selectedUser.id === currentUserId ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
                  You cannot change your own account
                  status.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void updateStatus(selectedUser)
                  }
                  disabled={actionLoading}
                  className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedUser.isActive
                      ? "bg-red-600 !text-white hover:bg-red-700"
                      : "bg-blue-600 !text-white hover:bg-blue-700"
                  }`}
                >
                  {actionLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {selectedUser.isActive
                    ? "Deactivate Account"
                    : "Activate Account"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddUser && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddUser();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">
                  Authorized Account
                </p>

                <h2
                  id="add-user-title"
                  className="mt-1 text-lg font-semibold text-slate-900"
                >
                  Add User
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create an official branch account directly from the administrative portal.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddUser}
                disabled={addUserLoading}
                aria-label="Close add user"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={createManualUser}
              className="max-h-[calc(100vh-150px)] overflow-y-auto"
            >
              <div className="space-y-5 p-5">
                {addUserSuccess && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {addUserSuccess}
                  </div>
                )}

                {addUserError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {addUserError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Role
                  </label>

                  <select
                    value={manualUserForm.role}
                    onChange={(event) =>
                      updateManualUserField(
                        "role",
                        event.target.value,
                      )
                    }
                    disabled={addUserLoading}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    {manualRoles.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>

                {manualUserForm.role === "STUDENT" && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold text-emerald-700">
                      Direct Membership Authorization
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      Students created by an authorized branch account are added with active IEEE GU membership immediately. No separate membership verification is required.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="First Name"
                    value={manualUserForm.firstName}
                    onChange={(value) =>
                      updateManualUserField(
                        "firstName",
                        value,
                      )
                    }
                    placeholder="Enter first name"
                    disabled={addUserLoading}
                    required
                  />

                  <FormField
                    label="Last Name"
                    value={manualUserForm.lastName}
                    onChange={(value) =>
                      updateManualUserField(
                        "lastName",
                        value,
                      )
                    }
                    placeholder="Enter last name"
                    disabled={addUserLoading}
                  />
                </div>

                <FormField
                  label="Email Address"
                  type="email"
                  value={manualUserForm.email}
                  onChange={(value) =>
                    updateManualUserField(
                      "email",
                      value,
                    )
                  }
                  placeholder="name@geetauniversity.com"
                  disabled={addUserLoading}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Phone"
                    type="tel"
                    value={manualUserForm.phone}
                    onChange={(value) =>
                      updateManualUserField(
                        "phone",
                        value,
                      )
                    }
                    placeholder="Phone number"
                    disabled={addUserLoading}
                  />

                  <FormField
                    label="IEEE Membership Number"
                    value={
                      manualUserForm.ieeeMembershipNumber
                    }
                    onChange={(value) =>
                      updateManualUserField(
                        "ieeeMembershipNumber",
                        value,
                      )
                    }
                    placeholder="Optional"
                    disabled={addUserLoading}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PasswordField
                    label="Password"
                    value={manualUserForm.password}
                    onChange={(value) =>
                      updateManualUserField(
                        "password",
                        value,
                      )
                    }
                    placeholder="Minimum 8 characters"
                    visible={showPassword}
                    onToggle={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    disabled={addUserLoading}
                    required
                  />

                  <PasswordField
                    label="Confirm Password"
                    value={
                      manualUserForm.confirmPassword
                    }
                    onChange={(value) =>
                      updateManualUserField(
                        "confirmPassword",
                        value,
                      )
                    }
                    placeholder="Repeat password"
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    disabled={addUserLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddUser}
                  disabled={addUserLoading}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addUserSuccess
                    ? "Close"
                    : "Cancel"}
                </button>

                {!addUserSuccess && (
                  <button
                    type="submit"
                    disabled={addUserLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addUserLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
          {icon}
        </div>

        <span className="text-xl font-semibold text-[var(--foreground)]">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueClass,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-white px-4 py-3.5 ${
        !last
          ? "border-b border-slate-200"
          : ""
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500">
          {label}
        </p>

        <p
          className={`mt-0.5 break-words text-sm font-medium ${
            valueClass || "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--muted-foreground)]">
        {icon}
      </div>

      <h2 className="mt-4 text-sm font-semibold text-[var(--foreground)]">
        {title}
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}