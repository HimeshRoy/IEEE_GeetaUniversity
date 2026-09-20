import {
  CalendarDays,
  GraduationCap,
  Lightbulb,
  Users,
} from "lucide-react";
import Container from "@/components/ui/Container";

const highlights = [
  {
    icon: Users,
    title: "Student Community",
    description:
      "A collaborative community where students connect, learn, and contribute beyond the classroom.",
  },
  {
    icon: CalendarDays,
    title: "Technical Events",
    description:
      "Workshops, sessions, competitions, and activities designed to encourage technical learning.",
  },
  {
    icon: Lightbulb,
    title: "Innovation & Ideas",
    description:
      "An environment that encourages students to explore ideas, build solutions, and take initiative.",
  },
  {
    icon: GraduationCap,
    title: "Learning & Growth",
    description:
      "Opportunities for students to develop technical, professional, and leadership skills.",
  },
];

export default function ImpactHighlights() {
  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
            Our impact
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
            Learn. Build. Lead.
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            IEEE Geeta University Student Branch provides a platform for
            students to learn from one another, participate in meaningful
            activities, and grow as future technology professionals.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;

            return (
              <div
                key={highlight.title}
                className="rounded-xl border border-[var(--border)] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                  <Icon size={21} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[var(--secondary)]">
                  {highlight.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {highlight.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}