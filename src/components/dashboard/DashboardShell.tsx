"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  FileText,
  Loader2,
  GalleryHorizontal,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import {
  useAuthStore,
  type BranchPosition,
  type UserRole,
} from "@/store/auth.store";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const GALLERY_ROLES: UserRole[] = [
  "WEBMASTER",
  "IEEE_COUNSELOR",
  "FACULTY_ADVISOR",
  "PHOTOGRAPHER",
];

const ANNOUNCEMENT_MANAGEMENT_ROLES: UserRole[] = [
  "WEBMASTER",
  "FACULTY_ADVISOR",
  "FACULTY_MEMBER",
  "IEEE_COUNSELOR",
  "CHAIRMAN",
];

function getNavigation(
  role: UserRole,
  leadershipPositions: BranchPosition[],
): NavigationSection[] {
  const isChairman =
    role === "CHAIRMAN" || leadershipPositions.includes("CHAIRMAN");

  const canManageGallery = GALLERY_ROLES.includes(role) || isChairman;

  const overview: NavigationSection = {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  };

  const events: NavigationSection = {
    label: "Events",
    items: [
      {
        label: "Events",
        href: "/dashboard/events/manage",
        icon: FileText,
      },
      {
        label: "Registrations",
        href: "/dashboard/registrations/manage",
        icon: Users,
      },
    ],
  };

  const canManageAnnouncements =
    ANNOUNCEMENT_MANAGEMENT_ROLES.includes(role) || isChairman;

  const contentItems: NavigationItem[] = [
    {
      label: "Announcements",
      href: canManageAnnouncements
        ? "/dashboard/announcements/manage"
        : "/dashboard/announcements",
      icon: Bell,
    },
  ];

  if (canManageGallery) {
    contentItems.push({
      label: "Gallery",
      href: "/dashboard/gallery",
      icon: GalleryHorizontal,
    });
  }

  const content: NavigationSection = {
    label: "Content",
    items: contentItems,
  };

  const members: NavigationSection = {
    label: "Members",
    items: [
      {
        label: "Member Directory",
        href: "/dashboard/members",
        icon: Users,
      },
      {
        label: "Membership",
        href: "/dashboard/membership",
        icon: ShieldCheck,
      },
    ],
  };

  const leadership: NavigationSection = {
    label: "Leadership",
    items: [
      {
        label: "Branch Leadership",
        href: "/dashboard/leadership",
        icon: GraduationCap,
      },
    ],
  };

  const administration: NavigationSection = {
    label: "Administration",
    items: [
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
      },
    ],
  };

  if (role === "WEBMASTER") {
    return [overview, events, content, members, leadership, administration];
  }

  if (role === "IEEE_COUNSELOR" || role === "FACULTY_ADVISOR" || isChairman) {
    return [overview, events, content, members, leadership, administration];
  }

  if (role === "PHOTOGRAPHER") {
    return [
      overview,
      content,
      {
        label: "Account",
        items: [
          {
            label: "Membership",
            href: "/dashboard/membership",
            icon: ShieldCheck,
          },
          {
            label: "Profile",
            href: "/dashboard/profile",
            icon: CircleUserRound,
          },
        ],
      },
    ];
  }

  if (role === "FACULTY") {
    return [
      overview,
      {
        label: "Members",
        items: [
          {
            label: "Member Directory",
            href: "/dashboard/members",
            icon: Users,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            label: "Profile",
            href: "/dashboard/profile",
            icon: CircleUserRound,
          },
        ],
      },
    ];
  }

  if (role === "FACULTY_MEMBER") {
    return [
      overview,
      {
        label: "Community",
        items: [
          {
            label: "Announcements",
            href: "/dashboard/announcements",
            icon: Bell,
          },
        ],
      },
      {
        label: "Account",
        items: [
          {
            label: "Profile",
            href: "/dashboard/profile",
            icon: CircleUserRound,
          },
        ],
      },
    ];
  }

  return [
    overview,
    {
      label: "My IEEE",
      items: [
        {
          label: "Membership",
          href: "/dashboard/membership",
          icon: ShieldCheck,
        },
        {
          label: "My Profile",
          href: "/dashboard/profile",
          icon: CircleUserRound,
        },
      ],
    },
    {
      label: "Events",
      items: [
        {
          label: "Upcoming Events",
          href: "/dashboard/events",
          icon: FileText,
        },
        {
          label: "My Registrations",
          href: "/dashboard/registrations",
          icon: Users,
        },
      ],
    },
    {
      label: "Community",
      items: [
        {
          label: "Announcements",
          href: "/dashboard/announcements",
          icon: Bell,
        },
      ],
    },
  ];
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const difference = Math.max(0, now.getTime() - date.getTime());

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNotificationTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, setUser, clearUser, isLoading, setLoading } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setLoading(true);

        const response = await getCurrentUser();

        if (!mounted) {
          return;
        }

        const currentUser = response?.data ?? response;

        if (!currentUser?.id || !currentUser?.role) {
          throw new Error("Invalid user response");
        }

        setUser(currentUser);
      } catch {
        if (!mounted) {
          return;
        }

        clearUser();
        router.replace("/login?redirect=/dashboard");
      }
    }

    if (!user) {
      void loadUser();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [clearUser, router, setLoading, setUser, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    async function loadUnreadCount() {
      try {
        const response = await api.get("/notifications/unread-count");

        if (!mounted) {
          return;
        }

        const data = response.data?.data ?? response.data;

        setUnreadCount(Number(data?.count ?? 0));
      } catch {
        if (mounted) {
          setUnreadCount(0);
        }
      }
    }

    void loadUnreadCount();

    const interval = window.setInterval(() => {
      void loadUnreadCount();
    }, 60000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    if (notificationsOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [notificationsOpen]);

  async function loadNotifications() {
    try {
      setNotificationsLoading(true);
      setNotificationsError("");

      const response = await api.get("/notifications");
      const data = response.data?.data ?? response.data;

      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotificationsError("Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function toggleNotifications() {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);

    if (nextState) {
      await loadNotifications();
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      setNotificationsError("Unable to update notification.");
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch {
      setNotificationsError("Unable to mark notifications as read.");
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await api.delete(`/notifications/${notificationId}`);

      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId),
      );

      const deletedNotification = notifications.find(
        (notification) => notification.id === notificationId,
      );

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {
      setNotificationsError("Unable to delete notification.");
    }
  }

  function logout() {
    clearUser();
    router.replace("/login");
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
      </div>
    );
  }

  const leadershipPositions =
    user.leadershipPositions
      ?.filter((item) => item.isCurrent)
      .map((item) => item.position) ?? [];

  const navigation = getNavigation(user.role, leadershipPositions);

  return (
    <>
      <style jsx global>{`
        html,
        body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-white transition-all duration-300 ${
            collapsed ? "w-20" : "w-72"
          } ${
            mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-6">
            {!collapsed && (
              <Link
                href="/dashboard"
                className="flex items-center gap-3.5 group"
                onClick={() => setMobileOpen(false)}
              >
                <div className="relative h-10 w-10 shrink-0">
                  <Image
                    src="/gu-logo-transparent.png"
                    alt="Geeta University"
                    fill
                    sizes="40px"
                    className="object-contain"
                    priority
                  />
                </div>

                <div>
                  <p className="text-sm font-extrabold tracking-tight text-[var(--secondary)]">
                    IEEE GU
                  </p>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">Student Branch</p>
                </div>
              </Link>
            )}

            <button
              type="button"
              aria-label="Close navigation"
              className="rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--secondary)] lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>

            <button
              type="button"
              aria-label="Toggle sidebar"
              className="hidden rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--secondary)] lg:block"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          {collapsed && (
            <div className="flex shrink-0 justify-center border-b border-[var(--border)] py-4">
              <Link
                href="/dashboard"
                aria-label="Geeta University"
                onClick={() => setMobileOpen(false)}
                className="relative h-10 w-10"
              >
                <Image
                  src="/gu-logo-transparent.png"
                  alt="Geeta University"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-6"
          >
            {navigation.map((section) => (
              <div key={section.label} className="space-y-1.5">
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                    {section.label}
                  </p>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-bold transition-all duration-200 ${
                          active
                            ? "bg-[var(--primary)] !text-white shadow-sm shadow-[var(--primary)]/20"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--secondary)]"
                        } ${collapsed ? "justify-center px-0" : ""}`}
                      >
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-[var(--border)] p-4 bg-[var(--surface)]/30">
            <button
              type="button"
              onClick={logout}
              className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 ${
                collapsed ? "justify-center px-0" : ""
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">Logout</span>}
            </button>
          </div>
        </aside>

        <div
          className={`flex h-screen flex-col transition-all duration-300 ${
            collapsed ? "lg:pl-20" : "lg:pl-72"
          }`}
        >
          <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white/95 px-5 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Open navigation"
                className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--secondary)] transition-colors hover:bg-[var(--surface)] lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--primary)]">
                  IEEE Geeta University
                </p>
                <h1 className="text-base font-extrabold tracking-tight text-[var(--secondary)] sm:text-lg">
                  Student Branch Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => void toggleNotifications()}
                  className={`relative rounded-xl border p-2.5 transition-all duration-200 ${
                    notificationsOpen
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--secondary)]"
                  }`}
                >
                  <Bell size={18} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-extrabold !text-white shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="fixed inset-x-4 top-[5.5rem] z-50 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[420px] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/30 px-6 py-4">
                      <div>
                        <h2 className="text-base font-extrabold tracking-tight text-[var(--secondary)]">
                          Notifications
                        </h2>
                        <p className="mt-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                          {unreadCount > 0
                            ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
                            : "You're all caught up"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => void markAllAsRead()}
                            className="rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
                          >
                            Mark all read
                          </button>
                        )}

                        <button
                          type="button"
                          aria-label="Close notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="rounded-xl p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--secondary)]"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {notificationsError && (
                      <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-xs font-bold text-red-800">
                        {notificationsError}
                      </div>
                    )}

                    <div
                      className="max-h-[min(70vh,480px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center px-6 py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--muted-foreground)]">
                            <Bell size={24} />
                          </div>
                          <p className="text-base font-bold text-[var(--secondary)]">
                            No notifications
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            New updates will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[var(--border)]">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`group p-5 transition-colors ${
                                notification.isRead
                                  ? "bg-white"
                                  : "bg-[var(--primary)]/[0.02]"
                              }`}
                            >
                              <div className="flex gap-4">
                                <div
                                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                                    notification.isRead
                                      ? "bg-[var(--surface)] text-[var(--muted-foreground)]"
                                      : "bg-[var(--primary)] !text-white"
                                  }`}
                                >
                                  <Bell size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <p
                                      className={`text-sm tracking-tight ${
                                        notification.isRead
                                          ? "font-bold text-[var(--secondary)]"
                                          : "font-extrabold text-[var(--secondary)]"
                                      }`}
                                    >
                                      {notification.title}
                                    </p>

                                    {!notification.isRead && (
                                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)] shadow-sm" />
                                    )}
                                  </div>

                                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
                                    {notification.message}
                                  </p>

                                  <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]/60">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                                        {getNotificationTypeLabel(
                                          notification.type,
                                        )}
                                      </span>
                                      <span className="text-[10px] text-[var(--muted-foreground)]">
                                        •
                                      </span>
                                      <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
                                        {formatNotificationTime(
                                          notification.createdAt,
                                        )}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      {!notification.isRead && (
                                        <button
                                          type="button"
                                          aria-label="Mark notification as read"
                                          title="Mark as read"
                                          onClick={() =>
                                            void markAsRead(notification.id)
                                          }
                                          className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--primary)]"
                                        >
                                          <Check size={14} />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        aria-label="Delete notification"
                                        title="Delete"
                                        onClick={() =>
                                          void deleteNotification(notification.id)
                                        }
                                        className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/dashboard/profile"
                className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-2 sm:px-3 sm:py-2 transition-all hover:border-[var(--primary)]/30 hover:shadow-sm"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-bold text-[var(--secondary)]">
                    {user.firstName} {user.lastName ?? ""}
                  </p>
                  <p className="text-[10px] font-semibold text-[var(--muted-foreground)]">{user.role}</p>
                </div>

                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-[var(--border)] group-hover:ring-[var(--primary)]/30 transition-all"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-xs font-extrabold !text-white shadow-sm">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </header>

          <main
            className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}