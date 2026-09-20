"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, ImageIcon, Loader2 } from "lucide-react";
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
    <article className="group relative h-44 w-72 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-white sm:h-52 sm:w-80 lg:h-56 lg:w-96">
      <img
        src={image.imageUrl}
        alt={image.caption || `${image.albumTitle} gallery image`}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="truncate text-sm font-semibold text-white">
          {image.albumTitle}
        </p>

        {image.caption && (
          <p className="mt-1 truncate text-xs text-white/80">{image.caption}</p>
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
    <div className="flex shrink-0 items-stretch gap-5" aria-hidden="true">
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
    if (rowOne.length === 0) {
      return [];
    }

    const repetitions = Math.max(6, Math.ceil(18 / rowOne.length));

    return Array.from({ length: repetitions }, () => rowOne).flat();
  }, [rowOne]);

  const secondMarquee = useMemo(() => {
    if (secondRow.length === 0) {
      return [];
    }

    const repetitions = Math.max(6, Math.ceil(18 / secondRow.length));

    return Array.from({ length: repetitions }, () => secondRow).flat();
  }, [secondRow]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[var(--background)]">
      <section className="bg-[var(--background)]">
        <Container>
          <div className="py-14 text-center sm:py-16 lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--primary)]">
              <Camera className="h-4 w-4" />
              Our Gallery
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              Moments from our journey
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
              Explore moments captured during IEEE Geeta University Student
              Branch events, workshops, seminars, and activities.
            </p>
          </div>
        </Container>
      </section>

      {isLoading && (
        <section className="bg-[var(--background)] py-20">
          <div className="flex items-center justify-center gap-3 text-sm text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
            Loading gallery...
          </div>
        </section>
      )}

      {!isLoading && error && (
        <section className="bg-[var(--background)] py-16">
          <Container>
            <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <Camera className="mx-auto h-8 w-8 text-[var(--primary)]" />

              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                Unable to load gallery
              </h2>

              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {error}
              </p>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && !error && images.length === 0 && (
        <section className="bg-[var(--background)] py-16">
          <Container>
            <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-[var(--primary)]" />

              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                No gallery images yet
              </h2>

              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Public gallery photos will appear here once they are uploaded
                and published.
              </p>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && !error && images.length > 0 && (
        <section className="overflow-hidden bg-[var(--background)] pb-16 sm:pb-20 lg:pb-24">
          <div className="relative w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/90 to-transparent sm:w-24 lg:w-36" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[var(--background)] via-[var(--background)]/90 to-transparent sm:w-24 lg:w-36" />

            <div className="gallery-window">
              <div className="gallery-marquee gallery-marquee-left">
                <MarqueeGroup images={firstMarquee} prefix="top-a" />

                <MarqueeGroup images={firstMarquee} prefix="top-b" />
              </div>
            </div>

            <div className="mt-5 gallery-window">
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
          gap: 20px;
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
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes galleryMoveRight {
          from {
            transform: translateX(-50%);
          }

          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 600px) {
          .gallery-marquee {
            gap: 12px;
          }

          .gallery-marquee-left {
            animation-duration: 90s;
          }

          .gallery-marquee-right {
            animation-duration: 95s;
          }
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
