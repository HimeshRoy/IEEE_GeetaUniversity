"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { api } from "@/lib/api";

type Registration = {
  id: string;
  eventId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  registrationStatus:
    | "REGISTERED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "WAITLISTED";
  registeredAt: string;
  attendedAt: string | null;
  event: {
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

function getStatusClasses(status: Registration["registrationStatus"]) {
  switch (status) {
    case "REGISTERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ATTENDED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "WAITLISTED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ABSENT":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRegistrations() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/registrations/me");

        if (!mounted) return;

        setRegistrations(response.data?.data ?? []);
      } catch (requestError: any) {
        if (!mounted) return;

        if (requestError?.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            requestError?.response?.data?.message ||
              "Unable to load your registrations.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadRegistrations();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-7">
        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          Events
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              My Registrations
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              View the events you have registered for and track your
              participation status.
            </p>
          </div>

          <Link
            href="/dashboard/events"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-sm font-semibold !text-white transition hover:opacity-90"
          >
            <Ticket className="h-4 w-4" />
            Browse Events
          </Link>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="animate-pulse overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="h-28 bg-[var(--background)]" />

              <div className="space-y-3 p-3.5">
                <div className="h-4 w-3/4 rounded bg-[var(--background)]" />
                <div className="h-3 w-full rounded bg-[var(--background)]" />
                <div className="h-3 w-2/3 rounded bg-[var(--background)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-800">
            Unable to load registrations
          </h2>

          <p className="mt-1.5 text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)]">
            <Ticket className="h-5 w-5 text-[var(--muted)]" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
            No registrations yet
          </h2>

          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[var(--muted)]">
            You have not registered for any IEEE Geeta University Student
            Branch events yet.
          </p>

          <Link
            href="/dashboard/events"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold !text-white hover:opacity-90"
          >
            Explore Events
          </Link>
        </div>
      )}

      {!loading && !error && registrations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {registrations.map((registration) => (
            <article
              key={registration.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="relative h-28 bg-[var(--background)] sm:h-32">
                {registration.event.bannerImage ? (
                  <img
                    src={registration.event.bannerImage}
                    alt={registration.event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Ticket className="h-8 w-8 text-[var(--muted)]" />
                  </div>
                )}

                <div className="absolute right-2.5 top-2.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
                      registration.registrationStatus,
                    )}`}
                  >
                    {registration.registrationStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="p-3.5">
                <h2 className="line-clamp-1 text-base font-bold text-[var(--foreground)]">
                  {registration.event.title}
                </h2>

                {registration.event.shortDescription && (
                  <p className="mt-1 line-clamp-1 text-xs leading-5 text-[var(--muted)]">
                    {registration.event.shortDescription}
                  </p>
                )}

                <div className="mt-3 space-y-2 text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                    <span>{formatDate(registration.event.eventDate)}</span>
                  </div>

                  {registration.event.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                      <span>
                        {formatTime(registration.event.startTime)}
                        {registration.event.endTime
                          ? ` - ${formatTime(registration.event.endTime)}`
                          : ""}
                        {" IST"}
                      </span>
                    </div>
                  )}

                  {registration.event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                      <span className="line-clamp-1">
                        {registration.event.venue}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <p className="text-[10px] text-[var(--muted)]">
                    Registered {formatDate(registration.registeredAt)}
                  </p>

                  <Link
                    href={`/dashboard/events/${registration.event.slug}`}
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}