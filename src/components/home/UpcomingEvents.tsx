import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";

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

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const result: EventsResponse = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    return result.data
      .filter((event) => new Date(event.eventDate) >= new Date())
      .slice(0, 3);
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

export default async function UpcomingEvents() {
  const events = await getUpcomingEvents();

  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              What's happening
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              Upcoming Events
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Discover upcoming technical events, workshops,
              sessions, and activities organized by the IEEE
              Geeta University Student Branch.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
          >
            View all events
            <ArrowRight size={17} />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
            <CalendarDays
              className="mx-auto text-[var(--muted)]"
              size={32}
            />

            <h3 className="mt-4 text-lg font-semibold text-[var(--secondary)]">
              No upcoming events
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Check back soon for upcoming IEEE GU activities.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-shadow hover:shadow-md"
              >
                <Link href={`/events/${event.slug}`}>
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface)]">
                    {event.bannerImage ? (
                      <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays
                          size={40}
                          className="text-[var(--muted-light)]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
                      <CalendarDays size={15} />
                      {formatDate(event.eventDate)}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-[var(--secondary)] transition-colors group-hover:text-[var(--primary)]">
                      {event.title}
                    </h3>

                    {event.shortDescription && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {event.shortDescription}
                      </p>
                    )}

                    {event.venue && (
                      <div className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)]">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="line-clamp-1">
                          {event.venue}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}