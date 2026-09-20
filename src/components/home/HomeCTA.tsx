import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import Container from "@/components/ui/Container";

export default function HomeCTA() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <div className="overflow-hidden rounded-2xl bg-[var(--secondary)] px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white">
                <Users size={21} />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Be part of the IEEE GU community.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Explore opportunities to learn, connect, build, and contribute
                through the IEEE Geeta University Student Branch.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[var(--secondary)] transition-colors hover:bg-slate-100"
              >
                Explore Events
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-semibold !text-white transition-colors hover:bg-white/10"
              >
                Join IEEE
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
