"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Lightbulb,
  Network,
  Scale,
  Users,
} from "lucide-react";
import Container from "@/components/ui/Container";

const ieeeAreas = [
  {
    icon: BookOpen,
    title: "Publications",
    description:
      "IEEE publishes technical literature and resources that support research, engineering, computing, and technological advancement.",
  },
  {
    icon: Network,
    title: "Technical Communities",
    description:
      "IEEE brings together professionals, researchers, educators, and students through technical societies, communities, and geographic organizational units.",
  },
  {
    icon: Globe2,
    title: "Conferences & Events",
    description:
      "IEEE supports conferences, workshops, meetings, and other activities that enable knowledge sharing and professional interaction.",
  },
  {
    icon: Scale,
    title: "Standards",
    description:
      "IEEE develops and maintains widely used technical standards that help advance interoperability, safety, and technological progress.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description:
      "IEEE provides educational resources and professional development opportunities for students and technology professionals.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "IEEE supports the exchange of ideas and technical knowledge across engineering, computing, and related fields.",
  },
];

const branchBenefits = [
  "Connect with fellow students who share technical and professional interests.",
  "Interact with faculty members and professionals through branch activities.",
  "Participate in technical meetings, workshops, projects, competitions, and outreach activities.",
  "Develop leadership, teamwork, communication, and professional skills.",
  "Explore opportunities available through the wider IEEE community.",
  "Build a record of technical and professional participation beyond the classroom.",
];

const branchActivities = [
  "Technical workshops and sessions",
  "Research and publication awareness",
  "Professional development activities",
  "Technical competitions and challenges",
  "Student projects and collaborative initiatives",
  "IEEE membership and awareness activities",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)]">
     
      <section className="border-b border-[var(--border)] bg-white py-16 sm:py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <span className="inline-flex px-3 py-1 text-md font-bold uppercase tracking-widest text-[var(--primary)]">
                About IEEE
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--secondary)] sm:text-5xl lg:text-6xl">
                Advancing technology for the benefit of humanity.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
                IEEE is a global technical professional organization bringing
                together engineers, scientists, technologists, educators,
                researchers, and students across a broad range of technology and
                engineering disciplines.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/membership"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary)]/90 hover:shadow-lg hover:shadow-[var(--primary)]/20"
                >
                  Explore Membership
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <a
                  href="https://www.ieee.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--secondary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  Visit IEEE
                </a>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-end animate-in fade-in slide-in-from-right-8 duration-700 ease-out delay-150 fill-mode-both">
              <div className="w-full max-w-[480px] transition-transform duration-700 hover:scale-105">
                <Image
                  src="/ieee-official-logo.png"
                  alt="IEEE - Advancing Technology for Humanity"
                  width={600}
                  height={320}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

     
      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                The IEEE
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                A global technical community
              </h2>

              <div className="mt-6 space-y-6 text-base leading-8 text-[var(--muted-foreground)]">
                <p>
                  IEEE is a not-for-profit technical professional organization
                  dedicated to advancing technology for the benefit of humanity.
                  Its work spans engineering, computing, electronics,
                  communications, science, and many related areas of technology.
                </p>

                <p>
                  IEEE supports the technical and professional development of
                  its members through publications, conferences, standards,
                  educational activities, professional resources, and a global
                  network of technical and geographic communities.
                </p>

                <p>
                  The organization has a long history of technological
                  leadership. Its roots extend to the founding of the American
                  Institute of Electrical Engineers in 1884. IEEE was formed in
                  1963 through the merger of the American Institute of
                  Electrical Engineers and the Institute of Radio Engineers.
                </p>
              </div>
            </div>

          
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-150 fill-mode-both">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Globe2 size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[var(--secondary)]">
                      IEEE at a glance
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Current figures published by IEEE Students
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex h-10 shrink-0 items-center justify-center">
                  <Image
                    src="/ieee-official-logo.png"
                    alt="IEEE"
                    width={82}
                    height={48}
                    className="h-full w-auto object-contain"
                  />
                </div>
              </div>

            
              <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                <div className="grid grid-cols-2">
                  <div className="border-b border-r border-[var(--border)] p-6 sm:p-8 transition-colors duration-300 hover:bg-[var(--surface)]/50">
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--secondary)]">
                      450K+
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">Members</p>
                  </div>

                  <div className="border-b border-[var(--border)] p-6 sm:p-8 transition-colors duration-300 hover:bg-[var(--surface)]/50">
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--secondary)]">
                      3,000+
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">Student Branches</p>
                  </div>

                  <div className="border-r border-[var(--border)] p-6 sm:p-8 transition-colors duration-300 hover:bg-[var(--surface)]/50">
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--secondary)]">
                      120K+
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">Student Members</p>
                  </div>

                  <div className="p-6 sm:p-8 transition-colors duration-300 hover:bg-[var(--surface)]/50">
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--secondary)]">
                      100
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">Countries</p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
                IEEE is organized across geographic regions and technical
                communities, creating opportunities for members to connect
                locally while participating in a global professional network.
              </p>
            </div>
          </div>
        </Container>
      </section>

      
      <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
        <Container>
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
              What IEEE does
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              Connecting knowledge, people, and technology
            </h2>

            <p className="mt-5 text-base leading-8 text-[var(--muted-foreground)]">
              IEEE's work extends across many parts of the technology ecosystem.
              These activities help members and the wider technical community
              learn, collaborate, publish, innovate, and contribute to
              technological progress.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ieeeAreas.map((area, index) => {
              const Icon = area.icon;

              return (
                <article
                  key={area.title}
                  className="group flex flex-col rounded-xl border border-[var(--border)] bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                  style={{ animationDelay: `${100 + index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[var(--secondary)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                    {area.title}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] flex-grow">
                    {area.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

   
      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-700 ease-out">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-sm transition-transform duration-300 hover:scale-105 hover:rotate-3">
                <Users size={28} />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                IEEE Student Branches
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                Where IEEE becomes part of student life
              </h2>

              <p className="mt-6 text-base leading-8 text-[var(--muted-foreground)]">
                An IEEE Student Branch provides students with a local community
                of peers and a connection to faculty members and industry
                professionals. Branch activities give students opportunities to
                participate, collaborate, and develop skills beyond the
                classroom.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white p-8 sm:p-10 shadow-sm transition-all duration-500 hover:shadow-md animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
              <h3 className="text-xl font-bold text-[var(--secondary)] border-b border-[var(--border)] pb-5 mb-5">
                What a Student Branch can provide
              </h3>

              <div className="space-y-5">
                {branchBenefits.map((benefit) => (
                  <div key={benefit} className="group flex gap-4">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-[var(--muted-foreground)] transition-colors duration-300 group-hover:text-[var(--primary)]"
                    />
                    <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      
      <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                IEEE in India
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                A strong student community across India
              </h2>

              <div className="mt-6 space-y-6 text-base leading-8 text-[var(--muted-foreground)]">
                <p>
                  IEEE has an extensive presence in India, with Student Branches
                  at educational institutions across the country. These branches
                  help students connect with IEEE's broader vision through
                  technical and professional activities.
                </p>

                <p>
                  Student Branches provide a local point of connection while
                  remaining part of the wider IEEE ecosystem of Sections,
                  Regions, technical communities, and professional members.
                </p>
              </div>
            </div>

            <div className="group rounded-2xl bg-[var(--secondary)] p-8 sm:p-12 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-150 fill-mode-both">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Building2 size={28} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
                From global IEEE to your campus
              </h3>

              <p className="mt-5 text-base leading-8 text-slate-300">
                A Student Branch brings the larger IEEE community closer to
                students by creating opportunities for local activities,
                technical learning, networking, leadership, and professional
                development.
              </p>
            </div>
          </div>
        </Container>
      </section>

     
      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
            {/* Left Col: Branch Info */}
            <div className="flex flex-col animate-in fade-in slide-in-from-left-8 duration-700 ease-out">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                Our Student Branch
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                IEEE Geeta University Student Branch
              </h2>

              <p className="mt-6 text-base leading-8 text-[var(--muted-foreground)]">
                The IEEE Geeta University Student Branch is the IEEE student
                community at Geeta University, Panipat, Haryana. The branch
                provides a platform for students to engage with IEEE, participate
                in technical and professional activities, and collaborate with
                fellow students and faculty.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                    Institution
                  </p>
                  <p className="mt-3 text-xl font-bold text-[var(--secondary)]">
                    Geeta University
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Panipat, Haryana, India
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                    Student Branch ID
                  </p>
                  <p className="mt-3 text-xl font-bold text-[var(--secondary)]">
                    STB60229309
                  </p>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
                Our activities
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                Learn, participate, and contribute
              </h2>

              <p className="mt-6 text-base leading-8 text-[var(--muted-foreground)] mb-8">
                The branch organizes and supports activities that help students
                engage with technical knowledge, research, professional
                development, and the IEEE community.
              </p>

              <div className="grid gap-4">
                {branchActivities.map((activity) => (
                  <div
                    key={activity}
                    className="group flex items-center gap-4 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-md"
                  >
                    <CheckCircle2
                      size={20}
                      className="shrink-0 text-[var(--muted-foreground)] transition-colors duration-300 group-hover:text-[var(--primary)]"
                    />
                    <span className="text-sm font-semibold text-[var(--secondary)]">
                      {activity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>


      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-[var(--secondary)] px-6 py-16 text-center shadow-lg sm:px-16 sm:py-20 lg:px-24 transition-transform duration-700 hover:shadow-xl">
            <div className="mx-auto max-w-3xl animate-in zoom-in-95 duration-700 ease-out">
              <GraduationCap size={44} className="mx-auto text-white opacity-90 transition-transform duration-500 hover:scale-110 hover:rotate-12" />

              <h2 className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Be part of the IEEE GU community
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Explore upcoming activities, connect with the branch, and
                discover opportunities to learn and contribute through IEEE
                Geeta University Student Branch.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/events"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-4 text-sm font-bold text-[var(--secondary)] transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-lg"
                >
                  Explore Events
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-transparent px-7 py-4 text-sm font-bold !text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-white/50"
                >
                  Join IEEE
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
