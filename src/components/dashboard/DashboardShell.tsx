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
    <div className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200 ${
          collapsed ? "w-20" : "w-72"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <div className="relative h-11 w-11 shrink-0">
                <Image
                  src="/gu-logo-transparent.png"
                  alt="Geeta University"
                  fill
                  sizes="44px"
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  IEEE GU
                </p>

                <p className="text-xs text-[var(--muted)]">Student Branch</p>
              </div>
            </Link>
          )}

          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Toggle sidebar"
            className="hidden rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] lg:block"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
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
          className="scrollbar-hide flex-1 overflow-y-auto px-3 py-5"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {navigation.map((section) => (
            <div key={section.label} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
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
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-[var(--primary)] !text-white"
                          : "text-[var(--foreground)] hover:bg-[var(--background)]"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />

                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <button
            type="button"
            onClick={logout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div
        className={`flex h-screen flex-col transition-all duration-200 ${
          collapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--foreground)] lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                IEEE Geeta University
              </p>

              <h1 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                Student Branch Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => void toggleNotifications()}
                className={`relative rounded-xl border border-[var(--border)] p-2.5 transition ${
                  notificationsOpen
                    ? "bg-[var(--background)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                }`}
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold !text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="fixed inset-x-3 top-[5.5rem] z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[400px]">
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                    <div>
                      <h2 className="text-sm font-bold text-[var(--foreground)]">
                        Notifications
                      </h2>

                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void markAllAsRead()}
                          className="rounded-lg px-2.5 py-2 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--background)]"
                        >
                          Mark all read
                        </button>
                      )}

                      <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {notificationsError && (
                    <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                      {notificationsError}
                    </div>
                  )}

                  <div
                    className="max-h-[min(70vh,520px)] overflow-y-auto"
                    style={{
                      scrollbarWidth: "none",
                    }}
                  >
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center px-4 py-12">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)]">
                          <Bell className="h-5 w-5 text-[var(--muted)]" />
                        </div>

                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          New updates will appear here.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`group border-b border-[var(--border)] px-4 py-4 transition last:border-b-0 ${
                              notification.isRead
                                ? "bg-[var(--surface)]"
                                : "bg-[var(--background)]"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                  notification.isRead
                                    ? "bg-[var(--background)] text-[var(--muted)]"
                                    : "bg-[var(--primary)] !text-white"
                                }`}
                              >
                                <Bell className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p
                                      className={`text-sm ${
                                        notification.isRead
                                          ? "font-medium text-[var(--foreground)]"
                                          : "font-bold text-[var(--foreground)]"
                                      }`}
                                    >
                                      {notification.title}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                      {notification.message}
                                    </p>
                                  </div>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                                  )}
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                                      {getNotificationTypeLabel(
                                        notification.type,
                                      )}
                                    </span>

                                    <span className="text-[10px] text-[var(--muted)]">
                                      {formatNotificationTime(
                                        notification.createdAt,
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                                    {!notification.isRead && (
                                      <button
                                        type="button"
                                        aria-label="Mark notification as read"
                                        title="Mark as read"
                                        onClick={() =>
                                          void markAsRead(notification.id)
                                        }
                                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--primary)]"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      aria-label="Delete notification"
                                      title="Delete"
                                      onClick={() =>
                                        void deleteNotification(notification.id)
                                      }
                                      className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() => void markAsRead(notification.id)}
                                className="mt-2 text-left text-[11px] font-semibold text-[var(--primary)] hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
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
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-2.5 py-2 hover:bg-[var(--background)]"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {user.firstName} {user.lastName ?? ""}
                </p>

                <p className="text-xs text-[var(--muted)]">{user.role}</p>
              </div>

              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold !text-white">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        <main
          className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
