import { create } from "zustand";

export const USER_ROLES = [
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
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const BRANCH_POSITIONS = [
  "IEEE_COUNSELOR",
  "FACULTY_MEMBER",
  "CHAIRMAN",
  "VICE_CHAIRMAN",
  "JOINT_SECRETARY",
  "WEBMASTER",
  "PHOTOGRAPHER",
  "TREASURER",
] as const;

export type BranchPosition = (typeof BRANCH_POSITIONS)[number];

type MembershipProfile = {
  id: string;
  userId: string;
  membershipStatus: string;
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
} | null;

export type LeadershipPosition = {
  id: string;
  position: BranchPosition;
  academicYearId: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
};

export type AuthUser = {
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
  memberProfile: MembershipProfile;
  leadershipPositions: LeadershipPosition[];
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPosition: (positions: BranchPosition[]) => boolean;
  hasOperationalAccess: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  hasRole: (roles) => {
    const user = get().user;

    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  },

  hasPosition: (positions) => {
    const user = get().user;

    if (!user) {
      return false;
    }

    return user.leadershipPositions.some(
      (leadership) =>
        leadership.isCurrent &&
        positions.includes(leadership.position),
    );
  },

  hasOperationalAccess: () => {
    const user = get().user;

    if (!user) {
      return false;
    }

    if (
      user.role === "WEBMASTER" ||
      user.role === "IEEE_COUNSELOR" ||
      user.role === "FACULTY_ADVISOR" ||
      user.role === "CHAIRMAN"
    ) {
      return true;
    }

    return user.leadershipPositions.some(
      (leadership) =>
        leadership.isCurrent &&
        leadership.position === "CHAIRMAN",
    );
  },
}));