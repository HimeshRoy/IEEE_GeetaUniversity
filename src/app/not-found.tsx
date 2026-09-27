import Link from "next/link";
import { Home, X } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[var(--background)] px-5 py-16">
      <div className="w-full max-w-2xl text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm">
          <X size={36} strokeWidth={1.8} />
        </div>

        <p className="mt-8 text-7xl font-extrabold tracking-tight text-[var(--primary)] sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--muted)] sm:text-base">
          Sorry, the page you are looking for doesn&apos;t exist or may have
          been moved. Let&apos;s get you back to the IEEE Geeta University
          Student Branch.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--primary)]/20"
          >
            <Home size={17} />
            Back to Home
          </Link>
        </div>

        <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-light)]">
          IEEE Geeta University
        </p>
      </div>
    </main>
  );
}