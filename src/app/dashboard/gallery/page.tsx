"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Album,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type Visibility = "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";

type GalleryImage = {
  id: string;
  albumId: string;
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
  coverImage: string | null;
  coverCloudinaryId: string | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  images: GalleryImage[];
};

type AlbumForm = {
  title: string;
  description: string;
  visibility: Visibility;
};

type ModalType = "create" | "edit" | "delete" | "cover" | "photo" | null;

function getResponseData<T>(response: {
  data?: {
    data?: T;
  };
}) {
  return response?.data?.data as T;
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return axiosError?.response?.data?.message || axiosError?.message || fallback;
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatVisibility(visibility: Visibility) {
  if (visibility === "MEMBERS_ONLY") {
    return "Members Only";
  }

  if (visibility === "PRIVATE") {
    return "Private";
  }

  return "Public";
}

function visibilityClasses(visibility: Visibility) {
  if (visibility === "MEMBERS_ONLY") {
    return "bg-purple-50 text-purple-700";
  }

  if (visibility === "PRIVATE") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-blue-50 text-blue-700";
}

const EMPTY_FORM: AlbumForm = {
  title: "",
  description: "",
  visibility: "PUBLIC",
};

function AlbumFormModal({
  mode,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  form: AlbumForm;
  setForm: React.Dispatch<React.SetStateAction<AlbumForm>>;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] p-5">
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">
              Gallery Management
            </p>

            <h2 className="mt-1 text-lg font-bold text-[var(--text)]">
              {mode === "create" ? "Create Album" : "Edit Album"}
            </h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {mode === "create"
                ? "Create a new gallery album."
                : "Update the album information."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="album-title"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Album Title
            </label>

            <input
              id="album-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Enter album title"
              maxLength={200}
              disabled={saving}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
            />
          </div>

          <div>
            <label
              htmlFor="album-description"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Description
            </label>

            <textarea
              id="album-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Describe this album..."
              rows={4}
              maxLength={2000}
              disabled={saving}
              className="mt-2 w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
            />

            <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
              {form.description.length}/2000
            </p>
          </div>

          <div>
            <label
              htmlFor="album-visibility"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Visibility
            </label>

            <div className="relative mt-2">
              <select
                id="album-visibility"
                value={form.visibility}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visibility: event.target.value as Visibility,
                  }))
                }
                disabled={saving}
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-10 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Members Only</option>
                <option value="PRIVATE">Private</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}

            {mode === "create" ? "Create Album" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  title,
  description,
  confirmLabel,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-50 p-2.5">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                {title}
              </h2>

              <p className="mt-1.5 text-sm leading-5 text-[var(--muted)]">
                {description}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold !text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}

            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({
  title,
  description,
  file,
  setFile,
  caption,
  setCaption,
  loading,
  error,
  onClose,
  onUpload,
}: {
  title: string;
  description: string;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  caption?: string;
  setCaption?: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string;
  onClose: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] p-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>

            <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center hover:border-[var(--primary)]">
            <Upload className="h-7 w-7 text-[var(--primary)]" />

            <p className="mt-2 text-sm font-semibold text-[var(--text)]">
              {file ? file.name : "Choose an image"}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              JPG, PNG, WEBP and supported image formats
            </p>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={loading}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          {setCaption && (
            <div>
              <label
                htmlFor="photo-caption"
                className="text-xs font-semibold text-[var(--text)]"
              >
                Caption
              </label>

              <input
                id="photo-caption"
                value={caption || ""}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Optional caption"
                maxLength={500}
                disabled={loading}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onUpload}
            disabled={loading || !file}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

function AlbumDetails({
  album,
  onBack,
  onEdit,
  onDelete,
  onCover,
  onPhoto,
  onEditPhoto,
  onDeletePhoto,
}: {
  album: GalleryAlbum;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCover: () => void;
  onPhoto: () => void;
  onEditPhoto: (image: GalleryImage) => void;
  onDeletePhoto: (image: GalleryImage) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] hover:bg-[var(--surface)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-xs font-medium text-[var(--primary)]">
              Gallery Album
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
              {album.title}
            </h1>

            <p className="mt-1.5 text-sm text-[var(--muted)]">
              {album.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Album
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="relative h-64 bg-[var(--surface)] sm:h-80">
          {album.coverImage ? (
            <img
              src={album.coverImage}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <Album className="h-10 w-10 text-[var(--muted)]" />

              <p className="mt-2 text-sm text-[var(--muted)]">No album cover</p>
            </div>
          )}

          <button
            type="button"
            onClick={onCover}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2.5 text-xs font-semibold text-[var(--text)] shadow-lg backdrop-blur hover:bg-white"
          >
            <Upload className="h-3.5 w-3.5" />
            {album.coverImage ? "Change Cover" : "Upload Cover"}
          </button>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${visibilityClasses(
                album.visibility,
              )}`}
            >
              {formatVisibility(album.visibility)}
            </span>

            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)]">
              {album.images.length}{" "}
              {album.images.length === 1 ? "photo" : "photos"}
            </span>

            <span className="text-[10px] text-[var(--muted)]">
              Created {formatDate(album.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={onPhoto}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Add Photos
          </button>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Photos</h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Manage photos inside this album.
            </p>
          </div>
        </div>

        {album.images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-white p-12 text-center">
            <ImagePlus className="mx-auto h-9 w-9 text-[var(--muted)]" />

            <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">
              No photos yet
            </h3>

            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Upload the first photo to this album.
            </p>

            <button
              type="button"
              onClick={onPhoto}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Photo
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {album.images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--surface)]">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || album.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-3">
                  <p className="line-clamp-2 min-h-10 text-xs leading-5 text-[var(--text)]">
                    {image.caption || "No caption"}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEditPhoto(image)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-2 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeletePhoto(image)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function GalleryManagementPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);

  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");

  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | Visibility>(
    "ALL",
  );

  const [modal, setModal] = useState<ModalType>(null);

  const [form, setForm] = useState<AlbumForm>(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [uploadLoading, setUploadLoading] = useState(false);

  const [uploadError, setUploadError] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [photoCaption, setPhotoCaption] = useState("");

  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  async function loadAlbums() {
    try {
      setLoading(true);
      setPageError("");

      const response = await api.get("/gallery/manage");

      const data = getResponseData<GalleryAlbum[]>(response);

      setAlbums(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(getErrorMessage(error, "Unable to load gallery albums."));
    } finally {
      setLoading(false);
    }
  }

  async function loadAlbum(albumId: string) {
    try {
      setPageError("");

      const response = await api.get(`/gallery/manage/${albumId}`);

      const album = getResponseData<GalleryAlbum>(response);

      setSelectedAlbum(album);

      setAlbums((current) =>
        current.map((item) => (item.id === album.id ? album : item)),
      );
    } catch (error) {
      setPageError(getErrorMessage(error, "Unable to load the gallery album."));
    }
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  const filteredAlbums = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return albums.filter((album) => {
      if (visibilityFilter !== "ALL" && album.visibility !== visibilityFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        album.title.toLowerCase().includes(normalizedSearch) ||
        (album.description || "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [albums, search, visibilityFilter]);

  const statistics = useMemo(() => {
    const totalPhotos = albums.reduce(
      (total, album) => total + album.images.length,
      0,
    );

    return {
      albums: albums.length,
      photos: totalPhotos,
      public: albums.filter((album) => album.visibility === "PUBLIC").length,
      membersOnly: albums.filter((album) => album.visibility === "MEMBERS_ONLY")
        .length,
    };
  }, [albums]);

  function closeModal() {
    if (saving || deleteLoading || uploadLoading) {
      return;
    }

    setModal(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setUploadError("");
    setSelectedFile(null);
    setPhotoCaption("");
    setEditingImage(null);
  }

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal("create");
  }

  function openEditModal(album: GalleryAlbum) {
    setForm({
      title: album.title,
      description: album.description || "",
      visibility: album.visibility,
    });

    setFormError("");
    setSelectedAlbum(album);
    setModal("edit");
  }

  function openDeleteModal(album: GalleryAlbum) {
    setSelectedAlbum(album);
    setFormError("");
    setModal("delete");
  }

  function openCoverModal(album: GalleryAlbum) {
    setSelectedAlbum(album);
    setSelectedFile(null);
    setUploadError("");
    setModal("cover");
  }

  function openPhotoModal(album: GalleryAlbum) {
    setSelectedAlbum(album);
    setSelectedFile(null);
    setPhotoCaption("");
    setEditingImage(null);
    setUploadError("");
    setModal("photo");
  }

  function openEditPhotoModal(image: GalleryImage) {
    setEditingImage(image);
    setPhotoCaption(image.caption || "");
    setSelectedFile(null);
    setUploadError("");
    setModal("photo");
  }

  function openAlbum(album: GalleryAlbum) {
    setSelectedAlbum(album);
    loadAlbum(album.id);
  }

  async function saveAlbum() {
    if (form.title.trim().length < 2) {
      setFormError("Album title must be at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        visibility: form.visibility,
      };

      if (modal === "edit" && selectedAlbum) {
        await api.patch(`/gallery/${selectedAlbum.id}`, payload);
      } else {
        await api.post("/gallery", payload);
      }

      await loadAlbums();

      setModal(null);
      setForm(EMPTY_FORM);
      setSelectedAlbum(null);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save the album."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelectedAlbum() {
    if (!selectedAlbum) {
      return;
    }

    try {
      setDeleteLoading(true);
      setFormError("");

      await api.delete(`/gallery/${selectedAlbum.id}`);

      const deletedId = selectedAlbum.id;

      setAlbums((current) => current.filter((album) => album.id !== deletedId));

      setSelectedAlbum(null);
      setModal(null);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to delete the album."));
    } finally {
      setDeleteLoading(false);
    }
  }

  async function uploadCover() {
    if (!selectedAlbum || !selectedFile) {
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError("");

      const formData = new FormData();

      formData.append("image", selectedFile);

      await api.post(`/gallery/${selectedAlbum.id}/cover`, formData);

      await loadAlbums();
      await loadAlbum(selectedAlbum.id);

      setModal(null);
      setSelectedFile(null);
    } catch (error) {
      setUploadError(
        getErrorMessage(error, "Unable to upload the album cover."),
      );
    } finally {
      setUploadLoading(false);
    }
  }

  async function uploadPhoto() {
    if (!selectedAlbum || !selectedFile) {
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError("");

      const formData = new FormData();

      formData.append("image", selectedFile);

      if (photoCaption.trim()) {
        formData.append("caption", photoCaption.trim());
      }

      await api.post(`/gallery/${selectedAlbum.id}/images`, formData);

      await loadAlbums();
      await loadAlbum(selectedAlbum.id);

      setModal(null);
      setSelectedFile(null);
      setPhotoCaption("");
    } catch (error) {
      setUploadError(getErrorMessage(error, "Unable to upload the photo."));
    } finally {
      setUploadLoading(false);
    }
  }

  async function updatePhoto() {
    if (!editingImage) {
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError("");

      await api.patch(`/gallery/images/${editingImage.id}`, {
        caption: photoCaption.trim() || undefined,
      });

      if (selectedAlbum) {
        await loadAlbum(selectedAlbum.id);
      }

      setModal(null);
      setEditingImage(null);
      setPhotoCaption("");
    } catch (error) {
      setUploadError(getErrorMessage(error, "Unable to update the photo."));
    } finally {
      setUploadLoading(false);
    }
  }

  async function deletePhoto(image: GalleryImage) {
    if (!selectedAlbum || uploadLoading) {
      return;
    }

    const confirmed = window.confirm(
      `Delete this photo from "${selectedAlbum.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUploadLoading(true);
      setPageError("");

      await api.delete(`/gallery/images/${image.id}`);

      await loadAlbums();
      await loadAlbum(selectedAlbum.id);
    } catch (error) {
      setPageError(getErrorMessage(error, "Unable to delete the photo."));
    } finally {
      setUploadLoading(false);
    }
  }

  if (selectedAlbum) {
    return (
      <div className="space-y-7">
        {pageError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />

              <p className="text-xs font-medium text-red-700">{pageError}</p>
            </div>
          </div>
        )}

        <AlbumDetails
          album={selectedAlbum}
          onBack={() => setSelectedAlbum(null)}
          onEdit={() => openEditModal(selectedAlbum)}
          onDelete={() => openDeleteModal(selectedAlbum)}
          onCover={() => openCoverModal(selectedAlbum)}
          onPhoto={() => openPhotoModal(selectedAlbum)}
          onEditPhoto={openEditPhotoModal}
          onDeletePhoto={deletePhoto}
        />

        {modal === "edit" && (
          <AlbumFormModal
            mode="edit"
            form={form}
            setForm={setForm}
            saving={saving}
            error={formError}
            onClose={closeModal}
            onSave={saveAlbum}
          />
        )}

        {modal === "delete" && (
          <ConfirmationModal
            title="Delete Album"
            description={`Delete "${selectedAlbum.title}" and all of its photos? This action cannot be undone.`}
            confirmLabel="Delete Album"
            loading={deleteLoading}
            error={formError}
            onClose={closeModal}
            onConfirm={deleteSelectedAlbum}
          />
        )}

        {modal === "cover" && (
          <UploadModal
            title="Upload Album Cover"
            description={`Choose a new cover image for "${selectedAlbum.title}".`}
            file={selectedFile}
            setFile={setSelectedFile}
            loading={uploadLoading}
            error={uploadError}
            onClose={closeModal}
            onUpload={uploadCover}
          />
        )}

        {modal === "photo" && (
          <UploadModal
            title={editingImage ? "Edit Photo" : "Add Photo"}
            description={
              editingImage
                ? "Update the caption for this photo."
                : `Upload a new photo to "${selectedAlbum.title}".`
            }
            file={selectedFile}
            setFile={setSelectedFile}
            caption={photoCaption}
            setCaption={setPhotoCaption}
            loading={uploadLoading}
            error={uploadError}
            onClose={closeModal}
            onUpload={editingImage ? updatePhoto : uploadPhoto}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--primary)]">
            IEEE Geeta University
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
            Gallery Management
          </h1>

          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Create albums, manage covers, and organize gallery photos.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Album
        </button>
      </div>

      {pageError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />

            <p className="text-xs font-medium text-red-700">{pageError}</p>
          </div>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Albums</p>

          <p className="mt-1.5 text-2xl font-bold text-[var(--text)]">
            {statistics.albums}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            Total gallery albums
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Photos</p>

          <p className="mt-1.5 text-2xl font-bold text-[var(--text)]">
            {statistics.photos}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            Across all albums
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">Public</p>

          <p className="mt-1.5 text-2xl font-bold text-[var(--text)]">
            {statistics.public}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">Public albums</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--muted)]">
            Members Only
          </p>

          <p className="mt-1.5 text-2xl font-bold text-[var(--text)]">
            {statistics.membersOnly}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            Restricted albums
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                Gallery Albums
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {filteredAlbums.length} of {albums.length} albums
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search albums..."
                  className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] sm:w-56"
                />
              </div>

              <div className="relative">
                <select
                  value={visibilityFilter}
                  onChange={(event) =>
                    setVisibilityFilter(
                      event.target.value as "ALL" | Visibility,
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 pr-9 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)] sm:w-40"
                >
                  <option value="ALL">All visibility</option>
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS_ONLY">Members Only</option>
                  <option value="PRIVATE">Private</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[var(--primary)]" />

            <p className="mt-3 text-sm text-[var(--muted)]">
              Loading gallery...
            </p>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="p-12 text-center">
            <Album className="mx-auto h-9 w-9 text-[var(--muted)]" />

            <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">
              No albums found
            </h3>

            <p className="mt-1.5 text-xs text-[var(--muted)]">
              {search || visibilityFilter !== "ALL"
                ? "No albums match the current filters."
                : "There are currently no gallery albums."}
            </p>

            {!search && visibilityFilter === "ALL" && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Create First Album
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAlbums.map((album) => (
              <article
                key={album.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => openAlbum(album)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface)]">
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : album.images.length > 0 ? (
                      <img
                        src={album.images[0].imageUrl}
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <Album className="h-9 w-9 text-[var(--muted)]" />

                        <p className="mt-2 text-xs text-[var(--muted)]">
                          No images
                        </p>
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${visibilityClasses(
                          album.visibility,
                        )}`}
                      >
                        {formatVisibility(album.visibility)}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold !text-white">
                      {album.images.length}{" "}
                      {album.images.length === 1 ? "photo" : "photos"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-bold text-[var(--text)]">
                      {album.title}
                    </h3>

                    <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-[var(--muted)]">
                      {album.description || "No description provided."}
                    </p>

                    <p className="mt-3 text-[10px] text-[var(--muted)]">
                      Created {formatDate(album.createdAt)}
                    </p>
                  </div>
                </button>

                <div className="flex gap-2 border-t border-[var(--border)] p-3">
                  <button
                    type="button"
                    onClick={() => openAlbum(album)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-2 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(album)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-2 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => openDeleteModal(album)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modal === "create" && (
        <AlbumFormModal
          mode="create"
          form={form}
          setForm={setForm}
          saving={saving}
          error={formError}
          onClose={closeModal}
          onSave={saveAlbum}
        />
      )}

      {modal === "edit" && (
        <AlbumFormModal
          mode="edit"
          form={form}
          setForm={setForm}
          saving={saving}
          error={formError}
          onClose={closeModal}
          onSave={saveAlbum}
        />
      )}

      {modal === "delete" && selectedAlbum ? (
        <ConfirmationModal
          title="Delete Album"
          description="Delete this album and all of its photos? This action cannot be undone."
          confirmLabel="Delete Album"
          loading={deleteLoading}
          error={formError}
          onClose={closeModal}
          onConfirm={deleteSelectedAlbum}
        />
      ) : null}
    </div>
  );
}
