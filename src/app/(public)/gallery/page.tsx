"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import { api } from "@/lib/api";

type GalleryImage = {
  id: string;
  imageUrl: string;
  cloudinaryId: string;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
};

type GalleryAlbum = {
  id: string;
  title: string;
  description: string | null;
  visibility: "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";
  coverImage: string | null;
  coverCloudinaryId: string | null;
  createdAt: string;
  updatedAt: string;
  images: GalleryImage[];
};

type GalleryResponse = {
  success: boolean;
  data: GalleryAlbum[];
  message?: string;
};

type CarouselImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
  albumTitle: string;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load the gallery.";
}

function MovingImage({ image }: { image: CarouselImage }) {
  return (
    <article className="group relative aspect-[4/3] w-[260px] shrink-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/[0.03] sm:w-[320px] lg:w-[400px]">
      <img
        src={image.imageUrl}
        alt={image.caption || `${image.albumTitle} gallery image`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 sm:p-6 translate-y-2 transition-transform duration-500 ease-out group-hover:translate-y-0">
        <span className="inline-flex w-fit rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md mb-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Album
        </span>
        <p className="truncate text-base font-bold text-white sm:text-lg drop-shadow-md">
          {image.albumTitle}
        </p>

        {image.caption && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/80 drop-shadow-sm sm:text-sm">
            {image.caption}
          </p>
        )}
      </div>
    </article>
  );
}

function MarqueeGroup({
  images,
  prefix,
}: {
  images: CarouselImage[];
  prefix: string;
}) {
  return (
    <div className="flex shrink-0 items-stretch gap-4 sm:gap-6" aria-hidden="true">
      {images.map((image, index) => (
        <MovingImage key={`${prefix}-${image.id}-${index}`} image={image} />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await api.get<GalleryResponse>("/gallery");

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to load gallery");
        }

        setAlbums(response.data.data);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadGallery();
  }, []);

  const images = useMemo<CarouselImage[]>(() => {
    return albums.flatMap((album) =>
      album.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        caption: image.caption,
        albumTitle: album.title,
      })),
    );
  }, [albums]);

  const rowOne = useMemo(() => {
    const midpoint = Math.ceil(images.length / 2);
    return images.slice(0, midpoint);
  }, [images]);

  const rowTwo = useMemo(() => {
    const midpoint = Math.ceil(images.length / 2);
    return images.slice(midpoint);
  }, [images]);

  const secondRow = rowTwo.length > 0 ? rowTwo : rowOne;

  const firstMarquee = useMemo(() => {
    if (rowOne.length === 0) return [];
    const repetitions = Math.max(6, Math.ceil(18 / rowOne.length));
    return Array.from({ length: repetitions }, () => rowOne).flat();
  }, [rowOne]);

  const secondMarquee = useMemo(() => {
    if (secondRow.length === 0) return [];
    const repetitions = Math.max(6, Math.ceil(18 / secondRow.length));
    return Array.from({ length: repetitions }, () => secondRow).flat();
  }, [secondRow]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[var(--background)]">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface)]/40 to-transparent">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[400px] w-[400px] sm:h-[500px] sm:w-[500px] rounded-full bg-[var(--primary)]/[0.06] blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -right-40 top-20 h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] rounded-full bg-blue-500/[0.04] blur-3xl animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        </div>

        <Container>
          <div className="relative py-16 text-center sm:py-24 lg:py-28 px-4 sm:px-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] shadow-sm backdrop-blur-md">
              <Camera className="h-3.5 w-3.5" />
              Our Gallery
            </span>

            <h1 className="mx-auto mt-5 sm:mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Moments from our{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-blue-500 bg-clip-text text-transparent">
                Journey
              </span>
            </h1>

            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 text-[var(--muted-foreground)]">
              Explore moments captured during IEEE Geeta University Student Branch events, workshops, seminars, and activities.
            </p>
          </div>
        </Container>
      </section>

      {isLoading && (
        <section className="py-20 sm:py-28">
          <Container>
            <div className="flex min-h-[300px] flex-col items-center justify-center animate-in fade-in duration-500 px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/5">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
              </div>
              <p className="mt-5 font-semibold text-[var(--foreground)]">Loading gallery</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Fetching the latest branch photos...</p>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && error && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="mx-auto flex min-h-[300px] max-w-xl items-center justify-center px-4">
              <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-8 sm:p-10 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
                <h2 className="mt-6 text-xl font-bold text-[var(--foreground)]">Unable to load gallery</h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">{error}</p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && !error && images.length === 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="mx-auto flex min-h-[300px] max-w-xl items-center justify-center px-4">
              <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 sm:p-10 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/10">
                  <ImageIcon className="h-7 w-7 text-[var(--primary)]" />
                </div>
                <h2 className="mt-6 text-xl font-bold text-[var(--foreground)]">No images available</h2>
                <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--muted-foreground)]">
                  Public gallery photos will appear here once they are uploaded and published by the branch leadership.
                </p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && !error && images.length > 0 && (
        <section className="overflow-hidden bg-[var(--background)] py-12 sm:py-20 lg:py-24">
          <div className="relative w-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* Smooth Edge Fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/80 to-transparent sm:w-40 lg:w-64" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-[var(--background)] via-[var(--background)]/80 to-transparent sm:w-40 lg:w-64" />

            <div className="gallery-window">
              <div className="gallery-marquee gallery-marquee-left">
                <MarqueeGroup images={firstMarquee} prefix="top-a" />
                <MarqueeGroup images={firstMarquee} prefix="top-b" />
              </div>
            </div>

            <div className="mt-4 sm:mt-6 gallery-window">
              <div className="gallery-marquee gallery-marquee-right">
                <MarqueeGroup images={secondMarquee} prefix="bottom-a" />
                <MarqueeGroup images={secondMarquee} prefix="bottom-b" />
              </div>
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .gallery-window {
          width: 100%;
          overflow: hidden;
        }

        .gallery-marquee {
          display: flex;
          width: max-content;
          flex-shrink: 0;
          gap: 16px;
          will-change: transform;
        }

        .gallery-marquee-left {
          animation: galleryMoveLeft 100s linear infinite;
        }

        .gallery-marquee-right {
          transform: translateX(-50%);
          animation: galleryMoveRight 105s linear infinite;
        }

        .gallery-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes galleryMoveLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes galleryMoveRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        @media (min-width: 640px) {
          .gallery-marquee { gap: 24px; }
        }

        @media (max-width: 639px) {
          .gallery-marquee-left { animation-duration: 90s; }
          .gallery-marquee-right { animation-duration: 95s; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-marquee-left,
          .gallery-marquee-right {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}