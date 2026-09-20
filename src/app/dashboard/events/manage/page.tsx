"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Filter,
  Globe2,
  ImagePlus,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Send,
  Save,
  Star,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

type EventStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "CANCELLED"
  | "COMPLETED";

type EventAccess = "PUBLIC" | "UNIVERSITY" | "MEMBERS_ONLY" | "INVITE_ONLY";

type EventRegistrationTemplate =
  | "UNIVERSITY_INDIVIDUAL"
  | "UNIVERSITY_TEAM"
  | "INTER_UNIVERSITY_INDIVIDUAL"
  | "INTER_UNIVERSITY_TEAM"
  | "PUBLIC_INDIVIDUAL"
  | "PUBLIC_TEAM"
  | "CUSTOM";

type EventParticipationType = "INDIVIDUAL" | "TEAM";

type EventItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  bannerImage: string | null;
  venue: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  access: EventAccess;
  status: EventStatus;
  approvalStatus: string;
  rejectionReason: string | null;
  isFeatured: boolean;
  registrationTemplate: EventRegistrationTemplate | null;
  participationType: EventParticipationType;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  enableQrAttendance: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
  _count?: {
    registrations: number;
  };
};

type FormStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

type FormFieldType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "MULTIPLE_CHOICE"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "DATE"
  | "TIME"
  | "FILE_UPLOAD"
  | "IMAGE_UPLOAD";

type FormFieldScope = "PARTICIPANT" | "TEAM";

type FormField = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: FormFieldType;
  scope: FormFieldScope;
  required: boolean;
  placeholder: string | null;
  options: unknown;
  validation: unknown;
  order: number;
  isSystemField: boolean;
};

type RegistrationForm = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  template: EventRegistrationTemplate | null;
  status: FormStatus;
  fields: FormField[];
};

type FormFieldDraft = {
  key: string;
  label: string;
  description: string;
  type: FormFieldType;
  scope: FormFieldScope;
  required: boolean;
  placeholder: string;
  options: string[];
};

const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  SHORT_ANSWER: "Short Answer",
  PARAGRAPH: "Paragraph",
  EMAIL: "Email",
  PHONE: "Phone",
  NUMBER: "Number",
  MULTIPLE_CHOICE: "Multiple Choice",
  CHECKBOXES: "Checkboxes",
  DROPDOWN: "Dropdown",
  DATE: "Date",
  TIME: "Time",
  FILE_UPLOAD: "File Upload",
  IMAGE_UPLOAD: "Image Upload",
};

function normalizeOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function createDraftField(): FormFieldDraft {
  return {
    key: "",
    label: "",
    description: "",
    type: "SHORT_ANSWER",
    scope: "PARTICIPANT",
    required: false,
    placeholder: "",
    options: [],
  };
}

type EventForm = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  capacity: string;
  access: EventAccess;
  isFeatured: boolean;
  registrationTemplate: EventRegistrationTemplate;
  participationType: EventParticipationType;
  minTeamSize: string;
  maxTeamSize: string;
  enableQrAttendance: boolean;
};

type ModalType =
  | "create"
  | "edit"
  | "view"
  | "reject"
  | "delete"
  | "cancel"
  | null;

const STATUS_OPTIONS: Array<{
  value: "ALL" | EventStatus;
  label: string;
}> = [
  { value: "ALL", label: "All Events" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

const ACCESS_OPTIONS: Array<{
  value: "ALL" | EventAccess;
  label: string;
}> = [
  { value: "ALL", label: "All Access" },
  { value: "PUBLIC", label: "Public" },
  { value: "UNIVERSITY", label: "University" },
  { value: "MEMBERS_ONLY", label: "Members Only" },
  { value: "INVITE_ONLY", label: "Invite Only" },
];

const EMPTY_FORM: EventForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  venue: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  registrationDeadline: "",
  capacity: "",
  access: "PUBLIC",
  isFeatured: false,
  registrationTemplate: "UNIVERSITY_INDIVIDUAL",
  participationType: "INDIVIDUAL",
  minTeamSize: "",
  maxTeamSize: "",
  enableQrAttendance: false,
};

function getResponseData<T>(response: unknown): T | null {
  if (typeof response === "object" && response !== null && "data" in response) {
    const outer = response as { data?: unknown };

    if (
      typeof outer.data === "object" &&
      outer.data !== null &&
      "data" in outer.data
    ) {
      return ((outer.data as { data?: unknown }).data as T) ?? null;
    }

    return (outer.data as T) ?? null;
  }

  return null;
}

function getErrorMessage(error: unknown, fallback: string) {
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

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatAccess(value: EventAccess) {
  if (value === "MEMBERS_ONLY") {
    return "Members Only";
  }

  if (value === "INVITE_ONLY") {
    return "Invite Only";
  }

  if (value === "UNIVERSITY") {
    return "University";
  }

  return "Public";
}

function formatStatus(value: EventStatus) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatTemplate(value: EventRegistrationTemplate | null | undefined) {
  if (!value) {
    return "Not configured";
  }

  const labels: Record<EventRegistrationTemplate, string> = {
    UNIVERSITY_INDIVIDUAL: "University · Individual",
    UNIVERSITY_TEAM: "University · Team",
    INTER_UNIVERSITY_INDIVIDUAL: "Inter-University · Individual",
    INTER_UNIVERSITY_TEAM: "Inter-University · Team",
    PUBLIC_INDIVIDUAL: "Public · Individual",
    PUBLIC_TEAM: "Public · Team",
    CUSTOM: "Custom",
  };

  return labels[value];
}

function statusClass(value: EventStatus) {
  if (value === "PUBLISHED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "PENDING_APPROVAL") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "APPROVED") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "REJECTED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (value === "CANCELLED") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (value === "COMPLETED") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]";
}

function accessClass(value: EventAccess) {
  if (value === "PUBLIC") {
    return "bg-blue-50 text-blue-700";
  }

  if (value === "UNIVERSITY") {
    return "bg-indigo-50 text-indigo-700";
  }

  if (value === "MEMBERS_ONLY") {
    return "bg-purple-50 text-purple-700";
  }

  return "bg-slate-100 text-slate-700";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLocalDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]">{value}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface)]">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}

function BannerUploader({
  currentImage,
  selectedFile,
  previewUrl,
  uploading,
  removing,
  disabled,
  onFileChange,
  onRemove,
}: {
  currentImage: string | null;
  selectedFile: File | null;
  previewUrl: string;
  uploading: boolean;
  removing: boolean;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const displayedImage = previewUrl || currentImage;

  return (
    <div className="md:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-[var(--text)]">
            Event Banner
          </label>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">
            JPG, PNG or WebP · Maximum 5 MB
          </p>
        </div>

        {selectedFile && (
          <span className="text-[10px] font-semibold text-[var(--primary)]">
            New image selected
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {displayedImage ? (
          <div className="relative aspect-[16/7]">
            <img
              src={displayedImage}
              alt="Event banner preview"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/55 p-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading..." : "Replace Banner"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={disabled || uploading || removing}
                  onChange={(event) => {
                    onFileChange(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              {(currentImage || selectedFile) && (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={disabled || uploading || removing}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold !text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {removing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <label className="flex aspect-[16/7] cursor-pointer flex-col items-center justify-center px-5 text-center transition hover:bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
              <ImagePlus className="h-6 w-6 text-[var(--primary)]" />
            </div>

            <p className="mt-3 text-sm font-semibold text-[var(--text)]">
              Upload event banner
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Choose a JPG, PNG or WebP image up to 5 MB
            </p>

            <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold !text-white">
              <Upload className="h-3.5 w-3.5" />
              Choose Image
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={disabled || uploading || removing}
              onChange={(event) => {
                onFileChange(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function EventActions({
  event,
  loadingAction,
  onView,
  onEdit,
  onForm,
  onSubmit,
  onApprove,
  onReject,
  onPublish,
  onCancel,
  onComplete,
  onDelete,
}: {
  event: EventItem;
  loadingAction: string | null;
  onView: () => void;
  onEdit: () => void;
  onForm: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPublish: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const busy = loadingAction !== null;

  const canEdit =
    event.status === "DRAFT" ||
    event.status === "REJECTED" ||
    event.status === "APPROVED";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onView}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface)] disabled:opacity-50"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>

      {canEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold !text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Event
        </button>
      )}

      {event.status !== "CANCELLED" && event.status !== "COMPLETED" && (
        <button
          type="button"
          onClick={onForm}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface)] disabled:opacity-50"
        >
          <FileText className="h-3.5 w-3.5 text-[var(--primary)]" />
          Registration Form
        </button>
      )}

      {(event.status === "DRAFT" || event.status === "REJECTED") && (
        <>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {loadingAction === "submit" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Submit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </>
      )}

      {event.status === "PENDING_APPROVAL" && (
        <>
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold !text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loadingAction === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Approve
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold !text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </>
      )}

      {event.status === "APPROVED" && (
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--surface)] disabled:opacity-50"
        >
          {loadingAction === "publish" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Globe2 className="h-3.5 w-3.5 text-[var(--primary)]" />
          )}
          Publish
        </button>
      )}

      {event.status === "PUBLISHED" && (
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </button>

          <button
            type="button"
            onClick={onComplete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold !text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loadingAction === "complete" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Complete
          </button>
        </>
      )}
    </div>
  );
}

function EventFormModal({
  mode,
  event,
  form,
  setForm,
  bannerFile,
  setBannerFile,
  bannerPreview,
  setBannerPreview,
  bannerUploading,
  bannerRemoving,
  saving,
  error,
  onClose,
  onSubmit,
  onRemoveBanner,
}: {
  mode: "create" | "edit";
  event: EventItem | null;
  form: EventForm;
  setForm: React.Dispatch<React.SetStateAction<EventForm>>;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
  bannerUploading: boolean;
  bannerRemoving: boolean;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: () => void;
  onRemoveBanner: () => void;
}) {
  const updateField = <K extends keyof EventForm>(
    key: K,
    value: EventForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  function handleBannerChange(file: File | null) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setBannerFile(file);

    const url = URL.createObjectURL(file);
    setBannerPreview(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6">
      <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">
              IEEE Geeta University
            </p>

            <h2 className="mt-1 text-lg font-bold text-[var(--text)]">
              {mode === "create" ? "Create Event" : "Edit Event"}
            </h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {mode === "create"
                ? "Create a new event and configure its registration."
                : "Update event information and registration settings."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || bannerUploading || bannerRemoving}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[76vh] overflow-y-auto p-5">
          {error && (
            <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text)]">
                Event Title *
              </label>

              <input
                value={form.title}
                onChange={(eventInput) => {
                  const value = eventInput.target.value;

                  setForm((current) => ({
                    ...current,
                    title: value,
                    slug: mode === "create" ? slugify(value) : current.slug,
                  }));
                }}
                placeholder="IEEE event title"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Slug *
              </label>

              <input
                value={form.slug}
                onChange={(eventInput) =>
                  updateField("slug", slugify(eventInput.target.value))
                }
                placeholder="event-slug"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Lowercase letters, numbers and hyphens only.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Venue
              </label>

              <input
                value={form.venue}
                onChange={(eventInput) =>
                  updateField("venue", eventInput.target.value)
                }
                placeholder="Venue or location"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text)]">
                Short Description
              </label>

              <textarea
                value={form.shortDescription}
                onChange={(eventInput) =>
                  updateField("shortDescription", eventInput.target.value)
                }
                rows={2}
                maxLength={500}
                placeholder="Short summary shown on event cards"
                className="mt-1.5 w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text)]">
                Full Description *
              </label>

              <textarea
                value={form.description}
                onChange={(eventInput) =>
                  updateField("description", eventInput.target.value)
                }
                rows={7}
                placeholder="Complete event description"
                className="mt-1.5 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <BannerUploader
              currentImage={event?.bannerImage ?? null}
              selectedFile={bannerFile}
              previewUrl={bannerPreview}
              uploading={bannerUploading}
              removing={bannerRemoving}
              disabled={saving}
              onFileChange={handleBannerChange}
              onRemove={onRemoveBanner}
            />

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Event Date *
              </label>

              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(eventInput) =>
                  updateField("eventDate", eventInput.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Registration Deadline
              </label>

              <input
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(eventInput) =>
                  updateField("registrationDeadline", eventInput.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Start Time
              </label>

              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(eventInput) =>
                  updateField("startTime", eventInput.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                End Time
              </label>

              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(eventInput) =>
                  updateField("endTime", eventInput.target.value)
                }
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Capacity
              </label>

              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(eventInput) =>
                  updateField("capacity", eventInput.target.value)
                }
                placeholder="Leave empty for unlimited"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)]">
                Access
              </label>

              <div className="relative mt-1.5">
                <select
                  value={form.access}
                  onChange={(eventInput) =>
                    updateField(
                      "access",
                      eventInput.target.value as EventAccess,
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-9 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="MEMBERS_ONLY">Members Only</option>
                  <option value="INVITE_ONLY">Invite Only</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--muted)]" />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Registration Configuration
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Configure how participants will register for this event.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)]">
                      Registration Template
                    </label>

                    <select
                      value={form.registrationTemplate}
                      onChange={(eventInput) =>
                        updateField(
                          "registrationTemplate",
                          eventInput.target.value as EventRegistrationTemplate,
                        )
                      }
                      className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="UNIVERSITY_INDIVIDUAL">
                        University — Individual
                      </option>
                      <option value="UNIVERSITY_TEAM">University — Team</option>
                      <option value="INTER_UNIVERSITY_INDIVIDUAL">
                        Inter-University — Individual
                      </option>
                      <option value="INTER_UNIVERSITY_TEAM">
                        Inter-University — Team
                      </option>
                      <option value="PUBLIC_INDIVIDUAL">
                        Public — Individual
                      </option>
                      <option value="PUBLIC_TEAM">Public — Team</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)]">
                      Participation Type
                    </label>

                    <select
                      value={form.participationType}
                      onChange={(eventInput) =>
                        updateField(
                          "participationType",
                          eventInput.target.value as EventParticipationType,
                        )
                      }
                      className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="TEAM">Team</option>
                    </select>
                  </div>

                  {form.participationType === "TEAM" && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[var(--text)]">
                          Minimum Team Size
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={form.minTeamSize}
                          onChange={(eventInput) =>
                            updateField("minTeamSize", eventInput.target.value)
                          }
                          placeholder="Minimum members"
                          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[var(--text)]">
                          Maximum Team Size
                        </label>

                        <input
                          type="number"
                          min="2"
                          value={form.maxTeamSize}
                          onChange={(eventInput) =>
                            updateField("maxTeamSize", eventInput.target.value)
                          }
                          placeholder="Maximum members"
                          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                    </>
                  )}

                  <label className="md:col-span-2 flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-white p-3">
                    <input
                      type="checkbox"
                      checked={form.enableQrAttendance}
                      onChange={(eventInput) =>
                        updateField(
                          "enableQrAttendance",
                          eventInput.target.checked,
                        )
                      }
                      className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        Enable QR Attendance
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Generate registration QR codes and use them for event
                        attendance.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(eventInput) =>
                    updateField("isFeatured", eventInput.target.checked)
                  }
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                />

                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Feature this event
                  </p>

                  <p className="text-xs text-[var(--muted)]">
                    Mark this event as featured for supported public displays.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || bannerUploading || bannerRemoving}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || bannerUploading || bannerRemoving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Event" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewEventModal({
  event,
  onClose,
  onEdit,
}: {
  event: EventItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const canEdit =
    event.status === "DRAFT" ||
    event.status === "REJECTED" ||
    event.status === "APPROVED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
        {event.bannerImage ? (
          <div className="relative h-56 bg-[var(--surface)]">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute left-5 right-5 top-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-black/40 p-2 !text-white backdrop-blur transition hover:bg-black/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                  event.status,
                )}`}
              >
                {formatStatus(event.status)}
              </span>

              <h2 className="mt-2 text-xl font-bold !text-white">
                {event.title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                    event.status,
                  )}`}
                >
                  {formatStatus(event.status)}
                </span>

                <h2 className="mt-2 text-xl font-bold text-[var(--text)]">
                  {event.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <CalendarDays className="h-4 w-4" />
                Event Date
              </div>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {formatDateTime(event.eventDate)}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Clock3 className="h-4 w-4" />
                Time
              </div>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {formatTime(event.startTime)}
                {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <MapPin className="h-4 w-4" />
                Venue
              </div>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {event.venue || "Venue to be announced"}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--surface)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Users className="h-4 w-4" />
                Registrations
              </div>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                {event._count?.registrations ?? 0}
                {event.capacity ? ` / ${event.capacity}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${accessClass(
                event.access,
              )}`}
            >
              {formatAccess(event.access)}
            </span>

            {event.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                <Star className="h-3 w-3" />
                Featured
              </span>
            )}

            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)]">
              {formatTemplate(event.registrationTemplate)}
            </span>

            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)]">
              {event.participationType === "TEAM"
                ? `Team${event.minTeamSize ? ` · ${event.minTeamSize}` : ""}${
                    event.maxTeamSize ? `-${event.maxTeamSize}` : ""
                  }`
                : "Individual"}
            </span>

            {event.enableQrAttendance && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                QR Attendance
              </span>
            )}
          </div>

          {event.shortDescription && (
            <p className="mt-5 text-sm font-medium leading-6 text-[var(--text)]">
              {event.shortDescription}
            </p>
          )}

          <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
            {event.description}
          </div>

          <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Registration Deadline
              </p>

              <p className="mt-1 text-sm text-[var(--text)]">
                {formatDateTime(event.registrationDeadline)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Created By
              </p>

              <p className="mt-1 text-sm text-[var(--text)]">
                {event.createdBy
                  ? `${event.createdBy.firstName} ${
                      event.createdBy.lastName ?? ""
                    }`.trim()
                  : "Unknown"}
              </p>
            </div>

            {event.rejectionReason && (
              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                  Rejection Reason
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {event.rejectionReason}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
            >
              Close
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white hover:opacity-90"
              >
                <Pencil className="h-4 w-4" />
                Edit Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  title,
  description,
  confirmLabel,
  danger,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)]">
          {danger ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
          )}
        </div>

        <h2 className="mt-4 text-lg font-bold text-[var(--text)]">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-50"
          >
            Keep
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold !text-white disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--primary)] hover:opacity-90"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  event,
  reason,
  setReason,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  event: EventItem;
  reason: string;
  setReason: (value: string) => void;
  loading: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600">Event Approval</p>

              <h2 className="mt-1 text-lg font-bold text-[var(--text)]">
                Reject Event
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-[var(--muted)]">
            You are rejecting{" "}
            <span className="font-semibold text-[var(--text)]">
              {event.title}
            </span>
            . A rejection reason is required.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <textarea
            value={reason}
            onChange={(eventInput) => setReason(eventInput.target.value)}
            rows={5}
            maxLength={500}
            placeholder="Enter the reason for rejection..."
            className="mt-4 w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-red-500"
          />

          <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
            {reason.length}/500
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || reason.trim().length < 5}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold !text-white disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reject Event
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistrationFormBuilder({
  event,
  onClose,
  onEventUpdated,
}: {
  event: EventItem;
  onClose: () => void;
  onEventUpdated: () => Promise<void>;
}) {
  const [registrationForm, setRegistrationForm] =
    useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fieldSaving, setFieldSaving] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formTitle, setFormTitle] = useState(`${event.title} Registration`);
  const [formDescription, setFormDescription] = useState("");
  const [fieldModal, setFieldModal] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] =
    useState<FormFieldDraft>(createDraftField());

  const optionTypes: FormFieldType[] = [
    "MULTIPLE_CHOICE",
    "CHECKBOXES",
    "DROPDOWN",
  ];

  async function loadForm() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/event-forms/event/${event.id}`);
      const data = response?.data?.data;
      if (!data) {
        setRegistrationForm(null);
        return;
      }
      setRegistrationForm({
        ...data,
        fields: Array.isArray(data.fields)
          ? [...data.fields].sort(
              (a: FormField, b: FormField) => a.order - b.order,
            )
          : [],
      });
      setFormTitle(data.title || `${event.title} Registration`);
      setFormDescription(data.description || "");
    } catch (err) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as { response?: { status?: number; data?: { message?: string } } }
        ).response;
        if (response?.status === 404) {
          setRegistrationForm(null);
          return;
        }
        setError(
          response?.data?.message || "Unable to load the registration form.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the registration form.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadForm();
  }, [event.id]);

  async function handleCreateForm() {
    try {
      setCreating(true);
      setError("");
      const response = await api.post(`/event-forms/event/${event.id}`, {
        title: formTitle.trim() || `${event.title} Registration`,
        description: formDescription.trim() || undefined,
        template: event.registrationTemplate || undefined,
      });
      const data = response?.data?.data;
      if (!data) {
        throw new Error(
          "The server did not return the created registration form.",
        );
      }
      setRegistrationForm({
        ...data,
        fields: Array.isArray(data.fields)
          ? [...data.fields].sort(
              (a: FormField, b: FormField) => a.order - b.order,
            )
          : [],
      });
      setFormTitle(data.title || `${event.title} Registration`);
      setFormDescription(data.description || "");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create the registration form."));
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveDetails() {
    if (!registrationForm) return;
    if (!formTitle.trim()) {
      setError("Form title is required.");
      return;
    }
    try {
      setSavingDetails(true);
      setError("");
      await api.patch(`/event-forms/${registrationForm.id}`, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });
      await loadForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save form details."));
    } finally {
      setSavingDetails(false);
    }
  }

  function openAddField() {
    setEditingFieldId(null);
    setFieldDraft(createDraftField());
    setError("");
    setFieldModal(true);
  }

  function openEditField(field: FormField) {
    setEditingFieldId(field.id);
    setFieldDraft({
      key: field.key,
      label: field.label,
      description: field.description || "",
      type: field.type,
      scope: field.scope,
      required: field.required,
      placeholder: field.placeholder || "",
      options: normalizeOptions(field.options),
    });
    setError("");
    setFieldModal(true);
  }

  async function handleSaveField() {
    if (!registrationForm) return;
    const key = fieldDraft.key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
    const label = fieldDraft.label.trim();
    if (!key || !label) {
      setError("Field key and field label are required.");
      return;
    }
    if (
      optionTypes.includes(fieldDraft.type) &&
      fieldDraft.options.filter((option) => option.trim()).length === 0
    ) {
      setError("Add at least one option for this field type.");
      return;
    }
    try {
      setFieldSaving(true);
      setError("");
      const payload = {
        key,
        label,
        description: fieldDraft.description.trim() || undefined,
        type: fieldDraft.type,
        scope: fieldDraft.scope,
        required: fieldDraft.required,
        placeholder: fieldDraft.placeholder.trim() || undefined,
        options: optionTypes.includes(fieldDraft.type)
          ? fieldDraft.options.map((option) => option.trim()).filter(Boolean)
          : undefined,
      };
      if (editingFieldId) {
        await api.patch(`/event-forms/fields/${editingFieldId}`, payload);
      } else {
        await api.post(`/event-forms/${registrationForm.id}/fields`, payload);
      }
      setFieldModal(false);
      setEditingFieldId(null);
      setFieldDraft(createDraftField());
      await loadForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save this form field."));
    } finally {
      setFieldSaving(false);
    }
  }

  async function handleDeleteField(fieldId: string) {
    try {
      setDeletingFieldId(fieldId);
      setError("");
      await api.delete(`/event-forms/fields/${fieldId}`);
      await loadForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete this form field."));
    } finally {
      setDeletingFieldId(null);
    }
  }

  async function handleMoveField(fieldId: string, direction: "up" | "down") {
    if (!registrationForm) return;
    const fields = [...registrationForm.fields].sort(
      (a, b) => a.order - b.order,
    );
    const index = fields.findIndex((field) => field.id === fieldId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= fields.length) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    try {
      setError("");
      await api.patch(`/event-forms/${registrationForm.id}/fields/reorder`, {
        fieldIds: reordered.map((field) => field.id),
      });
      await loadForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reorder form fields."));
    }
  }

  async function handleFormAction(
    action: "publish" | "close" | "reopen" | "archive",
  ) {
    if (!registrationForm) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.patch(`/event-forms/${registrationForm.id}/${action}`);

      await loadForm();

      if (action === "publish") {
        await onEventUpdated();
      }
    } catch (err) {
      setError(
        getErrorMessage(err, `Unable to ${action} the registration form.`),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteForm() {
    if (!registrationForm) return;
    try {
      setActionLoading(true);
      setError("");
      await api.delete(`/event-forms/${registrationForm.id}`);
      setRegistrationForm(null);
      setFormTitle(`${event.title} Registration`);
      setFormDescription("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete the registration form."));
    } finally {
      setActionLoading(false);
    }
  }

  function updateOption(index: number, value: string) {
    setFieldDraft((current) => {
      const options = [...current.options];
      options[index] = value;
      return { ...current, options };
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--primary)]">
              Registration Form
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-[var(--text)]">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading || savingDetails || creating || fieldSaving}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
                Loading registration form...
              </div>
            </div>
          ) : !registrationForm ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8">
              <FileText className="mx-auto h-10 w-10 text-[var(--muted)]" />
              <h3 className="mt-4 text-center text-lg font-bold text-[var(--text)]">
                Create Registration Form
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-center text-sm leading-6 text-[var(--muted)]">
                Create the form participants will complete before this event can
                be published.
              </p>
              <div className="mx-auto mt-6 max-w-xl space-y-4">
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Registration Form"
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell participants what they need to provide."
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => void handleCreateForm()}
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create Registration Form
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${registrationForm.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : registrationForm.status === "CLOSED" ? "bg-orange-50 text-orange-700" : registrationForm.status === "ARCHIVED" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"}`}
                      >
                        {registrationForm.status}
                      </span>
                      <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                        {formatTemplate(
                          registrationForm.template ||
                            event.registrationTemplate,
                        )}
                      </span>
                    </div>
                    <div className="mt-4 space-y-4">
                      <input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        disabled={registrationForm.status !== "DRAFT"}
                        className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none disabled:bg-slate-50 focus:border-[var(--primary)]"
                      />
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        disabled={registrationForm.status !== "DRAFT"}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none disabled:bg-slate-50 focus:border-[var(--primary)]"
                      />
                      {registrationForm.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={() => void handleSaveDetails()}
                          disabled={savingDetails}
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-50"
                        >
                          {savingDetails ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Form Details
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {registrationForm.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => void handleFormAction("publish")}
                        disabled={
                          actionLoading || registrationForm.fields.length === 0
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Publish Form
                      </button>
                    )}

                    {registrationForm.status === "PUBLISHED" && (
                      <button
                        type="button"
                        onClick={() => void handleFormAction("close")}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Close Form
                      </button>
                    )}

                    {registrationForm.status === "CLOSED" && (
                      <button
                        type="button"
                        onClick={() => void handleFormAction("reopen")}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit3 className="h-4 w-4" />
                        )}
                        Reopen & Edit
                      </button>
                    )}

                    {registrationForm.status !== "ARCHIVED" && (
                      <button
                        type="button"
                        onClick={() => void handleFormAction("archive")}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}

                    {registrationForm.status !== "PUBLISHED" &&
                      registrationForm.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteForm()}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Form
                        </button>
                      )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text)]">
                      Form Fields
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {registrationForm.fields.length}{" "}
                      {registrationForm.fields.length === 1
                        ? "field"
                        : "fields"}{" "}
                      configured.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddField}
                    disabled={registrationForm.status !== "DRAFT"}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Field
                  </button>
                </div>
                {registrationForm.fields.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                    <FileText className="mx-auto h-9 w-9 text-[var(--muted)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                      No fields configured.
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Add the information participants must submit.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...registrationForm.fields]
                      .sort((a, b) => a.order - b.order)
                      .map((field, index, fields) => (
                        <div
                          key={field.id}
                          className="rounded-xl border border-[var(--border)] bg-white p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)]">
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-[var(--text)]">
                                    {field.label}
                                  </h4>
                                  {field.required && (
                                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                      Required
                                    </span>
                                  )}
                                  {field.isSystemField && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                      System
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                                  <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                                    {FIELD_TYPE_LABELS[field.type]}
                                  </span>
                                  <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                                    {field.scope === "TEAM"
                                      ? "Team"
                                      : "Participant"}
                                  </span>
                                  <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                                    {field.key}
                                  </span>
                                </div>
                                {field.description && (
                                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                    {field.description}
                                  </p>
                                )}
                                {normalizeOptions(field.options).length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {normalizeOptions(field.options).map(
                                      (option) => (
                                        <span
                                          key={option}
                                          className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text)]"
                                        >
                                          {option}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleMoveField(field.id, "up")
                                }
                                disabled={
                                  index === 0 ||
                                  registrationForm.status !== "DRAFT"
                                }
                                className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] disabled:opacity-40"
                                aria-label="Move field up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleMoveField(field.id, "down")
                                }
                                disabled={
                                  index === fields.length - 1 ||
                                  registrationForm.status !== "DRAFT"
                                }
                                className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] disabled:opacity-40"
                                aria-label="Move field down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditField(field)}
                                disabled={
                                  field.isSystemField ||
                                  registrationForm.status !== "DRAFT"
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] disabled:opacity-40"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteField(field.id)}
                                disabled={
                                  field.isSystemField ||
                                  registrationForm.status !== "DRAFT" ||
                                  deletingFieldId === field.id
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                              >
                                {deletingFieldId === field.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {fieldModal && registrationForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-white shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {editingFieldId ? "Edit Form Field" : "Add Form Field"}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Configure the information participants should provide.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFieldModal(false)}
                disabled={fieldSaving}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                    Field Key
                  </label>
                  <input
                    value={fieldDraft.key}
                    onChange={(e) =>
                      setFieldDraft((current) => ({
                        ...current,
                        key: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "_"),
                      }))
                    }
                    disabled={Boolean(editingFieldId)}
                    placeholder="college_name"
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none disabled:bg-slate-100 focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                    Field Label
                  </label>
                  <input
                    value={fieldDraft.label}
                    onChange={(e) =>
                      setFieldDraft((current) => ({
                        ...current,
                        label: e.target.value,
                      }))
                    }
                    placeholder="College Name"
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                  Field Type
                </label>
                <select
                  value={fieldDraft.type}
                  onChange={(e) =>
                    setFieldDraft((current) => ({
                      ...current,
                      type: e.target.value as FormFieldType,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                  Description
                </label>
                <textarea
                  value={fieldDraft.description}
                  onChange={(e) =>
                    setFieldDraft((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Optional instructions for participants."
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                    Scope
                  </label>
                  <select
                    value={fieldDraft.scope}
                    onChange={(e) =>
                      setFieldDraft((current) => ({
                        ...current,
                        scope: e.target.value as FormFieldScope,
                      }))
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="PARTICIPANT">Participant</option>
                    <option value="TEAM">Team</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                    Placeholder
                  </label>
                  <input
                    value={fieldDraft.placeholder}
                    onChange={(e) =>
                      setFieldDraft((current) => ({
                        ...current,
                        placeholder: e.target.value,
                      }))
                    }
                    placeholder="Enter your answer"
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <input
                  type="checkbox"
                  checked={fieldDraft.required}
                  onChange={(e) =>
                    setFieldDraft((current) => ({
                      ...current,
                      required: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[var(--text)]">
                    Required field
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    Participants must provide this information.
                  </span>
                </span>
              </label>
              {optionTypes.includes(fieldDraft.type) && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-[var(--text)]">
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFieldDraft((current) => ({
                          ...current,
                          options: [...current.options, ""],
                        }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {fieldDraft.options.map((option, index) => (
                      <div key={`${index}-${option}`} className="flex gap-2">
                        <input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFieldDraft((current) => ({
                              ...current,
                              options: current.options.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            }))
                          }
                          className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFieldModal(false)}
                  disabled={fieldSaving}
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveField()}
                  disabled={fieldSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white disabled:opacity-50"
                >
                  {fieldSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingFieldId ? "Save Changes" : "Add Field"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventManagementPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | EventStatus>("ALL");

  const [accessFilter, setAccessFilter] = useState<"ALL" | EventAccess>("ALL");

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerRemoving, setBannerRemoving] = useState(false);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [formBuilderEvent, setFormBuilderEvent] = useState<EventItem | null>(
    null,
  );

  async function loadEvents() {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await api.get("/events/manage");
      const data = getResponseData<EventItem[]>(response);

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(getErrorMessage(error, "Unable to load events right now."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    return () => {
      if (bannerPreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  const stats = useMemo(
    () => ({
      total: events.length,
      draft: events.filter((event) => event.status === "DRAFT").length,
      pending: events.filter((event) => event.status === "PENDING_APPROVAL")
        .length,
      approved: events.filter((event) => event.status === "APPROVED").length,
      published: events.filter((event) => event.status === "PUBLISHED").length,
      rejected: events.filter((event) => event.status === "REJECTED").length,
      cancelled: events.filter((event) => event.status === "CANCELLED").length,
      completed: events.filter((event) => event.status === "COMPLETED").length,
    }),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return events
      .filter((event) => {
        if (statusFilter !== "ALL" && event.status !== statusFilter) {
          return false;
        }

        if (accessFilter !== "ALL" && event.access !== accessFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          event.title,
          event.slug,
          event.venue ?? "",
          event.shortDescription ?? "",
          event.description ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort(
        (first, second) =>
          new Date(first.eventDate).getTime() -
          new Date(second.eventDate).getTime(),
      );
  }, [events, search, statusFilter, accessFilter]);

  function resetFormState() {
    setForm(EMPTY_FORM);
    setBannerFile(null);
    setBannerPreview("");
    setFormError("");
  }

  function closeModal() {
    if (saving || loadingAction || bannerUploading || bannerRemoving) {
      return;
    }

    setModal(null);
    setSelectedEvent(null);
    resetFormState();
    setActionError("");
    setRejectReason("");
  }

  function openCreate() {
    setSelectedEvent(null);
    resetFormState();
    setModal("create");
  }

  function openEdit(event: EventItem) {
    setSelectedEvent(event);
    setForm({
      title: event.title,
      slug: event.slug,
      shortDescription: event.shortDescription ?? "",
      description: event.description ?? "",
      venue: event.venue ?? "",
      eventDate: toLocalDateTimeInput(event.eventDate),
      startTime: toLocalDateTimeInput(event.startTime),
      endTime: toLocalDateTimeInput(event.endTime),
      registrationDeadline: toLocalDateTimeInput(event.registrationDeadline),
      capacity:
        event.capacity !== null && event.capacity !== undefined
          ? String(event.capacity)
          : "",
      access: event.access,
      isFeatured: event.isFeatured,
      registrationTemplate:
        event.registrationTemplate ?? "UNIVERSITY_INDIVIDUAL",
      participationType: event.participationType ?? "INDIVIDUAL",
      minTeamSize:
        event.minTeamSize !== null && event.minTeamSize !== undefined
          ? String(event.minTeamSize)
          : "",
      maxTeamSize:
        event.maxTeamSize !== null && event.maxTeamSize !== undefined
          ? String(event.maxTeamSize)
          : "",
      enableQrAttendance: event.enableQrAttendance ?? false,
    });
    setBannerFile(null);
    setBannerPreview("");
    setFormError("");
    setModal("edit");
  }

  function openView(event: EventItem) {
    setSelectedEvent(event);
    setModal("view");
  }

  function openReject(event: EventItem) {
    setSelectedEvent(event);
    setRejectReason("");
    setActionError("");
    setModal("reject");
  }

  function openDelete(event: EventItem) {
    setSelectedEvent(event);
    setActionError("");
    setModal("delete");
  }

  function openCancel(event: EventItem) {
    setSelectedEvent(event);
    setActionError("");
    setModal("cancel");
  }

  async function uploadBanner(eventId: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setBannerUploading(true);

      const response = await api.post(`/events/${eventId}/banner`, formData);

      const updated = getResponseData<EventItem>(response);

      if (updated) {
        setEvents((current) =>
          current.map((event) => (event.id === updated.id ? updated : event)),
        );

        setSelectedEvent(updated);
      }

      return updated;
    } finally {
      setBannerUploading(false);
    }
  }

  async function removeBanner(eventId: string) {
    try {
      setBannerRemoving(true);

      const response = await api.delete(`/events/${eventId}/banner`);

      const updated = getResponseData<EventItem>(response);

      if (updated) {
        setEvents((current) =>
          current.map((event) => (event.id === updated.id ? updated : event)),
        );

        setSelectedEvent(updated);
      }

      setBannerFile(null);
      setBannerPreview("");
    } finally {
      setBannerRemoving(false);
    }
  }

  async function handleRemoveBanner() {
    if (bannerFile) {
      setBannerFile(null);
      setBannerPreview("");
      return;
    }

    if (!selectedEvent?.bannerImage) {
      return;
    }

    try {
      setFormError("");
      await removeBanner(selectedEvent.id);
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to remove the event banner."),
      );
    }
  }

  const handleSaveEvent = async () => {
    if (!form.title.trim()) {
      setFormError("Event title is required");
      return;
    }

    if (!form.slug.trim()) {
      setFormError("Event slug is required");
      return;
    }

    if (!form.description.trim()) {
      setFormError("Event description is required");
      return;
    }

    if (!form.eventDate) {
      setFormError("Event date is required");
      return;
    }

    if (!form.startTime) {
      setFormError("Start time is required");
      return;
    }

    if (
      form.participationType === "TEAM" &&
      form.minTeamSize &&
      form.maxTeamSize &&
      Number(form.minTeamSize) > Number(form.maxTeamSize)
    ) {
      setFormError(
        "Minimum team size cannot be greater than maximum team size.",
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        description: form.description.trim(),
        venue: form.venue.trim() || undefined,
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime || undefined,
        registrationDeadline: form.registrationDeadline || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        access: form.access,
        isFeatured: form.isFeatured,
        registrationTemplate: form.registrationTemplate,
        participationType: form.participationType,
        minTeamSize:
          form.participationType === "TEAM" && form.minTeamSize
            ? Number(form.minTeamSize)
            : undefined,
        maxTeamSize:
          form.participationType === "TEAM" && form.maxTeamSize
            ? Number(form.maxTeamSize)
            : undefined,
        enableQrAttendance: form.enableQrAttendance,
      };

      let eventId: string | undefined;

      if (modal === "edit" && selectedEvent) {
        await api.patch(`/events/${selectedEvent.id}`, payload);

        eventId = selectedEvent.id;
      } else {
        const response = await api.post("/events", payload);

        const data = getResponseData<{
          id?: string;
          event?: {
            id?: string;
          };
        }>(response);

        eventId = data?.id ?? data?.event?.id;
      }

      if (eventId && bannerFile) {
        await uploadBanner(eventId, bannerFile);
      }

      await loadEvents();

      setModal(null);
      setSelectedEvent(null);
      resetFormState();
      setActionError("");
      setRejectReason("");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to save the event right now."),
      );
    } finally {
      setSaving(false);
    }
  };

  async function performAction(
    action: string,
    request: () => Promise<unknown>,
  ) {
    if (!selectedEvent) {
      return;
    }

    try {
      setLoadingAction(action);
      setActionError("");

      const response = await request();

      const updated = getResponseData<EventItem>(response);

      if (action === "delete") {
        setEvents((current) =>
          current.filter((event) => event.id !== selectedEvent.id),
        );

        setModal(null);
        setSelectedEvent(null);
        return;
      }

      if (updated) {
        setEvents((current) =>
          current.map((event) => (event.id === updated.id ? updated : event)),
        );
      } else {
        await loadEvents();
      }

      setModal(null);
      setSelectedEvent(null);
      setRejectReason("");
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to complete this action."));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSubmit(event: EventItem) {
    setSelectedEvent(event);

    await performAction("submit", () => api.post(`/events/${event.id}/submit`));
  }

  async function handleApprove(event: EventItem) {
    setSelectedEvent(event);

    await performAction("approve", () =>
      api.patch(`/events/${event.id}/approve`),
    );
  }

  async function handlePublish(event: EventItem) {
    setSelectedEvent(event);

    try {
      setLoadingAction("publish");
      setActionError("");

      let formResponse;
      try {
        formResponse = await api.get(`/event-forms/event/${event.id}`);
      } catch (error) {
        const status =
          typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;
        if (status !== 404) {
          throw error;
        }
      }

      let registrationForm = formResponse?.data?.data;

      if (!registrationForm) {
        const createdResponse = await api.post(
          `/event-forms/event/${event.id}`,
          {
            title: `${event.title} Registration`,
            template: event.registrationTemplate || undefined,
          },
        );
        registrationForm = createdResponse?.data?.data;
      }

      if (!registrationForm?.id) {
        throw new Error("Registration form could not be created.");
      }

      if (registrationForm.status !== "PUBLISHED") {
        await api.patch(`/event-forms/${registrationForm.id}/publish`);
      }

      const response = await api.patch(`/events/${event.id}/publish`);
      const updated = getResponseData<EventItem>(response);

      if (updated) {
        setEvents((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        await loadEvents();
      }
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to publish the event."));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleComplete(event: EventItem) {
    setSelectedEvent(event);

    await performAction("complete", () =>
      api.patch(`/events/${event.id}/complete`),
    );
  }

  async function handleDelete() {
    if (!selectedEvent) {
      return;
    }

    await performAction("delete", () =>
      api.delete(`/events/${selectedEvent.id}`),
    );
  }

  async function handleCancel() {
    if (!selectedEvent) {
      return;
    }

    await performAction("cancel", () =>
      api.patch(`/events/${selectedEvent.id}/cancel`),
    );
  }

  async function handleReject() {
    if (!selectedEvent) {
      return;
    }

    if (rejectReason.trim().length < 5) {
      setActionError(
        "Please provide at least 5 characters for the rejection reason.",
      );
      return;
    }

    try {
      setLoadingAction("reject");
      setActionError("");

      const response = await api.patch(`/events/${selectedEvent.id}/reject`, {
        rejectionReason: rejectReason.trim(),
      });

      const updated = getResponseData<EventItem>(response);

      if (updated) {
        setEvents((current) =>
          current.map((event) => (event.id === updated.id ? updated : event)),
        );
      }

      setModal(null);
      setSelectedEvent(null);
      setRejectReason("");
    } catch (error) {
      setActionError(getErrorMessage(error, "Unable to reject the event."));
    } finally {
      setLoadingAction(null);
    }
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !saving &&
        !loadingAction &&
        !bannerUploading &&
        !bannerRemoving
      ) {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [saving, loadingAction, bannerUploading, bannerRemoving]);

  return (
    <>
      <style jsx global>{`
        html,
        body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="space-y-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">
              IEEE Geeta University
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
              Event Management
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
              Create, edit, review, approve, publish and manage IEEE Geeta
              University events.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>

        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to load events
              </p>

              <p className="mt-1 text-xs text-red-600">{pageError}</p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Events"
            value={stats.total}
            icon={CalendarDays}
          />

          <StatCard label="Draft" value={stats.draft} icon={FileText} />

          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon={UserCheck}
          />

          <StatCard label="Published" value={stats.published} icon={Globe2} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Approved" value={stats.approved} icon={Check} />

          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} />

          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon={AlertCircle}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
          />
        </div>

        <section className="rounded-xl border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search events..."
                  className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="relative lg:w-52">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "ALL" | EventStatus)
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-9 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--muted)]" />
              </div>

              <div className="relative lg:w-48">
                <select
                  value={accessFilter}
                  onChange={(event) =>
                    setAccessFilter(event.target.value as "ALL" | EventAccess)
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-9 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  {ACCESS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--muted)]" />
              </div>
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading events...
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <CalendarDays className="h-9 w-9 text-[var(--muted)]" />

                <h2 className="mt-3 text-base font-semibold text-[var(--text)]">
                  {events.length === 0
                    ? "No events created yet"
                    : "No matching events"}
                </h2>

                <p className="mt-1.5 max-w-md text-sm text-[var(--muted)]">
                  {events.length === 0
                    ? "Create your first IEEE event to begin the event workflow."
                    : "Try changing the search or filter criteria."}
                </p>

                {events.length === 0 && (
                  <button
                    type="button"
                    onClick={openCreate}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Create Event
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <div className="relative h-44 shrink-0 bg-[var(--surface)] lg:h-auto lg:w-56">
                        {event.bannerImage ? (
                          <img
                            src={event.bannerImage}
                            alt={event.title}
                            className="h-full min-h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-44 items-center justify-center">
                            <CalendarDays className="h-10 w-10 text-[var(--muted)]" />
                          </div>
                        )}

                        {event.isFeatured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--primary)] shadow-sm">
                            <Star className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 p-4">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                                  event.status,
                                )}`}
                              >
                                {formatStatus(event.status)}
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${accessClass(
                                  event.access,
                                )}`}
                              >
                                {formatAccess(event.access)}
                              </span>
                            </div>

                            <h2 className="mt-2 line-clamp-2 text-base font-bold text-[var(--text)]">
                              {event.title}
                            </h2>

                            {event.shortDescription && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                                {event.shortDescription}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            <EventActions
                              event={event}
                              loadingAction={
                                selectedEvent?.id === event.id
                                  ? loadingAction
                                  : null
                              }
                              onView={() => openView(event)}
                              onEdit={() => openEdit(event)}
                              onForm={() => setFormBuilderEvent(event)}
                              onSubmit={() => void handleSubmit(event)}
                              onApprove={() => void handleApprove(event)}
                              onReject={() => openReject(event)}
                              onPublish={() => void handlePublish(event)}
                              onCancel={() => openCancel(event)}
                              onComplete={() => void handleComplete(event)}
                              onDelete={() => openDelete(event)}
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2 xl:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {formatTime(event.startTime)}
                              {event.endTime
                                ? ` - ${formatTime(event.endTime)}`
                                : ""}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {event.venue || "Venue to be announced"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {event._count?.registrations ?? 0}
                              {event.capacity
                                ? ` / ${event.capacity}`
                                : " registered"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--muted)]">
                          <span>
                            Slug:{" "}
                            <span className="font-medium text-[var(--text)]">
                              {event.slug}
                            </span>
                          </span>

                          <span>
                            Registration:{" "}
                            <span className="font-medium text-[var(--text)]">
                              {formatTemplate(event.registrationTemplate)}
                            </span>
                          </span>

                          <span>
                            Participation:{" "}
                            <span className="font-medium text-[var(--text)]">
                              {event.participationType === "TEAM"
                                ? "Team"
                                : "Individual"}
                            </span>
                          </span>

                          {event.enableQrAttendance && (
                            <span className="font-medium text-emerald-700">
                              QR Attendance Enabled
                            </span>
                          )}

                          {event.createdBy && (
                            <span>
                              Created by:{" "}
                              <span className="font-medium text-[var(--text)]">
                                {`${event.createdBy.firstName} ${
                                  event.createdBy.lastName ?? ""
                                }`.trim()}
                              </span>
                            </span>
                          )}

                          {event.registrationDeadline && (
                            <span>
                              Registration closes:{" "}
                              <span className="font-medium text-[var(--text)]">
                                {formatDateTime(event.registrationDeadline)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {!isLoading && events.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">
                Showing {filteredEvents.length} of {events.length} events
              </p>
            </div>
          )}
        </section>

        {(modal === "create" || modal === "edit") && (
          <EventFormModal
            mode={modal === "create" ? "create" : "edit"}
            event={modal === "edit" ? selectedEvent : null}
            form={form}
            setForm={setForm}
            bannerFile={bannerFile}
            setBannerFile={setBannerFile}
            bannerPreview={bannerPreview}
            setBannerPreview={setBannerPreview}
            bannerUploading={bannerUploading}
            bannerRemoving={bannerRemoving}
            saving={saving}
            error={formError}
            onClose={closeModal}
            onSubmit={() => void handleSaveEvent()}
            onRemoveBanner={() => void handleRemoveBanner()}
          />
        )}

        {modal === "view" && selectedEvent && (
          <ViewEventModal
            event={selectedEvent}
            onClose={closeModal}
            onEdit={() => {
              openEdit(selectedEvent);
            }}
          />
        )}

        {modal === "reject" && selectedEvent && (
          <RejectModal
            event={selectedEvent}
            reason={rejectReason}
            setReason={setRejectReason}
            loading={loadingAction === "reject"}
            error={actionError}
            onClose={closeModal}
            onConfirm={() => void handleReject()}
          />
        )}

        {modal === "delete" && selectedEvent && (
          <ConfirmationModal
            title="Delete Event"
            description={`Are you sure you want to permanently delete "${selectedEvent.title}"? This action cannot be undone.`}
            confirmLabel="Delete Event"
            danger
            loading={loadingAction === "delete"}
            error={actionError}
            onClose={closeModal}
            onConfirm={() => void handleDelete()}
          />
        )}

        {modal === "cancel" && selectedEvent && (
          <ConfirmationModal
            title="Cancel Event"
            description={`Are you sure you want to cancel "${selectedEvent.title}"? Registered participants will be notified by the event service.`}
            confirmLabel="Cancel Event"
            danger
            loading={loadingAction === "cancel"}
            error={actionError}
            onClose={closeModal}
            onConfirm={() => void handleCancel()}
          />
        )}

        {formBuilderEvent && (
          <RegistrationFormBuilder
            event={formBuilderEvent}
            onClose={() => setFormBuilderEvent(null)}
            onEventUpdated={loadEvents}
          />
        )}
      </div>
    </>
  );
}
