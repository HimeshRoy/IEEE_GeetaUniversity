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
      }
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
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-8 sm:py-20">
      <Container>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Stay informed
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
            Latest Announcements
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
            Stay updated with the latest news, notices, opportunities,
            and important updates from the IEEE Geeta University
            Student Branch.
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-[var(--border)] bg-white px-6 py-16 text-center shadow-sm animate-in fade-in duration-700 ease-out delay-150 fill-mode-both">
            <Megaphone
              className="mx-auto text-[var(--muted-foreground)]"
              size={12}
            />

            <h3 className="mt-5 text-lg font-bold text-[var(--secondary)]">
              No announcements yet
            </h3>

            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Check back soon for the latest updates from IEEE GU.
            </p>
          </div>
        ) : (
          <div className="mt-12 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-150 fill-mode-both">
            <div className="h-[480px] overflow-y-auto overflow-x-hidden">
              <div className="divide-y divide-[var(--border)]">
                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="group px-6 py-8 transition-colors duration-300 hover:bg-[var(--surface)]/50 sm:px-10"
                  >
                    <div className="flex items-start gap-5 sm:gap-6">
                      <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:shadow-md">
                        <Megaphone size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors duration-300 group-hover:text-[var(--primary-dark)]">
                          {formatDate(
                            announcement.publishedAt ?? announcement.createdAt
                          )}
                        </p>

                        <h3 className="mt-2 text-xl font-bold leading-tight text-[var(--secondary)] transition-colors duration-300 group-hover:text-[var(--primary)] sm:text-2xl">
                          {announcement.title}
                        </h3>

                        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                          {announcement.summary || announcement.content}
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
