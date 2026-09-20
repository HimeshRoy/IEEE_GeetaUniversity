"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

type User = {
  firstName: string;
  lastName: string | null;
  role: string;
  ieeeMembershipNumber: string | null;
  memberProfile: {
    membershipStatus: string;
    joinedAt: string | null;
  } | null;
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
};

type Announcement = {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  publishedAt?: string | null;
  createdAt: string;
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
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
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
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, eventsResponse, announcementsResponse] =
          await Promise.all([
            getCurrentUser(),
            api.get("/events/student"),
            api.get("/announcements"),
          ]);

        if (!mounted) return;

        const currentUser = userResponse?.data ?? userResponse;

        const eventData = eventsResponse.data?.data ?? [];
        const announcementData = announcementsResponse.data?.data ?? [];

        const now = new Date();

        const upcomingEvents = eventData
          .filter((event: Event) => new Date(event.eventDate) >= now)
          .sort(
            (a: Event, b: Event) =>
              new Date(a.eventDate).getTime() -
              new Date(b.eventDate).getTime(),
          )
          .slice(0, 3);

        const recentAnnouncements = announcementData
          .sort(
            (a: Announcement, b: Announcement) =>
              new Date(
                b.publishedAt || b.createdAt,
              ).getTime() -
              new Date(
                a.publishedAt || a.createdAt,
              ).getTime(),
          )
          .slice(0, 3);

        setUser(currentUser);
        setEvents(upcomingEvents);
        setAnnouncements(recentAnnouncements);
      } catch (requestError: any) {
        if (!mounted) return;

        setError(
          requestError?.response?.data?.message ||
            "Unable to load your dashboard.",
        );
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

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="mb-7">
          <div className="h-4 w-24 rounded bg-[var(--background)]" />
          <div className="mt-3 h-8 w-72 rounded bg-[var(--background)]" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-[var(--background)]" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="h-72 rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-2" />
          <div className="h-72 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-base font-semibold text-red-800">
            Unable to load dashboard
          </h1>
          <p className="mt-1.5 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const membershipStatus =
    user?.memberProfile?.membershipStatus || "NOT APPLIED";

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-7">
        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          Student Dashboard
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Welcome, {user?.firstName || "Student"}!
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
          Stay connected with IEEE Geeta University Student Branch.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Membership
              </p>

              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getMembershipClasses(
                  membershipStatus,
                )}`}
              >
                {membershipStatus.replace("_", " ")}
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <Link
            href="/dashboard/membership"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
          >
            View Membership
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                IEEE Membership Number
              </p>

              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                {user?.ieeeMembershipNumber || "Not available"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <UserRound className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Upcoming Events
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {events.length}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <Link
            href="/dashboard/events"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
          >
            Browse Events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Upcoming Events
              </h2>

              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Events available to you
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="text-xs font-semibold text-[var(--primary)]"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-[var(--muted)]" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                  No upcoming events
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  New events will appear here when they are published.
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 px-4 py-3.5 transition hover:bg-[var(--background)]"
                >
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                    {event.bannerImage ? (
                      <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-[var(--muted)]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-semibold text-[var(--foreground)]">
                      {event.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(event.eventDate)}
                      </span>

                      {event.startTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {formatTime(event.startTime)}
                          {event.endTime
                            ? ` - ${formatTime(event.endTime)}`
                            : ""}
                        </span>
                      )}

                      {event.venue && (
                        <span className="inline-flex max-w-full items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/events/${event.slug}`}
                    className="hidden shrink-0 items-center self-center rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] sm:inline-flex"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Announcements
              </h2>

              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Latest branch updates
              </p>
            </div>

            <Bell className="h-4 w-4 text-[var(--primary)]" />
          </div>

          <div className="divide-y divide-[var(--border)]">
            {announcements.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto h-7 w-7 text-[var(--muted)]" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                  No announcements
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  New announcements will appear here.
                </p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="px-4 py-3.5">
                  <h3 className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">
                    {announcement.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                    {announcement.excerpt ||
                      announcement.content ||
                      "View the announcement for more details."}
                  </p>

                  <p className="mt-2 text-[10px] text-[var(--muted)]">
                    {formatDate(
                      announcement.publishedAt || announcement.createdAt,
                    )}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[var(--border)] px-4 py-3">
            <Link
              href="/dashboard/announcements"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
            >
              View announcements
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}