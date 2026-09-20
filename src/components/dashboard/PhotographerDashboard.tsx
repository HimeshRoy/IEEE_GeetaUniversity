"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Camera,
  FolderOpen,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

type User = {
  firstName: string;
  lastName: string | null;
};

type GalleryImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

type Album = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  images?: GalleryImage[];
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as ApiError;

    return (
      apiError.response?.data?.message ||
      "Unable to load the Photographer dashboard."
    );
  }

  return "Unable to load the Photographer dashboard.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export default function PhotographerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, galleryResponse] = await Promise.all([
          getCurrentUser(),
          api.get("/gallery/manage"),
        ]);

        if (!mounted) {
          return;
        }

        const currentUser = userResponse?.data ?? userResponse;
        const albumData = Array.isArray(galleryResponse.data?.data)
          ? galleryResponse.data.data
          : [];

        setUser(currentUser);
        setAlbums(albumData);
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

        setError(getApiErrorMessage(requestError));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const totalPhotos = useMemo(
    () =>
      albums.reduce((total, album) => total + (album.images?.length ?? 0), 0),
    [albums],
  );

  const recentAlbums = useMemo(
    () =>
      [...albums]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [albums],
  );

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="mb-7">
          <div className="h-4 w-32 rounded bg-[var(--background)]" />
          <div className="mt-3 h-8 w-80 rounded bg-[var(--background)]" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-[var(--background)]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
          <div className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
        </div>

        <div className="mt-6 h-64 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-base font-semibold text-red-800">
            Unable to load Photographer dashboard
          </h1>
          <p className="mt-1.5 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-7">
        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          Photographer Portal
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Welcome back, {user?.firstName || "Photographer"}
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
          Manage photos and albums for the IEEE Geeta University Student Branch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Total Albums
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {albums.length}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <FolderOpen className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Albums available in the gallery
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">
                Total Photos
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {totalPhotos}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--background)]">
              <ImageIcon className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[var(--muted)]">
            Photos uploaded to the gallery
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Gallery Management
            </h2>

            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Create albums and manage branch photos
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/gallery"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
            >
              <Camera className="h-3.5 w-3.5" />
              Manage Gallery
            </Link>

            <Link
              href="/dashboard/gallery"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold !text-white transition hover:bg-[var(--primary-dark)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Album
            </Link>
          </div>
        </div>

        <div className="p-4">
          {recentAlbums.length === 0 ? (
            <div className="py-10 text-center">
              <FolderOpen className="mx-auto h-7 w-7 text-[var(--muted)]" />

              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                No albums yet
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Create your first gallery album to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recentAlbums.map((album) => (
                <Link
                  key={album.id}
                  href={`/dashboard/gallery`}
                  className="group overflow-hidden rounded-xl border border-[var(--border)] transition hover:bg-[var(--background)]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[var(--background)]">
                    {album.coverImage ? (
                      <Image
                        src={album.coverImage}
                        alt={album.title}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : album.images?.[0]?.imageUrl ? (
                      <Image
                        src={album.images[0].imageUrl}
                        alt={album.title}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-7 w-7 text-[var(--muted)]" />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-sm font-semibold text-[var(--foreground)]">
                        {album.title}
                      </h3>

                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition group-hover:text-[var(--primary)]" />
                    </div>

                    <p className="mt-1 text-[11px] text-[var(--muted)]">
                      {album.images?.length ?? 0} photos
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {formatDate(album.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
