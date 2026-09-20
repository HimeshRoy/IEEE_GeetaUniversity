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
    <>
      <section className="border-b border-[var(--border)] bg-white py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                About IEEE
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight text-[var(--secondary)] sm:text-5xl lg:text-6xl">
                Advancing technology for the benefit of humanity.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                IEEE is a global technical professional organization bringing
                together engineers, scientists, technologists, educators,
                researchers, and students across a broad range of technology and
                engineering disciplines.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white transition-colors hover:bg-[var(--primary-dark)]"
                >
                  Explore Membership
                  <ArrowRight size={17} />
                </Link>

                <a
                  href="https://www.ieee.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--secondary)] transition-colors hover:bg-[var(--surface)]"
                >
                  Visit IEEE
                </a>
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex lg:justify-end">
              <div className="w-full max-w-[440px] px-4 sm:px-8 lg:px-0">
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

      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                The IEEE
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                A global technical community
              </h2>

              <div className="mt-6 space-y-5 text-base leading-7 text-[var(--muted)]">
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

            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-6">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                    <Globe2 size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-base font-bold text-[var(--secondary)]">
                      IEEE at a glance
                    </p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Current figures published by IEEE Students
                    </p>
                  </div>
                </div>

                <div className="flex h-12 shrink-0 items-center justify-center">
                  <Image
                    src="/ieee-official-logo.png"
                    alt="IEEE"
                    width={82}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>

              <div className="mt-7 overflow-hidden rounded-xl border border-[var(--border)]">
                <div className="grid grid-cols-2">
                  <div className="border-b border-r border-[var(--border)] p-6 sm:p-7">
                    <p className="text-3xl font-bold tracking-tight text-[var(--secondary)]">
                      450K+
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">Members</p>
                  </div>

                  <div className="border-b border-[var(--border)] p-6 sm:p-7">
                    <p className="text-3xl font-bold tracking-tight text-[var(--secondary)]">
                      3,000+
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Student Branches
                    </p>
                  </div>

                  <div className="border-r border-[var(--border)] p-6 sm:p-7">
                    <p className="text-3xl font-bold tracking-tight text-[var(--secondary)]">
                      120K+
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Student Members
                    </p>
                  </div>

                  <div className="p-6 sm:p-7">
                    <p className="text-3xl font-bold tracking-tight text-[var(--secondary)]">
                      100
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Countries
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
                IEEE is organized across geographic regions and technical
                communities, creating opportunities for members to connect
                locally while participating in a global professional network.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-20 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              What IEEE does
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              Connecting knowledge, people, and technology
            </h2>

            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              IEEE's work extends across many parts of the technology ecosystem.
              These activities help members and the wider technical community
              learn, collaborate, publish, innovate, and contribute to
              technological progress.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ieeeAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article
                  key={area.title}
                  className="rounded-xl border border-[var(--border)] bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[var(--secondary)]">
                    {area.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {area.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                <Users size={23} />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                IEEE Student Branches
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                Where IEEE becomes part of student life
              </h2>

              <p className="mt-5 text-base leading-7 text-[var(--muted)]">
                An IEEE Student Branch provides students with a local community
                of peers and a connection to faculty members and industry
                professionals. Branch activities give students opportunities to
                participate, collaborate, and develop skills beyond the
                classroom.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white p-7 sm:p-8">
              <h3 className="text-xl font-bold text-[var(--secondary)]">
                What a Student Branch can provide
              </h3>

              <div className="mt-6 space-y-4">
                {branchBenefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-[var(--primary)]"
                    />

                    <p className="text-sm leading-6 text-[var(--muted)]">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                IEEE in India
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                A strong student community across India
              </h2>

              <div className="mt-6 space-y-5 text-base leading-7 text-[var(--muted)]">
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

            <div className="rounded-2xl bg-[var(--secondary)] p-7 sm:p-8">
              <Building2 size={28} className="text-white" />

              <h3 className="mt-6 text-2xl font-bold text-white">
                From global IEEE to your campus
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                A Student Branch brings the larger IEEE community closer to
                students by creating opportunities for local activities,
                technical learning, networking, leadership, and professional
                development.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24">
        <Container>
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              Our Student Branch
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
              IEEE Geeta University Student Branch
            </h2>

            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              The IEEE Geeta University Student Branch is the IEEE student
              community at Geeta University, Panipat, Haryana. The branch
              provides a platform for students to engage with IEEE, participate
              in technical and professional activities, and collaborate with
              fellow students and faculty.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Institution
                </p>

                <p className="mt-2 text-lg font-bold text-[var(--secondary)]">
                  Geeta University
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Panipat, Haryana, India
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  IEEE Student Branch ID
                </p>

                <p className="mt-2 text-lg font-bold text-[var(--secondary)]">
                  STB60229309
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                Our activities
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--secondary)] sm:text-4xl">
                Learn, participate, and contribute
              </h2>

              <p className="mt-5 text-base leading-7 text-[var(--muted)]">
                The branch organizes and supports activities that help students
                engage with technical knowledge, research, professional
                development, and the IEEE community.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {branchActivities.map((activity) => (
                <div
                  key={activity}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white p-4"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[var(--primary)]"
                  />

                  <span className="text-sm font-medium text-[var(--secondary)]">
                    {activity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="overflow-hidden rounded-2xl bg-[var(--secondary)] px-6 py-12 sm:px-10 sm:py-14 lg:px-16">
            <div className="mx-auto max-w-3xl text-center">
              <GraduationCap size={30} className="mx-auto text-white" />

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Be part of the IEEE GU community
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Explore upcoming activities, connect with the branch, and
                discover opportunities to learn and contribute through IEEE
                Geeta University Student Branch.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
    </>
  );
}
