import { Megaphone } from "lucide-react";
import Container from "@/components/ui/Container";

interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  publishedAt: string | null;
  createdAt: string;
}

interface AnnouncementsResponse {
  success: boolean;
  message: string;
  data: Announcement[];
}

async function getLatestAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/announcements`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const result: AnnouncementsResponse = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.slice(0, 8);
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

export default async function LatestAnnouncements() {
  const announcements = await getLatestAnnouncements();

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24">
      <Container>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
            Stay informed
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
            Latest Announcements
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Stay updated with the latest news, notices, opportunities,
            and important updates from the IEEE Geeta University
            Student Branch.
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white px-6 py-14 text-center">
            <Megaphone
              className="mx-auto text-[var(--muted)]"
              size={34}
            />

            <h3 className="mt-4 text-lg font-semibold text-[var(--secondary)]">
              No announcements yet
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Check back soon for the latest updates from IEEE GU.
            </p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
            <div className="h-[460px] overflow-y-auto overflow-x-hidden">
              <div className="divide-y divide-[var(--border)]">
                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="px-6 py-7 sm:px-10 sm:py-8"
                  >
                    <div className="flex items-start gap-5">
                      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                        <Megaphone size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          {formatDate(
                            announcement.publishedAt ??
                              announcement.createdAt,
                          )}
                        </p>

                        <h3 className="mt-2 text-xl font-bold leading-7 text-[var(--secondary)] sm:text-2xl">
                          {announcement.title}
                        </h3>

                        <p className="mt-3 max-w-5xl text-base leading-7 text-[var(--muted)]">
                          {announcement.summary ||
                            announcement.content}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}