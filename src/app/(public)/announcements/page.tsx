"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Bell, CalendarDays, Loader2 } from "lucide-react";
import Container from "@/components/ui/Container";
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

type AnnouncementsResponse = {
  success: boolean;
  data: Announcement[];
  message?: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getExcerpt(content: string) {
  const cleanContent = content.replace(/\s+/g, " ").trim();

  if (cleanContent.length <= 220) {
    return cleanContent;
  }

  return `${cleanContent.slice(0, 220).trim()}...`;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await api.get<AnnouncementsResponse>("/announcements");

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch announcements",
          );
        }

        setAnnouncements(response.data.data);
      } catch (error) {
        if (axiosErrorMessage(error)) {
          setError(axiosErrorMessage(error));
        } else {
          setError("Unable to load announcements right now.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container>
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--primary)]">
                <Bell className="h-4 w-4" />
                Announcements
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
                Latest updates from IEEE Geeta University
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
                Stay informed about the latest updates, opportunities, and
                important announcements from the IEEE Geeta University
                Student Branch.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Announcements */}
      <section>
        <Container>
          <div className="py-12 sm:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                Branch updates
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Announcements
              </h2>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="mt-8 flex min-h-56 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                  Loading announcements...
                </div>
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[var(--primary)]">
                    <AlertCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      Unable to load announcements
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Real empty state */}
            {!isLoading && !error && announcements.length === 0 && (
              <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center sm:p-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)] text-[var(--primary)]">
                  <Bell className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
                  No announcements available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                  There are currently no published public announcements from
                  the IEEE Geeta University Student Branch.
                </p>
              </div>
            )}

            {/* Real API data */}
            {!isLoading && !error && announcements.length > 0 && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-shadow hover:shadow-md"
                  >
                    {announcement.imageUrl && (
                      <div className="h-48 overflow-hidden bg-[var(--background)] sm:h-56">
                        <img
                          src={announcement.imageUrl}
                          alt={announcement.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                        <CalendarDays className="h-4 w-4" />

                        <time
                          dateTime={
                            announcement.publishedAt ||
                            announcement.createdAt
                          }
                        >
                          {formatDate(
                            announcement.publishedAt ||
                              announcement.createdAt,
                          )}
                        </time>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">
                        {announcement.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                        {getExcerpt(announcement.content)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}

function axiosErrorMessage(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return null;
}