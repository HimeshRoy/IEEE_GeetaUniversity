"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Leadership", href: "/leadership" },
  { name: "Membership", href: "/membership" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white shadow-sm">
      <div className="w-full px-5 sm:px-7 lg:px-10 xl:px-12">
        <div className="flex h-[76px] items-center lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3 lg:justify-self-start"
            aria-label="IEEE Geeta University Student Branch home"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/ieee-official-logo.png"
              alt="IEEE"
              width={58}
              height={34}
              className="h-7 w-auto shrink-0 object-contain sm:h-8"
              priority
            />

            <div className="hidden h-9 w-px bg-[var(--border)] sm:block" />

            <Image
              src="/ieee-delhi-section.png"
              alt="IEEE Delhi Section"
              width={82}
              height={42}
              className="h-8 w-auto shrink-0 object-contain sm:h-9"
              priority
            />

            <div className="hidden h-9 w-px bg-[var(--border)] sm:block" />

            <Image
              src="/gulogo.png"
              alt="Geeta University"
              width={44}
              height={44}
              className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
              priority
            />

            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-bold leading-tight text-gray-950">
                IEEE STUDENT BRANCH
              </p>

              <p className="text-sm text-[var(--muted)]">
                GEETA UNIVERSITY
              </p>
            </div>
          </Link>

          <nav
            className="hidden items-center justify-center gap-7 lg:flex xl:gap-8"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm font-medium text-[var(--secondary)] transition-colors duration-200 hover:text-[var(--primary)]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center justify-self-end gap-2 lg:flex xl:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--secondary)] transition-colors duration-200 hover:bg-[var(--surface)]"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white transition-all duration-200 hover:bg-[var(--primary)]/90 hover:shadow-md"
            >
              Join IEEE
            </Link>
          </div>

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--secondary)] transition-colors hover:bg-[var(--surface)] lg:hidden"
            aria-label={
              isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X size={21} strokeWidth={2} />
            ) : (
              <Menu size={21} strokeWidth={2} />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="animate-in fade-in slide-in-from-top-2 border-t border-[var(--border)] py-3 duration-200 ease-out lg:hidden">
            <nav
              className="flex flex-col"
              aria-label="Mobile navigation"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--secondary)] transition-colors duration-200 hover:bg-[var(--surface)] hover:text-[var(--primary)]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-2 flex gap-3 border-t border-[var(--border)] pt-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--secondary)] transition-colors duration-200 hover:bg-[var(--surface)]"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-center text-sm font-semibold !text-white transition-colors duration-200 hover:bg-[var(--primary)]/90"
                  onClick={() => setIsOpen(false)}
                >
                  Join IEEE
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}