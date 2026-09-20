"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import Container from "@/components/ui/Container";

const orbitItems = [
  {
    label: "INNOVATION",
    delay: 0,
  },
  {
    label: "COMMUNITY",
    delay: 5.67,
  },
  {
    label: "LEADERSHIP",
    delay: 11.33,
  },
];

const orbitRadius = 205;
const orbitDuration = 20;

function getOrbitPosition(
  angle: number,
  radius: number,
) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,98,155,0.08),transparent_35%)]" />

      <Container className="relative z-10">
        <div className="grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--primary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              IEEE Geeta University Student Branch
            </div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-[var(--secondary)] sm:text-5xl lg:text-6xl">
              Building a stronger
              <span className="block text-[var(--primary)]">
                technical community.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              A student-led community focused on technology,
              innovation, professional development, leadership,
              and meaningful opportunities for students at
              Geeta University.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[var(--primary-dark)]"
              >
                Explore Events
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/membership"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--secondary)] transition-colors hover:bg-[var(--surface)]"
              >
                <CalendarDays size={17} />
                Join IEEE
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative h-[500px] w-[500px]">
              <div className="absolute inset-[4%] rounded-full border border-[var(--border)]" />

              <div className="absolute inset-[11%] rounded-full border border-dashed border-[var(--primary)]/30" />

              <div className="absolute inset-[25%] rounded-full bg-[var(--primary)]/[0.025] blur-2xl" />

              <div className="absolute left-1/2 top-1/2 z-20 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-xl">
                <Image
                  src="/gulogo.png"
                  alt="Geeta University"
                  width={150}
                  height={150}
                  className="h-32 w-32 object-contain"
                  priority
                />
              </div>

              <div className="absolute inset-0">
                {orbitItems.map((item, index) => {
                  const startAngle =
                    -90 + index * 120;

                  const keyframes = Array.from(
                    { length: 13 },
                    (_, frame) => {
                      const angle =
                        startAngle +
                        frame * 30;

                      return getOrbitPosition(
                        angle,
                        orbitRadius,
                      );
                    },
                  );

                  return (
                    <motion.div
                      key={item.label}
                      className="absolute left-1/2 top-1/2 z-30 h-11 w-36 -ml-[72px] -mt-[22px]"
                      animate={{
                        x: keyframes.map(
                          (position) => position.x,
                        ),
                        y: keyframes.map(
                          (position) => position.y,
                        ),
                      }}
                      transition={{
                        duration: orbitDuration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: -item.delay,
                        times: Array.from(
                          { length: 15 },
                          (_, frame) =>
                            frame / 12,
                        ),
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white/95 px-4 shadow-md backdrop-blur-sm">
                        <span className="whitespace-nowrap text-xs font-bold tracking-wide text-[var(--primary)]">
                          {item.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="absolute left-1/2 top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)]" />

              <div className="absolute left-1/2 top-[11%] h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--primary)]/50" />

              <div className="absolute bottom-[11%] left-[27%] h-2 w-2 rounded-full bg-[var(--primary)]/50" />

              <div className="absolute bottom-[11%] right-[27%] h-2 w-2 rounded-full bg-[var(--primary)]/50" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}