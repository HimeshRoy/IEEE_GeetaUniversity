import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

const quickLinks = [
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Leadership", href: "/leadership" },
  { name: "Membership", href: "/membership" },
];

const ieeeLinks = [
  {
    name: "IEEE Official Website",
    href: "https://www.ieee.org/",
  },
  {
    name: "IEEE Students",
    href: "https://students.ieee.org/",
  },
  {
    name: "IEEE Membership",
    href: "https://www.ieee.org/membership/join/index.html",
  },
  {
    name: "IEEE Delhi Section",
    href: "https://r10.ieee.org/delhi/",
  },
];

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/ieeeorg/",
    icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ieee-student-brach-geeta-university/",
    icon: FaLinkedinIn,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/IEEE.org/",
    icon: FaFacebookF,
  },
  {
    name: "X",
    href: "https://x.com/IEEEorg",
    icon: FaXTwitter,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@IEEEorg",
    icon: FaYoutube,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[var(--secondary)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-13 w-10 items-center justify-center rounded-md bg-white text-sm font-bold !text-white">
                <Image src="/gu-logo-transparent.png"
                  alt="geeta university logo"
                  width={30}
                  height={30}
                />
              </div>

              <div className="flex flex-col justify-start">
                <p className="text-lg font-bold !text-white">
                  IEEE GEETA UNIVERSITY
                </p>

                <p className="mt-0.5 text-md text-slate-400">Student Branch</p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              The official digital platform of the IEEE Geeta University Student
              Branch, connecting students, faculty, events, and technical
              communities.
            </p>

            <a
              href="mailto:ieee@geetauniversity.com"
              className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
            >
              <Mail size={17} />
              ieee@geetauniversity.com
            </a>

            <br />
            <a
              className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
              href="https://geetauniversity.edu.in/"
            >
              <Globe size={17} />
              geetauniversity.edu.in
            </a>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-all hover:border-slate-500 hover:bg-white/5 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold !text-white">Quick Links</h2>

            <nav className="mt-5 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold !text-white">IEEE Network</h2>

            <nav className="mt-5 flex flex-col gap-3">
              {ieeeLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <span>{link.name}</span>
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold !text-white">
              IEEE Delhi Section
            </h2>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Our Student Branch operates under the IEEE Delhi Section and
              connects students with the wider IEEE community.
            </p>

            <a
              href="https://r10.ieee.org/delhi/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[var(--primary)]"
            >
              Visit Delhi Section
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} IEEE Geeta University Student Branch.
              All rights reserved.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="https://www.ieee.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-slate-300"
              >
                IEEE
              </a>

              <a
                href="https://students.ieee.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-slate-300"
              >
                IEEE Students
              </a>

              <a
                href="https://r10.ieee.org/delhi/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-slate-300"
              >
                Delhi Section
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
