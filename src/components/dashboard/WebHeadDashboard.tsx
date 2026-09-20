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
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="mb-7">
          <div className="h-4 w-28 rounded bg-[var(--background)]" />
          <div className="mt-3 h-8 w-80 rounded bg-[var(--background)]" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-[var(--background)]" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="h-96 rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-2" />
          <div className="h-96 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-base font-semibold text-red-800">
            Unable to load Webmaster dashboard
          </h1>
          <p className="mt-1.5 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const isChairman = user?.role === "CHAIRMAN";
  const portalTitle = isChairman ? "Branch Operations" : "Webmaster Portal";
  const welcomeName = user?.firstName || (isChairman ? "Chairman" : "Webmaster");

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-7">
        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          {portalTitle}
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Welcome back, {welcomeName}
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
          Manage the digital operations of IEEE Geeta University Student Branch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Total Events
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {events.length}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Events available for branch management
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Pending Approval
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {pendingEvents}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Clock3 className="h-4 w-4 text-amber-600" />
            </div>
          </div>

          <Link
            href="/dashboard/events"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
          >
            Review events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Published Events
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {publishedEvents}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Currently published events
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Draft Events
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {draftEvents}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <FileText className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Events still in draft status
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Event Operations
              </h2>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Current event workflow and upcoming activities
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="text-xs font-semibold text-[var(--primary)]"
            >
              Manage events
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {upcomingEvents.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-[var(--muted)]" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                  No upcoming events
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Upcoming events will appear here when available.
                </p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 px-4 py-3.5 transition hover:bg-[var(--background)]"
                >
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                    {event.bannerImage ? (
                      <Image
                        src={event.bannerImage}
                        alt={event.title}
                        width={80}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-[var(--muted)]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-sm font-semibold text-[var(--foreground)]">
                        {event.title}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                          event.status,
                        )}`}
                      >
                        {getEventStatusLabel(event.status)}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
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
                    className="hidden shrink-0 self-center rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--background)] sm:inline-flex"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-4 py-3.5">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Management
            </h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {isChairman
                ? "Branch operational control areas"
                : "Webmaster control areas"}
            </p>
          </div>

          <div className="p-3">
            <Link
              href="/dashboard/users"
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--background)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
                <Users className="h-4 w-4 text-[var(--primary)]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Users
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Accounts and access
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>

            <Link
              href="/dashboard/leadership"
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--background)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Leadership
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Branch positions
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>

            <Link
              href="/dashboard/announcements"
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--background)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
                <Bell className="h-4 w-4 text-[var(--primary)]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Announcements
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Branch communication
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>

            <Link
              href="/dashboard/gallery"
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--background)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
                <GalleryHorizontal className="h-4 w-4 text-[var(--primary)]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Gallery
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Media and albums
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Recent Announcements
            </h2>

            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Latest branch communication
            </p>
          </div>

          <Link
            href="/dashboard/announcements"
            className="text-xs font-semibold text-[var(--primary)]"
          >
            View all
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Bell className="mx-auto h-7 w-7 text-[var(--muted)]" />

            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
              No announcements
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Published announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/dashboard/announcements/${announcement.id}`}
                className="rounded-xl border border-[var(--border)] p-3.5 transition hover:bg-[var(--background)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">
                    {announcement.title}
                  </h3>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
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

                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                  {announcement.content}
                </p>

                <p className="mt-3 text-[10px] text-[var(--muted)]">
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