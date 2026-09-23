import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Flag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
      <section className="min-h-screen bg-[var(--background)] py-24">
        <Container>
          <div className="mx-auto flex min-h-[400px] max-w-xl flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-white px-6 py-12 text-center shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface)]">
              <CalendarDays
                size={32}
                className="text-[var(--muted-foreground)]"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--secondary)] sm:text-3xl">
              Event not found
            </h1>

            <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">
              The event you are looking for does not exist or is no longer
              available.
            </p>

            <Link
              href="/events"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20"
            >
              <ArrowLeft
                size={18}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
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
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header & Banner Section */}
      <section className="pt-10 sm:pt-14">
        <Container>
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <Link
              href="/events"
              className="group mb-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] transition-colors duration-300 hover:text-[var(--primary)]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Back to Events
            </Link>

            <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface)] sm:aspect-[21/9] lg:aspect-[24/9]">
                {event.bannerImage ? (
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <CalendarDays
                      size={64}
                      className="text-[var(--muted-light)]"
                    />
                  </div>
                )}
              </div>

              <div className="p-8 sm:p-10 lg:p-12">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                    {getAccessLabel(event.access)}
                  </span>

                  {event.isFeatured && (
                    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--secondary)] shadow-sm">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                  {event.title}
                </h1>

                {event.shortDescription && (
                  <p className="mt-6 max-w-3xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg sm:leading-8">
                    {event.shortDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content Grid Section */}
      <section className="mt-12 sm:mt-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16 xl:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <article className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-150 fill-mode-both">
              <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] shadow-sm">
                About the event
              </span>

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--secondary)] sm:text-3xl">
                Event Details
              </h2>

              <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg sm:leading-8">
                {event.description}
              </div>
            </article>

            {/* Sidebar Details */}
            <aside className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-300 fill-mode-both">
              <div className="sticky top-24 rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold tracking-tight text-[var(--secondary)]">
                  Event Information
                </h3>

                <ul className="mt-8 space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <CalendarDays size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                        Date
                      </p>
                      <p className="mt-1 text-base font-semibold text-[var(--secondary)]">
                        {formatDate(event.eventDate)}
                      </p>
                    </div>
                  </li>

                  {startTime && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Clock3 size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                          Time
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--secondary)]">
                          {startTime}
                          {endTime ? ` – ${endTime}` : ""}
                        </p>
                      </div>
                    </li>
                  )}

                  {event.venue && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                          Venue
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--secondary)]">
                          {event.venue}
                        </p>
                      </div>
                    </li>
                  )}

                  {event.capacity !== null && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Users size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                          Capacity
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--secondary)]">
                          {event.capacity} participants
                        </p>
                      </div>
                    </li>
                  )}

                  {event.registrationDeadline && event.status === "PUBLISHED" && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Flag size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                          Registration Deadline
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--secondary)]">
                          {formatDate(event.registrationDeadline)}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>

                <div className="mt-10 border-t border-[var(--border)] pt-8">
                  {event.status === "COMPLETED" ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-bold text-emerald-700">
                      <CheckCircle2 size={19} />
                      Event Completed
                    </div>
                  ) : event.status === "CANCELLED" ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-600">
                      <XCircle size={19} />
                      Event Cancelled
                    </div>
                  ) : (
                    <Link
                      href={`/events/${event.slug}/register`}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 text-sm font-bold !text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20"
                    >
                      Register for Event
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
