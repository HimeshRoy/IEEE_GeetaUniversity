import Link from "next/link";
import { ArrowRight, ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";
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

interface EventResponse {
  success: boolean;
  message: string;
  data: Event;
}

async function getEvent(slug: string): Promise<Event | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/slug/${slug}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const result: EventResponse = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
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

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return (
      <section className="bg-[var(--surface)] py-24">
        <Container>
          <div className="mx-auto max-w-xl rounded-xl border border-[var(--border)] bg-white px-6 py-12 text-center">
            <CalendarDays size={38} className="mx-auto text-[var(--muted)]" />

            <h1 className="mt-5 text-2xl font-bold text-[var(--secondary)]">
              Event not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              The event you are looking for does not exist or is no longer
              available.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white hover:bg-[var(--primary-dark)]"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);

  return (
    <>
      <section className="bg-[var(--surface)] py-8 sm:py-10">
        <Container>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
           <div className="relative h-44 bg-[var(--surface)] sm:h-52 lg:h-60">
              {event.bannerImage ? (
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <CalendarDays
                    size={52}
                    className="text-[var(--muted-light)]"
                  />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                  {getAccessLabel(event.access)}
                </span>

                {event.isFeatured && (
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              {event.shortDescription && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  {event.shortDescription}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <CalendarDays size={17} className="text-[var(--primary)]" />

                  <span>{formatDate(event.eventDate)}</span>
                </div>

                {startTime && (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Clock3 size={17} className="text-[var(--primary)]" />

                    <span>
                      {startTime}
                      {endTime ? ` – ${endTime}` : ""}
                    </span>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <MapPin size={17} className="text-[var(--primary)]" />

                    <span>{event.venue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <article>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                About the event
              </p>

              <h2 className="mt-3 text-2xl font-bold text-[var(--secondary)] sm:text-3xl">
                Event Details
              </h2>

              <div className="mt-6 whitespace-pre-line text-base leading-8 text-[var(--muted)]">
                {event.description}
              </div>
            </article>

            <aside className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-lg font-bold text-[var(--secondary)]">
                Event Information
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--secondary)]">
                    {formatDate(event.eventDate)}
                  </p>
                </div>

                {startTime && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--secondary)]">
                      {startTime}
                      {endTime ? ` – ${endTime}` : ""}
                    </p>
                  </div>
                )}

                {event.venue && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Venue
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--secondary)]">
                      {event.venue}
                    </p>
                  </div>
                )}

                {event.registrationDeadline && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Registration Deadline
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--secondary)]">
                      {formatDate(event.registrationDeadline)}
                    </p>
                  </div>
                )}

                {event.capacity !== null && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Capacity
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--secondary)]">
                      {event.capacity} participants
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Access
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--secondary)]">
                    {getAccessLabel(event.access)}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--border)] pt-6">
                <Link
                  href={`/events/${event.slug}/register`}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[var(--primary-dark)]"
                >
                  Register for Event
                  <ArrowRight size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
