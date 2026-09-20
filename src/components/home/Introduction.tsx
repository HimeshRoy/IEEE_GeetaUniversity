import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";

export default function Introduction() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              About the Branch
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              A community built around technology and growth.
            </h2>
          </div>

          <div>
            <p className="text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              The IEEE Geeta University Student Branch brings
              together students and faculty with a shared interest
              in technology, engineering, innovation, and
              professional development.
            </p>

            <p className="mt-5 text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Through technical events, learning opportunities,
              collaborative activities, and student leadership,
              the branch creates an environment where students
              can learn, contribute, and connect with a wider
              technical community.
            </p>

            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
            >
              Learn more about IEEE
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}