"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Clock3,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

type Visibility = "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  visibility: Visibility;
  isPublished: boolean;
  approvalStatus: ApprovalStatus;
  publishedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  title: string;
  content: string;
  imageUrl: string;
  visibility: Visibility;
};

type ModalType =
  | "create"
  | "edit"
  | "view"
  | "reject"
  | "delete"
  | null;

type ActionType =
  | "submit"
  | "approve"
  | "publish"
  | "unpublish"
  | null;

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  imageUrl: "",
  visibility: "PUBLIC",
};

function getResponseData<T>(response: {
  data?: {
    data?: T;
  };
}) {
  return response?.data?.data as T;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    axiosError?.response?.data?.message ||
    axiosError?.message ||
    fallback
  );
}

function formatDate(date: string | null) {
  if (!date) {
    return "Not available";
  }

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

function formatDateTime(date: string | null) {
  if (!date) {
    return "Not available";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatVisibility(
  visibility: Visibility,
) {
  if (visibility === "MEMBERS_ONLY") {
    return "Members Only";
  }

  if (visibility === "PRIVATE") {
    return "Private";
  }

  return "Public";
}

function getVisibilityClasses(
  visibility: Visibility,
) {
  if (visibility === "MEMBERS_ONLY") {
    return "bg-purple-50 text-purple-700";
  }

  if (visibility === "PRIVATE") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-blue-50 text-blue-700";
}

function getApprovalClasses(
  status: ApprovalStatus,
) {
  if (status === "APPROVED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "REJECTED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function formatApprovalStatus(
  status: ApprovalStatus,
) {
  if (status === "APPROVED") {
    return "Approved";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  return "Pending";
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: number;
  icon: typeof Bell;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--muted)]">
            {label}
          </p>

          <p className="mt-1.5 text-2xl font-bold text-[var(--text)]">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-[var(--surface)] p-2">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}

function AnnouncementFormModal({
  mode,
  form,
  setForm,
  error,
  saving,
  announcement,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  form: FormState;
  setForm: React.Dispatch<
    React.SetStateAction<FormState>
  >;
  error: string;
  saving: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] p-5">
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">
              Announcement Management
            </p>

            <h2 className="mt-1 text-lg font-bold text-[var(--text)]">
              {mode === "create"
                ? "Create Announcement"
                : "Edit Announcement"}
            </h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {mode === "create"
                ? "Create a new announcement for the IEEE Geeta University platform."
                : "Update this announcement before it is approved."}
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
              <p className="text-xs font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="announcement-title"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Title
            </label>

            <input
              id="announcement-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Enter announcement title"
              maxLength={200}
              disabled={saving}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
            />
          </div>

          <div>
            <label
              htmlFor="announcement-content"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Content
            </label>

            <textarea
              id="announcement-content"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              placeholder="Write the announcement content..."
              rows={8}
              maxLength={20000}
              disabled={saving}
              className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm leading-6 text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
            />

            <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
              {form.content.length}/20000
            </p>
          </div>

          <div>
            <label
              htmlFor="announcement-image"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Image URL
            </label>

            <input
              id="announcement-image"
              type="url"
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
              placeholder="https://..."
              disabled={saving}
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
            />

            {form.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                <img
                  src={form.imageUrl}
                  alt="Announcement preview"
                  className="max-h-52 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="announcement-visibility"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Visibility
            </label>

            <div className="relative mt-2">
              <select
                id="announcement-visibility"
                value={form.visibility}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visibility:
                      event.target.value as Visibility,
                  }))
                }
                disabled={saving}
                className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-10 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">
                  Members Only
                </option>
                <option value="PRIVATE">Private</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            </div>
          </div>

          {announcement && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800">
                Editing this announcement will reset its approval
                state and require approval again.
              </p>
            </div>
          )}
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
            {saving && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}

            {mode === "create"
              ? "Create Announcement"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewAnnouncementModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--border)] p-5">
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">
              Announcement
            </p>

            <h2 className="mt-1 text-xl font-bold text-[var(--text)]">
              {announcement.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {announcement.imageUrl && (
          <div className="border-b border-[var(--border)]">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="max-h-80 w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getVisibilityClasses(
                announcement.visibility,
              )}`}
            >
              {formatVisibility(announcement.visibility)}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getApprovalClasses(
                announcement.approvalStatus,
              )}`}
            >
              {formatApprovalStatus(
                announcement.approvalStatus,
              )}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                announcement.isPublished
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {announcement.isPublished
                ? "Published"
                : "Unpublished"}
            </span>
          </div>

          <div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">
              {announcement.content}
            </p>
          </div>

          {announcement.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold text-red-800">
                Rejection Reason
              </p>

              <p className="mt-1.5 text-xs leading-5 text-red-700">
                {announcement.rejectionReason}
              </p>
            </div>
          )}

          <div className="grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Created
              </p>

              <p className="mt-1 text-xs text-[var(--text)]">
                {formatDateTime(announcement.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Last Updated
              </p>

              <p className="mt-1 text-xs text-[var(--text)]">
                {formatDateTime(announcement.updatedAt)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Approved
              </p>

              <p className="mt-1 text-xs text-[var(--text)]">
                {formatDateTime(announcement.approvedAt)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Published
              </p>

              <p className="mt-1 text-xs text-[var(--text)]">
                {formatDateTime(announcement.publishedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--border)] p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90"
          >
            Close
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
  destructive,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  error: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-2.5 ${
                destructive
                  ? "bg-red-50"
                  : "bg-[var(--surface)]"
              }`}
            >
              {destructive ? (
                <Trash2 className="h-5 w-5 text-red-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-[var(--primary)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
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
              <p className="text-xs font-medium text-red-700">
                {error}
              </p>
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
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              destructive
                ? "bg-red-600"
                : "bg-[var(--primary)]"
            }`}
          >
            {loading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}

            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  reason,
  setReason,
  error,
  loading,
  onClose,
  onConfirm,
}: {
  reason: string;
  setReason: React.Dispatch<
    React.SetStateAction<string>
  >;
  error: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-[var(--border)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                Reject Announcement
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Provide a reason so the creator knows what needs
                to be changed.
              </p>
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
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="rejection-reason"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Rejection Reason
            </label>

            <textarea
              id="rejection-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              rows={5}
              maxLength={500}
              disabled={loading}
              placeholder="Explain why this announcement is being rejected..."
              className="mt-2 w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] disabled:bg-[var(--surface)]"
            />

            <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
              {reason.length}/500
            </p>
          </div>
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
            disabled={
              loading || reason.trim().length < 5
            }
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold !text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}

            Reject Announcement
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<"ALL" | Visibility>("ALL");
  const [approvalFilter, setApprovalFilter] =
    useState<"ALL" | ApprovalStatus>("ALL");
  const [publishedFilter, setPublishedFilter] =
    useState<"ALL" | "PUBLISHED" | "UNPUBLISHED">(
      "ALL",
    );

  const [modal, setModal] =
    useState<ModalType>(null);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [actionType, setActionType] =
    useState<ActionType>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [rejectLoading, setRejectLoading] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  async function loadAnnouncements() {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await api.get(
        "/announcements/manage",
      );

      const data =
        getResponseData<Announcement[]>(response);

      setAnnouncements(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      setPageError(
        getErrorMessage(
          error,
          "Unable to load announcements right now.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      if (
        visibilityFilter !== "ALL" &&
        announcement.visibility !== visibilityFilter
      ) {
        return false;
      }

      if (
        approvalFilter !== "ALL" &&
        announcement.approvalStatus !== approvalFilter
      ) {
        return false;
      }

      if (
        publishedFilter === "PUBLISHED" &&
        !announcement.isPublished
      ) {
        return false;
      }

      if (
        publishedFilter === "UNPUBLISHED" &&
        announcement.isPublished
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        announcement.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        announcement.content
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [
    announcements,
    search,
    visibilityFilter,
    approvalFilter,
    publishedFilter,
  ]);

  const statistics = useMemo(
    () => ({
      total: announcements.length,
      pending: announcements.filter(
        (announcement) =>
          announcement.approvalStatus === "PENDING",
      ).length,
      approved: announcements.filter(
        (announcement) =>
          announcement.approvalStatus === "APPROVED",
      ).length,
      published: announcements.filter(
        (announcement) =>
          announcement.isPublished,
      ).length,
      rejected: announcements.filter(
        (announcement) =>
          announcement.approvalStatus === "REJECTED",
      ).length,
    }),
    [announcements],
  );

  function openCreateModal() {
    setSelectedAnnouncement(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setActionError("");
    setModal("create");
  }

  function openEditModal(
    announcement: Announcement,
  ) {
    setSelectedAnnouncement(announcement);

    setForm({
      title: announcement.title,
      content: announcement.content,
      imageUrl: announcement.imageUrl || "",
      visibility: announcement.visibility,
    });

    setFormError("");
    setActionError("");
    setModal("edit");
  }

  function openViewModal(
    announcement: Announcement,
  ) {
    setSelectedAnnouncement(announcement);
    setActionError("");
    setModal("view");
  }

  function closeModal() {
    if (
      saving ||
      actionLoading ||
      deleteLoading ||
      rejectLoading
    ) {
      return;
    }

    setModal(null);
    setSelectedAnnouncement(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setRejectReason("");
    setActionError("");
  }

  async function handleSave() {
    if (form.title.trim().length < 3) {
      setFormError(
        "Announcement title must be at least 3 characters.",
      );
      return;
    }

    if (form.content.trim().length < 10) {
      setFormError(
        "Announcement content must be at least 10 characters.",
      );
      return;
    }

    if (
      form.imageUrl.trim() &&
      !/^https?:\/\/.+/i.test(
        form.imageUrl.trim(),
      )
    ) {
      setFormError(
        "Image URL must be a valid URL.",
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl:
          form.imageUrl.trim() || undefined,
        visibility: form.visibility,
      };

      if (
        modal === "edit" &&
        selectedAnnouncement
      ) {
        await api.patch(
          `/announcements/${selectedAnnouncement.id}`,
          payload,
        );
      } else {
        await api.post(
          "/announcements",
          payload,
        );
      }

      await loadAnnouncements();
      setModal(null);
      setSelectedAnnouncement(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to save the announcement.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  function openActionModal(
    announcement: Announcement,
    action: ActionType,
  ) {
    setSelectedAnnouncement(announcement);
    setActionType(action);
    setActionError("");
    setModal(null);
    setActionLoading(false);
  }

  async function executeAction() {
    if (!selectedAnnouncement || !actionType) {
      return;
    }

    try {
      setActionError("");
      setActionLoading(true);

      const id = selectedAnnouncement.id;

      if (actionType === "submit") {
        await api.post(
          `/announcements/${id}/submit`,
        );
      }

      if (actionType === "approve") {
        await api.patch(
          `/announcements/${id}/approve`,
        );
      }

      if (actionType === "publish") {
        await api.patch(
          `/announcements/${id}/publish`,
        );
      }

      if (actionType === "unpublish") {
        await api.patch(
          `/announcements/${id}/unpublish`,
        );
      }

      await loadAnnouncements();

      setSelectedAnnouncement(null);
      setActionType(null);
      setActionError("");
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          "Unable to complete this action.",
        ),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function executeDelete() {
    if (!selectedAnnouncement) {
      return;
    }

    try {
      setActionError("");
      setDeleteLoading(true);

      await api.delete(
        `/announcements/${selectedAnnouncement.id}`,
      );

      await loadAnnouncements();

      setSelectedAnnouncement(null);
      setModal(null);
      setActionError("");
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          "Unable to delete the announcement.",
        ),
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  async function executeReject() {
    if (
      !selectedAnnouncement ||
      rejectReason.trim().length < 5
    ) {
      return;
    }

    try {
      setActionError("");
      setRejectLoading(true);

      await api.patch(
        `/announcements/${selectedAnnouncement.id}/reject`,
        {
          rejectionReason:
            rejectReason.trim(),
        },
      );

      await loadAnnouncements();

      setSelectedAnnouncement(null);
      setRejectReason("");
      setModal(null);
      setActionError("");
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          "Unable to reject the announcement.",
        ),
      );
    } finally {
      setRejectLoading(false);
    }
  }

  function getActionTitle() {
    if (actionType === "submit") {
      return "Submit for Approval";
    }

    if (actionType === "approve") {
      return "Approve Announcement";
    }

    if (actionType === "publish") {
      return "Publish Announcement";
    }

    return "Unpublish Announcement";
  }

  function getActionDescription() {
    if (!selectedAnnouncement) {
      return "";
    }

    if (actionType === "submit") {
      return `Submit "${selectedAnnouncement.title}" for approval?`;
    }

    if (actionType === "approve") {
      return `Approve "${selectedAnnouncement.title}"? It will become eligible for publishing.`;
    }

    if (actionType === "publish") {
      return `Publish "${selectedAnnouncement.title}"? It will become visible according to its visibility setting.`;
    }

    return `Unpublish "${selectedAnnouncement.title}"? It will no longer be visible as a published announcement.`;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--primary)]">
            IEEE Geeta University
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
            Announcement Management
          </h1>

          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Create, review, approve, publish, and manage branch
            announcements.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      {pageError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            {pageError}
          </p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={statistics.total}
          icon={Bell}
          description="All announcements"
        />

        <StatCard
          label="Pending"
          value={statistics.pending}
          icon={Clock3}
          description="Awaiting approval"
        />

        <StatCard
          label="Published"
          value={statistics.published}
          icon={CheckCircle2}
          description="Currently published"
        />

        <StatCard
          label="Rejected"
          value={statistics.rejected}
          icon={XCircle}
          description="Rejected announcements"
        />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                Announcements
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {filteredAnnouncements.length} of{" "}
                {announcements.length} announcements
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search announcements..."
                  className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] sm:w-56"
                />
              </div>

              <div className="relative">
                <select
                  value={visibilityFilter}
                  onChange={(event) =>
                    setVisibilityFilter(
                      event.target.value as
                        | "ALL"
                        | Visibility,
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 pr-9 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)] sm:w-36"
                >
                  <option value="ALL">
                    All visibility
                  </option>
                  <option value="PUBLIC">
                    Public
                  </option>
                  <option value="MEMBERS_ONLY">
                    Members Only
                  </option>
                  <option value="PRIVATE">
                    Private
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <div className="relative">
                <select
                  value={approvalFilter}
                  onChange={(event) =>
                    setApprovalFilter(
                      event.target.value as
                        | "ALL"
                        | ApprovalStatus,
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 pr-9 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)] sm:w-36"
                >
                  <option value="ALL">
                    All approval
                  </option>
                  <option value="PENDING">
                    Pending
                  </option>
                  <option value="APPROVED">
                    Approved
                  </option>
                  <option value="REJECTED">
                    Rejected
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <div className="relative">
                <select
                  value={publishedFilter}
                  onChange={(event) =>
                    setPublishedFilter(
                      event.target.value as
                        | "ALL"
                        | "PUBLISHED"
                        | "UNPUBLISHED",
                    )
                  }
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 pr-9 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)] sm:w-36"
                >
                  <option value="ALL">
                    All publishing
                  </option>
                  <option value="PUBLISHED">
                    Published
                  </option>
                  <option value="UNPUBLISHED">
                    Unpublished
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[var(--primary)]" />

            <p className="mt-3 text-sm text-[var(--muted)]">
              Loading announcements...
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-9 w-9 text-[var(--muted)]" />

            <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">
              No announcements found
            </h3>

            <p className="mt-1.5 text-xs text-[var(--muted)]">
              {search ||
              visibilityFilter !== "ALL" ||
              approvalFilter !== "ALL" ||
              publishedFilter !== "ALL"
                ? "No announcements match the current filters."
                : "There are currently no announcements."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Announcement
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Visibility
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Approval
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Published
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAnnouncements.map(
                  (announcement) => (
                    <tr
                      key={announcement.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--surface)]">
                            {announcement.imageUrl ? (
                              <img
                                src={announcement.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Bell className="h-4 w-4 text-[var(--muted)]" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  announcement,
                                )
                              }
                              className="line-clamp-2 text-left text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)]"
                            >
                              {announcement.title}
                            </button>

                            <p className="mt-1 line-clamp-2 max-w-[350px] text-xs leading-5 text-[var(--muted)]">
                              {announcement.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getVisibilityClasses(
                            announcement.visibility,
                          )}`}
                        >
                          {formatVisibility(
                            announcement.visibility,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getApprovalClasses(
                            announcement.approvalStatus,
                          )}`}
                        >
                          {formatApprovalStatus(
                            announcement.approvalStatus,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {announcement.isPublished ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Published
                            </span>

                            <p className="mt-1 text-[10px] text-[var(--muted)]">
                              {formatDate(
                                announcement.publishedAt,
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <EyeOff className="h-3.5 w-3.5" />
                            Unpublished
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs text-[var(--text)]">
                          {formatDate(
                            announcement.createdAt,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openViewModal(
                                announcement,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>

                          {!announcement.isPublished &&
                            announcement.approvalStatus !==
                              "APPROVED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    announcement,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}

                          {!announcement.isPublished &&
                            announcement.approvalStatus ===
                              "REJECTED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActionModal(
                                    announcement,
                                    "submit",
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                <Send className="h-3.5 w-3.5" />
                                Resubmit
                              </button>
                            )}

                          {!announcement.isPublished &&
                            announcement.approvalStatus ===
                              "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openActionModal(
                                      announcement,
                                      "approve",
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAnnouncement(
                                      announcement,
                                    );
                                    setRejectReason("");
                                    setActionError("");
                                    setRejectLoading(false);
                                    setModal("reject");
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-100"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              </>
                            )}

                          {!announcement.isPublished &&
                            announcement.approvalStatus ===
                              "APPROVED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActionModal(
                                    announcement,
                                    "publish",
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-2.5 py-1.5 text-[10px] font-semibold !text-white hover:opacity-90"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Publish
                              </button>
                            )}

                          {announcement.isPublished && (
                            <button
                              type="button"
                              onClick={() =>
                                openActionModal(
                                  announcement,
                                  "unpublish",
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100"
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                              Unpublish
                            </button>
                          )}

                          {!announcement.isPublished && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAnnouncement(
                                  announcement,
                                );
                                setActionError("");
                                setDeleteLoading(false);
                                setModal("delete");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal === "create" && (
        <AnnouncementFormModal
          mode="create"
          form={form}
          setForm={setForm}
          error={formError}
          saving={saving}
          announcement={null}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {modal === "edit" &&
        selectedAnnouncement && (
          <AnnouncementFormModal
            mode="edit"
            form={form}
            setForm={setForm}
            error={formError}
            saving={saving}
            announcement={selectedAnnouncement}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}

      {modal === "view" &&
        selectedAnnouncement && (
          <ViewAnnouncementModal
            announcement={selectedAnnouncement}
            onClose={closeModal}
          />
        )}

      {modal === "reject" &&
        selectedAnnouncement && (
          <RejectModal
            reason={rejectReason}
            setReason={setRejectReason}
            error={actionError}
            loading={rejectLoading}
            onClose={closeModal}
            onConfirm={executeReject}
          />
        )}

      {modal === "delete" &&
        selectedAnnouncement && (
          <ConfirmationModal
            title="Delete Announcement"
            description={`Delete "${selectedAnnouncement.title}"? This cannot be undone.`}
            confirmLabel="Delete Announcement"
            loading={deleteLoading}
            error={actionError}
            destructive
            onClose={closeModal}
            onConfirm={executeDelete}
          />
        )}

      {actionType && selectedAnnouncement && (
        <ConfirmationModal
          title={getActionTitle()}
          description={getActionDescription()}
          confirmLabel={getActionTitle()}
          loading={actionLoading}
          error={actionError}
          onClose={() => {
            if (actionLoading) {
              return;
            }

            setActionType(null);
            setSelectedAnnouncement(null);
            setActionError("");
          }}
          onConfirm={executeAction}
        />
      )}

      {actionError &&
        !modal &&
        !actionType && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-red-200 bg-red-50 p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

              <p className="text-xs font-medium text-red-700">
                {actionError}
              </p>

              <button
                type="button"
                onClick={() => setActionError("")}
                className="text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}