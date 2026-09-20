import {
  Award,
  Code2,
  Network,
  Rocket,
} from "lucide-react";
import Container from "@/components/ui/Container";

const benefits = [
  {
    icon: Network,
    title: "Connect",
    description:
      "Meet students, faculty, and people with similar interests through the IEEE community.",
  },
  {
    icon: Code2,
    title: "Learn",
    description:
      "Take part in technical sessions, workshops, and activities that complement your academic learning.",
  },
  {
    icon: Rocket,
    title: "Build",
    description:
      "Turn ideas into practical projects while gaining experience through collaborative activities.",
  },
  {
    icon: Award,
    title: "Grow",
    description:
      "Develop communication, teamwork, leadership, and professional skills through active participation.",
  },
];

export default function WhyJoinIEEE() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              Become a member
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              Why Join IEEE?
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              IEEE membership gives students an opportunity to become
              part of a global professional community while actively
              contributing to their local student branch.
            </p>

            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
              At IEEE Geeta University Student Branch, members can
              participate in activities that encourage technical
              learning, collaboration, innovation, and leadership.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-[var(--border)] bg-white p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[var(--secondary)]">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}