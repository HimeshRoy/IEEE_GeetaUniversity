"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  ServerCog,
} from "lucide-react";

export default function MaintenanceScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-6 py-16">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)]/[0.035] blur-3xl" />

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full border border-[var(--primary)]/[0.08]" />

        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full border border-[var(--primary)]/[0.06]" />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative dots */}
        <span className="absolute left-[12%] top-[24%] h-1.5 w-1.5 rounded-full bg-[var(--primary)]/50" />
        <span className="absolute right-[18%] top-[30%] h-2 w-2 rounded-full bg-[var(--primary)]/30" />
        <span className="absolute bottom-[24%] left-[20%] h-2 w-2 rounded-full bg-[var(--primary)]/30" />
        <span className="absolute bottom-[18%] right-[13%] h-1.5 w-1.5 rounded-full bg-[var(--primary)]/50" />
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">
        {/* Icon */}
        <div className="relative mx-auto h-32 w-32">
          {/* Outer rings */}
          <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[var(--primary)]/10 border-t-[var(--primary)]/40" />

          <div className="absolute inset-3 rounded-full border border-dashed border-[var(--primary)]/10" />

          {/* Icon container */}
          <div className="absolute inset-7 flex items-center justify-center rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] shadow-[0_0_50px_rgba(0,112,173,0.08)]">
            <ServerCog size={32} strokeWidth={1.8} />
          </div>

          {/* Status dot */}
          <span className="absolute right-3 top-5 h-3.5 w-3.5 rounded-full border-2 border-[var(--background)] bg-amber-400 shadow-[0_0_0_5px_rgba(251,191,36,0.08)]" />
        </div>

        {/* Status */}
        <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>

          Scheduled Maintenance
        </div>

        {/* Heading */}
        <h1 className="mx-auto mt-7 max-w-3xl text-5xl font-black tracking-[-0.045em] text-[var(--secondary)] sm:text-6xl lg:text-7xl">
          We&apos;ll be back
          <span className="block text-[var(--primary)]">very soon.</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
          The IEEE Geeta University Student Branch website is temporarily
          unavailable while we work on improvements and system updates.
        </p>

        {/* Minimal status line */}
        <div className="mx-auto mt-10 flex w-full max-w-md items-center justify-center gap-4 text-xs font-semibold text-[var(--muted-foreground)]">
          <span className="flex items-center gap-2">
            <Clock3 size={15} className="text-[var(--primary)]" />
            Temporarily offline
          </span>

          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />

          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            System maintenance
          </span>
        </div>

        {/* Divider */}
        <div className="mx-auto mt-12 flex max-w-sm items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--border)]" />

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted-foreground)] shadow-sm">
            <AlertTriangle size={15} />
          </div>

          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--border)]" />
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-sm font-bold text-[var(--secondary)]">
            IEEE Geeta University Student Branch
          </p>

          <p className="mt-2 text-xs font-medium text-[var(--muted-foreground)]">
            Thank you for your patience while we make things better.
          </p>
        </div>

        {/* Tiny technical label */}
        <div className="mt-8 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-light)]">
          <span>System</span>
          <ArrowUpRight size={11} />
          <span>Maintenance</span>
        </div>
      </div>
    </main>
  );
}