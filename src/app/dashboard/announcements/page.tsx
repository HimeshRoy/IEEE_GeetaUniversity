"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Megaphone,
} from "lucide-react";
import { api } from "@/lib/api";

type Announcement = {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  publishedAt?: string | null;
  createdAt: string;
};

type DateFilter = "7" | "15" | "30" | "all";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getAnnouncementText(announcement: Announcement) {
  return (
    announcement.content ||
    announcement.excerpt ||
    "No additional details are available for this announcement."
  );
}

function getAnnouncementDate(announcement: Announcement) {
  return new Date(
    announcement.publishedAt || announcement.createdAt,
  ).getTime();
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAnnouncements() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/announcements");

        if (!mounted) {
          return;
        }

        const data = response.data?.data ?? [];

        const sorted = [...data].sort(
          (a: Announcement, b: Announcement) =>
            getAnnouncementDate(b) - getAnnouncementDate(a),
        );

        setAnnouncements(sorted);
      } catch (requestError: any) {
        if (!mounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            "Unable to load announcements.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadAnnouncements();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredAnnouncements = useMemo(() => {
    if (dateFilter === "all") {
      return announcements;
    }

    const days = Number(dateFilter);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return announcements.filter(
      (announcement) => getAnnouncementDate(announcement) >= cutoff,
    );
  }, [announcements, dateFilter]);

  const filterLabel =
    dateFilter === "7"
      ? "Last 7 days"
      : dateFilter === "15"
        ? "Last 15 days"
        : dateFilter === "30"
          ? "Last 30 days"
          : "All time";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-7">
        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          Community
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Announcements
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Stay updated with the latest announcements from IEEE Geeta
              University Student Branch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--background)]">
              <Bell className="h-5 w-5 text-[var(--primary)]" />
            </div>

            <div className="relative">
              <select
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value as DateFilter)
                }
                className="h-10 appearance-none rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-3 pr-9 text-xs font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              >
                <option value="7">Last 7 days</option>
                <option value="15">Last 15 days</option>
                <option value="30">Last 30 days</option>
                <option value="all">All time</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
            </div>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--muted)]">
            {filterLabel}
          </p>

          <p className="text-xs font-medium text-[var(--muted)]">
            {filteredAnnouncements.length}{" "}
            {filteredAnnouncements.length === 1
              ? "announcement"
              : "announcements"}
          </p>
        </div>
      )}

      {loading && (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse border-b border-[var(--border)] p-5 last:border-b-0"
            >
              <div className="flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-[var(--background)]" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-3/5 rounded bg-[var(--background)]" />
                  <div className="mt-2 h-3 w-1/4 rounded bg-[var(--background)]" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-[var(--background)]" />
                <div className="h-3 w-full rounded bg-[var(--background)]" />
                <div className="h-3 w-4/5 rounded bg-[var(--background)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-800">
            Unable to load announcements
          </h2>

          <p className="mt-1.5 text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        filteredAnnouncements.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)]">
              <Megaphone className="h-5 w-5 text-[var(--muted)]" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
              No announcements found
            </h2>

            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[var(--muted)]">
              There are no published announcements available for the selected
              time period.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        filteredAnnouncements.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {filteredAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                className="border-b border-[var(--border)] p-5 last:border-b-0 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)]">
                    <Megaphone className="h-4.5 w-4.5 text-[var(--primary)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold leading-6 text-[var(--foreground)] sm:text-lg">
                      {announcement.title}
                    </h2>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(
                          announcement.publishedAt ||
                            announcement.createdAt,
                        )}
                      </span>

                      <span className="hidden sm:inline">
                        •
                      </span>

                      <span>IEEE GU Student Branch</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
                  {getAnnouncementText(announcement)}
                </div>
              </article>
            ))}
          </div>
        )}
    </div>
  );
}