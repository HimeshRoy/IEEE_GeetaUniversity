import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import EventCalendar from "@/components/events/EventCalendar";

interface Event {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  bannerImage: string | null;
  venue: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  access: "PUBLIC" | "UNIVERSITY" | "MEMBERS_ONLY" | "INVITE_ONLY";
  status: string;
  isFeatured: boolean;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string | null;
  };
  _count: {
    registrations: number;
  };
}

interface EventsResponse {
  success: boolean;
  message: string;
  data: Event[];
}

async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result: EventsResponse = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    return result.data;
  } catch {
    return [];
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getAccessLabel(access: Event["access"]) {
  switch (access) {
    case "MEMBERS_ONLY":
      return "Members Only";
    case "UNIVERSITY":
      return "University";
    case "INVITE_ONLY":
      return "Invite Only";
    default:
      return "Open Event";
  }
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isEventOngoing(event: Event, now: Date) {
  const eventDate = new Date(event.eventDate);

  if (!isSameDay(eventDate, now)) {
    return false;
  }

  if (!event.startTime) {
    return false;
  }

  const start = new Date(event.startTime);
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(start.getTime() + 60 * 60 * 1000);

  return now >= start && now <= end;
}

function isEventPast(event: Event, now: Date) {
  if (event.endTime) {
    return new Date(event.endTime) < now;
  }

  return new Date(event.eventDate) < now;
}

function EventCard({
  event,
  compact = false,
}: {
  event: Event;
  compact?: boolean;
}) {
  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);

  return (
    <article
      className={[
        "group overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-md",
        compact ? "flex" : "",
      ].join(" ")}
    >
      <Link
        href={`/events/${event.slug}`}
        className={compact ? "flex w-full" : "block"}
      >
        <div
          className={[
            "relative overflow-hidden bg-[var(--surface)]",
            compact ? "h-24 w-28 shrink-0 sm:h-28 sm:w-36" : "aspect-[16/7]",
          ].join(" ")}
        >
          {event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays
                size={compact ? 28 : 40}
                className="text-[var(--muted-light)] transition-colors duration-300 group-hover:text-[var(--primary)]"
              />
            </div>
          )}

          {!compact && (
            <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[var(--secondary)] shadow-sm">
              {getAccessLabel(event.access)}
            </div>
          )}
        </div>

        <div className={compact ? "min-w-0 flex-1 p-4" : "p-4"}>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
            <CalendarDays size={14} className="transition-transform duration-300 group-hover:scale-110" />
            {formatDate(event.eventDate)}
          </div>

          <h3
            className={[
              "mt-2 font-bold text-[var(--secondary)] transition-colors duration-300 group-hover:text-[var(--primary)]",
              compact ? "line-clamp-2 text-sm" : "line-clamp-2 text-lg",
            ].join(" ")}
          >
            {event.title}
          </h3>

          {!compact && event.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
              {event.shortDescription}
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            {startTime && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Clock3 size={14} className="transition-colors duration-300 group-hover:text-[var(--primary)]" />
                <span>
                  {startTime}
                  {endTime ? ` – ${endTime}` : ""}
                </span>
              </div>
            )}

            {event.venue && (
              <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
                <MapPin size={14} className="mt-0.5 shrink-0 transition-colors duration-300 group-hover:text-[var(--primary)]" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            )}
          </div>

          {!compact && (
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              View details
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default async function EventsPage() {
  const events = await getEvents();

  const now = new Date();

  const ongoingEvents = events.filter((event) => isEventOngoing(event, now));

  const upcomingEvents = events.filter(
    (event) => !isEventOngoing(event, now) && !isEventPast(event, now),
  );

  const pastEvents = events.filter((event) => isEventPast(event, now));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--primary-light)] py-16 sm:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                IEEE GU Activities
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-5xl">
                Events
              </h1>

              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                Explore technical events, workshops, sessions, competitions, and
                other activities organized by the IEEE Geeta University Student
                Branch.
              </p>
            </div>

            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium italic text-[var(--primary)]">
                Learn&nbsp;&nbsp;•&nbsp;&nbsp;Connect&nbsp;&nbsp;•&nbsp;&nbsp;Grow
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="flex items-end justify-between gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <CalendarDays size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--secondary)] sm:text-3xl">
                  Upcoming Events
                </h2>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)]">
                Discover what's coming up at IEEE GU.
              </p>
            </div>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center animate-in fade-in duration-700 ease-out">
              <CalendarDays size={34} className="mx-auto text-[var(--muted)]" />

              <h3 className="mt-4 font-semibold text-[var(--secondary)]">
                No upcoming events
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Check back soon for new IEEE GU activities.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 6).map((event, index) => (
                <div 
                  key={event.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {ongoingEvents.length > 0 && (
        <section className="border-y border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16">
          <Container>
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--secondary)] sm:text-3xl">
                  Ongoing Events
                </h2>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)]">
                Events happening right now.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {ongoingEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard event={event} compact />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="animate-in fade-in duration-700 ease-out">
            <EventCalendar
              events={events.map((event) => ({
                id: event.id,
                title: event.title,
                slug: event.slug,
                eventDate: event.eventDate,
                startTime: event.startTime,
                endTime: event.endTime,
                venue: event.venue,
                bannerImage: event.bannerImage,
                access: event.access,
              }))}
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16">
        <Container>
          <div className="flex items-end justify-between gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Clock3 size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--secondary)] sm:text-3xl">
                  Past Events
                </h2>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)]">
                Take a look at previous IEEE GU activities.
              </p>
            </div>
          </div>

          {pastEvents.length === 0 ? (
            <div className="mt-8 rounded-xl border border-[var(--border)] bg-white px-6 py-12 text-center animate-in fade-in duration-700 ease-out">
              <p className="text-sm text-[var(--muted)]">
                No past events available.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.slice(0, 6).map((event, index) => (
                <div 
                  key={event.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard event={event} compact />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}