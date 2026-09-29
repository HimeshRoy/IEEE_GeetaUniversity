"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

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
  const [showMenuBar, setShowMenuBar] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setShowMenuBar(true);
      } else if (currentScrollY > lastScrollY) {
        setShowMenuBar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowMenuBar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="relative z-50">
      <div className="fixed inset-x-0 top-0 z-[60] border-b border-[var(--border)] bg-white shadow-sm">
        <div className="w-full px-3 sm:px-7 lg:px-10 xl:px-12">
          <div className="flex h-[72px] items-center justify-between gap-3 sm:h-[88px] sm:gap-6">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-4"
              aria-label="IEEE Geeta University Student Branch home"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/ieee-official-logo.png"
                alt="IEEE"
                width={90}
                height={52}
                className="h-[27px] w-auto shrink-0 object-contain sm:h-10"
                priority
              />

              <div className="h-7 w-px bg-[var(--border)] sm:h-10" />

              <Image
                src="/ieee-delhi-section.png"
                alt="IEEE Delhi Section"
                width={125}
                height={58}
                className="h-[30px] w-auto shrink-0 object-contain sm:h-11"
                priority
              />

              <div className="h-7 w-px bg-[var(--border)] sm:h-10" />

              <Image
                src="/ieeegusblogo.png"
                alt="IEEE Geeta University Student Branch"
                width={145}
                height={58}
                className="h-[32px] w-auto shrink-0 object-contain sm:h-12"
                priority
              />

              <div className="hidden h-10 w-px bg-[var(--border)] lg:block" />

              <Image
                src="/geetauniversitylogo.png"
                alt="Geeta University"
                width={145}
                height={58}
                className="hidden h-12 w-auto shrink-0 object-contain lg:block"
                priority
              />
            </Link>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="rounded-lg px-5 py-2.5 text-sm font-bold text-[var(--secondary)] transition-colors duration-200 hover:bg-[var(--surface)]"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold !text-white transition-all duration-200 hover:bg-[var(--primary)]/90 hover:shadow-md"
              >
                Join IEEE
              </Link>
            </div>

            <button
              type="button"
              className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--secondary)] transition-colors hover:bg-[var(--surface)] sm:h-10 sm:w-10 lg:hidden"
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
              onClick={() => setIsOpen((current) => !current)}
            >
              {isOpen ? (
                <X size={20} strokeWidth={2} />
              ) : (
                <Menu size={20} strokeWidth={2} />
              )}
            </button>
          </div>

          {isOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 border-t border-[var(--border)] py-3 duration-200 ease-out lg:hidden">
              <nav className="flex flex-col" aria-label="Mobile navigation">
                {navigation.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-lg px-3 py-3 text-sm font-bold transition-colors duration-200 ${
                        active
                          ? "bg-[var(--surface)] text-[var(--primary)]"
                          : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                <div className="mt-2 flex gap-3 border-t border-[var(--border)] pt-3">
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2.5 text-center text-sm font-bold text-[var(--secondary)] transition-colors duration-200 hover:bg-[var(--surface)]"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-center text-sm font-bold !text-white transition-colors duration-200 hover:bg-[var(--primary)]/90"
                    onClick={() => setIsOpen(false)}
                  >
                    Join IEEE
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 top-[88px] z-50 hidden border-b border-[var(--border)] bg-white/95 shadow-sm backdrop-blur transition-transform duration-300 ease-out lg:block ${
          showMenuBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full px-5 sm:px-7 lg:px-10 xl:px-12">
          <nav
            className="flex h-[62px] items-center justify-start gap-8 xl:gap-10"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex h-full items-center px-1 text-sm font-bold transition-colors duration-200 ${
                    active
                      ? "text-[var(--primary)]"
                      : "text-[var(--secondary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {item.name}

                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[var(--primary)] transition-all duration-200 ${
                      active
                        ? "scale-x-100 opacity-100"
                        : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="hidden h-[150px] lg:block" />

      <div className="h-[72px] lg:hidden" />
    </header>
  );
}