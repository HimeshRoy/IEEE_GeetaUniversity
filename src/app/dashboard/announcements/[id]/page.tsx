"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export default function AnnouncementDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function loadAnnouncement() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/announcements/${id}`);

        if (!mounted) return;

        setAnnouncement(response.data?.data ?? null);
      } catch (requestError: any) {
        if (!mounted) return;

        if (requestError?.response?.status === 404) {
          setError("This announcement could not be found.");
        } else {
          setError(
            requestError?.response?.data?.message ||
              "Unable to load this announcement.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadAnnouncement();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-4 w-28 rounded bg-[var(--background)]" />
          <div className="mt-5 h-10 w-4/5 rounded bg-[var(--background)]" />
          <div className="mt-3 h-4 w-40 rounded bg-[var(--background)]" />
          <div className="mt-7 h-56 rounded-2xl bg-[var(--background)]" />
          <div className="mt-7 space-y-3">
            <div className="h-4 w-full rounded bg-[var(--background)]" />
            <div className="h-4 w-full rounded bg-[var(--background)]" />
            <div className="h-4 w-5/6 rounded bg-[var(--background)]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !announcement) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Announcement unavailable
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error || "This announcement is not available."}
          </p>

          <Link
            href="/announcements"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold !text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Announcements
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Announcements
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {announcement.imageUrl && (
          <div className="aspect-[16/7] w-full overflow-hidden bg-[var(--background)]">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--background)]">
              <Megaphone className="h-4 w-4 text-[var(--primary)]" />
            </div>

            <span className="text-xs font-semibold text-[var(--primary)]">
              IEEE GU Student Branch
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {announcement.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
            <CalendarDays className="h-3.5 w-3.5" />

            <span>
              Published{" "}
              {formatDate(
                announcement.publishedAt || announcement.createdAt,
              )}
            </span>
          </div>

          <div className="my-6 border-t border-[var(--border)]" />

          <div className="whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)] sm:text-base sm:leading-8">
            {announcement.content}
          </div>
        </div>
      </article>
    </main>
  );
}