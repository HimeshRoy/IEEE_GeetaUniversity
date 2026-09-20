"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  UserRound,
  UsersRound,
  QrCode,
} from "lucide-react";
import { api } from "@/lib/api";

type EventAccess =
  | "PUBLIC"
  | "UNIVERSITY"
  | "MEMBERS_ONLY"
  | "INVITE_ONLY";

type EventParticipationType = "INDIVIDUAL" | "TEAM";

type EventRegistrationTemplate =
  | "UNIVERSITY_INDIVIDUAL"
  | "UNIVERSITY_TEAM"
  | "INTER_UNIVERSITY_INDIVIDUAL"
  | "INTER_UNIVERSITY_TEAM"
  | "PUBLIC_INDIVIDUAL"
  | "PUBLIC_TEAM"
  | "CUSTOM";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description?: string | null;
  bannerImage: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  access: EventAccess;
  isFeatured: boolean;
  status: string;
  registrationDeadline: string | null;
  capacity: number | null;
  registrationTemplate: EventRegistrationTemplate | null;
  participationType: EventParticipationType;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  enableQrAttendance: boolean;
  _count?: {
    registrations: number;
  };
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(time: string | null) {
  if (!time) {
    return "Time not specified";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return "Time not specified";
  }

  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getEventDateTime(event: EventItem) {
  const time = event.startTime || event.eventDate;
  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return new Date(0);
  }

  return date;
}

function formatAccess(access: EventItem["access"]) {
  if (access === "MEMBERS_ONLY") {
    return "Members Only";
  }

  if (access === "UNIVERSITY") {
    return "University";
  }

  if (access === "INVITE_ONLY") {
    return "Invite Only";
  }

  return "Public";
}

function formatTemplate(
  template: EventRegistrationTemplate | null,
) {
  if (!template) {
    return null;
  }

  const labels: Record<EventRegistrationTemplate, string> = {
    UNIVERSITY_INDIVIDUAL: "University · Individual",
    UNIVERSITY_TEAM: "University · Team",
    INTER_UNIVERSITY_INDIVIDUAL:
      "Inter-University · Individual",
    INTER_UNIVERSITY_TEAM: "Inter-University · Team",
    PUBLIC_INDIVIDUAL: "Public · Individual",
    PUBLIC_TEAM: "Public · Team",
    CUSTOM: "Custom",
  };

  return labels[template];
}

function EventCard({ event }: { event: EventItem }) {
  const isPast = getEventDateTime(event) < new Date();

  const registrationClosed =
    Boolean(event.registrationDeadline) &&
    new Date(event.registrationDeadline as string).getTime() <
      Date.now();

  const teamEvent = event.participationType === "TEAM";

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-28 bg-[var(--surface)] sm:h-32">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CalendarDays className="h-8 w-8 text-[var(--muted)]" />
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[10px] font-semibold !text-white">
          {formatAccess(event.access)}
        </div>

        {event.isFeatured && (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--primary)] shadow-sm">
            Featured
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[var(--text)]">
          {event.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-4.5 text-[var(--muted)]">
          {event.shortDescription ||
            "IEEE Geeta University event"}
        </p>

        <div className="mt-3.5 space-y-2 text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatTime(event.startTime)}
              {event.endTime
                ? ` - ${formatTime(event.endTime)}`
                : ""}
              {" IST"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {event.venue || "Venue to be announced"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {teamEvent ? (
              <UsersRound className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <UserRound className="h-3.5 w-3.5 shrink-0" />
            )}

            <span>
              {teamEvent
                ? `Team${
                    event.minTeamSize
                      ? ` · ${event.minTeamSize}`
                      : ""
                  }${
                    event.maxTeamSize
                      ? `-${event.maxTeamSize}`
                      : ""
                  }`
                : "Individual"}
            </span>
          </div>

          {event.capacity !== null && (
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>
                {event._count?.registrations ?? 0} /{" "}
                {event.capacity} registered
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {formatTemplate(event.registrationTemplate) && (
            <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[9px] font-semibold text-[var(--muted)]">
              {formatTemplate(event.registrationTemplate)}
            </span>
          )}

          {event.enableQrAttendance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
              <QrCode className="h-3 w-3" />
              QR Attendance
            </span>
          )}

          {registrationClosed && !isPast && (
            <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-700">
              Registration Closed
            </span>
          )}
        </div>

        <Link
          href={`/dashboard/events/${event.slug}`}
          className="mt-3.5 block rounded-lg bg-[var(--primary)] px-3 py-2 text-center text-xs font-semibold !text-white transition-opacity hover:opacity-90"
        >
          View Event
        </Link>
      </div>
    </article>
  );
}

export default function StudentEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get("/events/student");

        if (!isMounted) {
          return;
        }

        const responseData = response?.data;

        const data =
          responseData?.data?.data ??
          responseData?.data ??
          responseData;

        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        const message =
          typeof error === "object" &&
          error !== null &&
          "response" in error
            ? (
                error as {
                  response?: {
                    data?: {
                      message?: string;
                    };
                  };
                }
              ).response?.data?.message
            : undefined;

        setError(
          message || "Unable to load events right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();

    const upcoming = events
      .filter(
        (event) => getEventDateTime(event) >= now,
      )
      .sort(
        (a, b) =>
          getEventDateTime(a).getTime() -
          getEventDateTime(b).getTime(),
      );

    const past = events
      .filter(
        (event) => getEventDateTime(event) < now,
      )
      .sort(
        (a, b) =>
          getEventDateTime(b).getTime() -
          getEventDateTime(a).getTime(),
      );

    return {
      upcomingEvents: upcoming,
      pastEvents: past,
    };
  }, [events]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-[var(--primary)]">
          IEEE Geeta University
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
          Events
        </h1>

        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Discover upcoming and past IEEE events available
          to you.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading events...
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        events.length === 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-white p-10 text-center">
            <CalendarDays className="mx-auto h-9 w-9 text-[var(--muted)]" />

            <h2 className="mt-3 text-base font-semibold text-[var(--text)]">
              No events available
            </h2>

            <p className="mt-1.5 text-sm text-[var(--muted)]">
              There are currently no published events
              available for you.
            </p>
          </div>
        )}

      {!isLoading &&
        !error &&
        events.length > 0 && (
          <>
            {upcomingEvents.length > 0 && (
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text)]">
                      Upcoming Events
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Events you can attend or register for.
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                    {upcomingEvents.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text)]">
                      Past Events
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Previously conducted IEEE events.
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                    {pastEvents.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcomingEvents.length === 0 &&
              pastEvents.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-white p-5 text-center">
                  <p className="text-sm text-[var(--muted)]">
                    There are no upcoming events currently
                    available.
                  </p>
                </div>
              )}
          </>
        )}
    </div>
  );
}