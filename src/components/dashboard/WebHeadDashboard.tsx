"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GalleryHorizontal,
  ShieldCheck,
  Users,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

type User = {
  firstName: string;
  lastName: string | null;
  role: string;
  ieeeMembershipNumber: string | null;
};

type Event = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  bannerImage: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  access: string;
  status: string;
  approvalStatus: string;
  createdAt: string;
  _count?: {
    registrations: number;
  };
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  approvalStatus: string;
  isPublished: boolean;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "APPROVED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "PENDING_APPROVAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "DRAFT":
      return "border-gray-200 bg-gray-50 text-gray-700";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";
    case "COMPLETED":
      return "border-purple-200 bg-purple-50 text-purple-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function getEventStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function getApiErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const apiError = error as ApiError;

    return (
      apiError.response?.data?.message ||
      "Unable to load the Webmaster dashboard."
    );
  }

  return "Unable to load the Webmaster dashboard.";
}

export default function WebHeadDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTime(Date.now());

    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, eventsResponse, announcementsResponse] =
          await Promise.all([
            getCurrentUser(),
            api.get("/events"),
            api.get("/announcements"),
          ]);

        if (!mounted) {
          return;
        }

        const currentUser = userResponse?.data ?? userResponse;
        const eventData = Array.isArray(eventsResponse.data?.data)
          ? eventsResponse.data.data
          : [];
        const announcementData = Array.isArray(
          announcementsResponse.data?.data,
        )
          ? announcementsResponse.data.data
          : [];

        const sortedEvents = [...eventData].sort(
          (a: Event, b: Event) =>
            new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime(),
        );

        const sortedAnnouncements = [...announcementData]
          .sort(
            (a: Announcement, b: Announcement) =>
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime(),
          )
          .slice(0, 5);

        setUser(currentUser);
        setEvents(sortedEvents);
        setAnnouncements(sortedAnnouncements);
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

        setError(getApiErrorMessage(requestError));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const pendingEvents = useMemo(
    () =>
      events.filter((event) => event.status === "PENDING_APPROVAL").length,
    [events],
  );

  const publishedEvents = useMemo(
    () => events.filter((event) => event.status === "PUBLISHED").length,
    [events],
  );

  const draftEvents = useMemo(
    () => events.filter((event) => event.status === "DRAFT").length,
    [events],
  );

  const upcomingEvents = useMemo(() => {
    if (currentTime === null) {
      return [];
    }

    return events
      .filter(
        (event) => new Date(event.eventDate).getTime() >= currentTime,
      )
      .slice(0, 5);
  }, [events, currentTime]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="h-4 w-32 rounded-lg bg-[var(--surface)]" />
          <div className="mt-4 h-9 w-72 rounded-xl bg-[var(--surface)]" />
          <div className="mt-2.5 h-5 w-96 max-w-full rounded-lg bg-[var(--surface)]" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50"
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="h-[420px] rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 lg:col-span-2" />
          <div className="h-[420px] rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8 shadow-sm">
          <h1 className="text-lg font-bold text-red-800">
            Unable to load Webmaster dashboard
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const isChairman = user?.role === "CHAIRMAN";
  const portalTitle = isChairman ? "Branch Operations" : "Webmaster Portal";
  const welcomeName = user?.firstName || (isChairman ? "Chairman" : "Webmaster");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="mb-8 sm:mb-10">
        <span className="inline-flex rounded-full bg-[var(--primary)]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
          {portalTitle}
        </span>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-4xl">
          Welcome back, {welcomeName}
        </h1>

        <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">
          Manage the digital operations of IEEE Geeta University Student Branch.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Total Events
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--secondary)]">
                {events.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
              <CalendarDays size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs font-medium text-[var(--muted-foreground)]">
            Events available for branch management
          </p>
        </div>

        <div className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Pending Approval
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--secondary)]">
                {pendingEvents}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110">
              <Clock3 size={22} />
            </div>
          </div>

          <Link
            href="/dashboard/events"
            className="group/link mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            Review events
            <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>

        <div className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Published Events
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--secondary)]">
                {publishedEvents}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs font-medium text-[var(--muted-foreground)]">
            Currently published events
          </p>
        </div>

        <div className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Draft Events
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--secondary)]">
                {draftEvents}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
              <FileText size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs font-medium text-[var(--muted-foreground)]">
            Events still in draft status
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-sm lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/30 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-[var(--secondary)]">
                Event Operations
              </h2>
              <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                Current event workflow and upcoming activities
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="text-xs font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
            >
              Manage events
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {upcomingEvents.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" />
                <p className="mt-4 text-base font-bold text-[var(--secondary)]">
                  No upcoming events
                </p>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                  Upcoming events will appear here when available.
                </p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 transition-colors hover:bg-[var(--surface)]/40"
                >
                  <div className="relative aspect-[16/9] w-full sm:h-16 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    {event.bannerImage ? (
                      <Image
                        src={event.bannerImage}
                        alt={event.title}
                        width={112}
                        height={64}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-[var(--muted-foreground)]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="line-clamp-1 text-base font-bold text-[var(--secondary)]">
                        {event.title}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusClasses(
                          event.status,
                        )}`}
                      >
                        {getEventStatusLabel(event.status)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                      <span>{formatDate(event.eventDate)}</span>

                      {event.startTime && (
                        <span>
                          {formatTime(event.startTime)}
                          {event.endTime
                            ? ` - ${formatTime(event.endTime)}`
                            : ""}
                        </span>
                      )}

                      <span>{event.access.replaceAll("_", " ")}</span>

                      <span>
                        {event._count?.registrations ?? 0} registrations
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/events/${event.slug}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold text-[var(--secondary)] shadow-sm transition-all hover:bg-slate-50 sm:self-center"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-[var(--border)] bg-[var(--surface)]/30 px-6 py-5">
            <h2 className="text-lg font-bold text-[var(--secondary)]">
              Management
            </h2>
            <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
              {isChairman
                ? "Branch operational control areas"
                : "Webmaster control areas"}
            </p>
          </div>

          <div className="p-4 space-y-2 flex-1">
            <Link
              href="/dashboard/users"
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-[var(--surface)]/60 border border-transparent hover:border-[var(--border)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
                <Users size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[var(--secondary)]">
                  Users
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Accounts and access
                </p>
              </div>

              <ArrowRight size={18} className="text-[var(--muted-foreground)] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/leadership"
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-[var(--surface)]/60 border border-transparent hover:border-[var(--border)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[var(--secondary)]">
                  Leadership
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Branch positions
                </p>
              </div>

              <ArrowRight size={18} className="text-[var(--muted-foreground)] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/announcements"
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-[var(--surface)]/60 border border-transparent hover:border-[var(--border)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
                <Bell size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[var(--secondary)]">
                  Announcements
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Branch communication
                </p>
              </div>

              <ArrowRight size={18} className="text-[var(--muted-foreground)] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard/gallery"
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-[var(--surface)]/60 border border-transparent hover:border-[var(--border)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
                <GalleryHorizontal size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[var(--secondary)]">
                  Gallery
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Media and albums
                </p>
              </div>

              <ArrowRight size={18} className="text-[var(--muted-foreground)] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/30 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--secondary)]">
              Recent Announcements
            </h2>
            <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
              Latest branch communication
            </p>
          </div>

          <Link
            href="/dashboard/announcements"
            className="text-xs font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
          >
            View all
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="mt-4 text-base font-bold text-[var(--secondary)]">
              No announcements
            </p>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Published announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/dashboard/announcements/${announcement.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-bold text-[var(--secondary)] transition-colors group-hover:text-[var(--primary)]">
                      {announcement.title}
                    </h3>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusClasses(
                        announcement.isPublished
                          ? "PUBLISHED"
                          : announcement.approvalStatus,
                      )}`}
                    >
                      {announcement.isPublished
                        ? "PUBLISHED"
                        : announcement.approvalStatus.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
                    {announcement.content}
                  </p>
                </div>

                <p className="mt-5 text-[11px] font-semibold text-[var(--muted-foreground)] pt-3 border-t border-[var(--border)]/60">
                  {formatDate(
                    announcement.publishedAt || announcement.createdAt,
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}