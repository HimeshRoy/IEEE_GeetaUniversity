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
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
              What's happening
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              Upcoming Events
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
              Discover upcoming technical events, workshops,
              sessions, and activities organized by the IEEE
              Geeta University Student Branch.
            </p>
          </div>

          <Link
            href="/events"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
          >
            View all events
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 px-6 py-16 text-center animate-in fade-in duration-700 ease-out">
            <CalendarDays
              className="mx-auto text-[var(--muted-foreground)]"
              size={36}
            />

            <h3 className="mt-5 text-lg font-bold text-[var(--secondary)]">
              No upcoming events
            </h3>

            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Check back soon for upcoming IEEE GU activities.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <article
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/events/${event.slug}`} className="flex flex-col h-full">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface)]">
                    {event.bannerImage ? (
                      <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center transition-colors duration-300 group-hover:bg-[var(--surface)]/80">
                        <CalendarDays
                          size={40}
                          className="text-[var(--muted-light)] transition-transform duration-500 group-hover:scale-110 group-hover:text-[var(--primary)]/40"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
                      <CalendarDays size={16} className="transition-transform duration-300 group-hover:scale-110" />
                      {formatDate(event.eventDate)}
                    </div>

                    <h3 className="mt-4 line-clamp-2 text-xl font-bold text-[var(--secondary)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                      {event.title}
                    </h3>

                    {event.shortDescription && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {event.shortDescription}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      {event.venue && (
                        <div className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                          <MapPin
                            size={18}
                            className="mt-0.5 shrink-0 transition-colors duration-300 group-hover:text-[var(--primary)]"
                          />
                          <span className="line-clamp-1">
                            {event.venue}
                          </span>
                        </div>
                      )}
                    </div>
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