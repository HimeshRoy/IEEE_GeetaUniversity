"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit3,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

interface Event {
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
  access: "PUBLIC" | "UNIVERSITY" | "MEMBERS_ONLY" | "INVITE_ONLY";
  status: string;
  isFeatured: boolean;
  registrationTemplate:
    | "UNIVERSITY_INDIVIDUAL"
    | "UNIVERSITY_TEAM"
    | "INTER_UNIVERSITY_INDIVIDUAL"
    | "INTER_UNIVERSITY_TEAM"
    | "PUBLIC_INDIVIDUAL"
    | "PUBLIC_TEAM"
    | "CUSTOM"
    | null;
  participationType: "INDIVIDUAL" | "TEAM";
  minTeamSize: number | null;
  maxTeamSize: number | null;
  enableQrAttendance: boolean;
  _count?: {
    registrations: number;
  };
}

type FormStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

type FieldType =
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

type FieldScope = "PARTICIPANT" | "TEAM";

interface FormField {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: FieldType;
  scope: FieldScope;
  required: boolean;
  placeholder: string | null;
  options: unknown;
  validation: unknown;
  order: number;
  isSystemField: boolean;
}

interface EventForm {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  template: Event["registrationTemplate"];
  status: FormStatus;
  fields: FormField[];
}

interface FormFieldDraft {
  key: string;
  label: string;
  description: string;
  type: FieldType;
  scope: FieldScope;
  required: boolean;
  placeholder: string;
  options: string[];
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
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

const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

const MANAGEMENT_ROLES = [
  "WEBMASTER",
  "IEEE_COUNSELOR",
  "FACULTY_ADVISOR",
  "CHAIRMAN",
];

function formatDate(date: string | null) {
  if (!date) {
    return "Date not specified";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(parsedDate);
}

function formatDateTime(date: string | null) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(parsedDate);
}

function formatTime(time: string | null) {
  if (!time) {
    return null;
  }

  const parsedDate = new Date(time);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(parsedDate);
}

function getAccessLabel(access: Event["access"]) {
  if (access === "MEMBERS_ONLY") {
    return "Members Only";
  }

  if (access === "UNIVERSITY") {
    return "University";
  }

  if (access === "INVITE_ONLY") {
    return "Invite Only";
  }

  return "Public";
}

function normalizeOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
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

function getFormTemplateLabel(
  template: Event["registrationTemplate"],
  participationType: Event["participationType"],
) {
  if (template === "UNIVERSITY_INDIVIDUAL") {
    return "University Individual";
  }

  if (template === "UNIVERSITY_TEAM") {
    return "University Team";
  }

  if (template === "INTER_UNIVERSITY_INDIVIDUAL") {
    return "Inter-University Individual";
  }

  if (template === "INTER_UNIVERSITY_TEAM") {
    return "Inter-University Team";
  }

  if (template === "PUBLIC_INDIVIDUAL") {
    return "Public Individual";
  }

  if (template === "PUBLIC_TEAM") {
    return "Public Team";
  }

  if (template === "CUSTOM") {
    return "Custom";
  }

  return participationType === "TEAM"
    ? "Team Registration"
    : "Individual Registration";
}

export default function StudentEventDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [formActionLoading, setFormActionLoading] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] =
    useState<FormFieldDraft>(createDraftField());
  const [isFieldSaving, setIsFieldSaving] = useState(false);

  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

  const canManageForm = useMemo(() => {
    return Boolean(user && MANAGEMENT_ROLES.includes(user.role));
  }, [user]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    async function loadEvent() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/events/slug/${slug}`);
        const data = response?.data?.data;

        if (!data) {
          throw new Error("Event not found");
        }

        setEvent(data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Unable to load this event."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvent();
  }, [slug]);

  useEffect(() => {
    if (!event || !canManageForm) {
      return;
    }

    async function loadForm() {
      try {
        setIsFormLoading(true);
        setFormError("");

        const response = await api.get(`/event-forms/event/${event!.id}`);
        const data = response?.data?.data;

        if (data) {
          setForm({
            ...data,
            fields: Array.isArray(data.fields)
              ? [...data.fields].sort(
                  (a: FormField, b: FormField) => a.order - b.order,
                )
              : [],
          });
          setFormTitle(data.title || "");
          setFormDescription(data.description || "");
        } else {
          setForm(null);
          setFormTitle(`${event!.title} Registration`);
          setFormDescription("");
        }
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          setForm(null);
          setFormTitle(`${event!.title} Registration`);
          setFormDescription("");
        } else {
          setFormError(
            getErrorMessage(error, "Unable to load the registration form."),
          );
        }
      } finally {
        setIsFormLoading(false);
      }
    }

    void loadForm();
  }, [event, canManageForm]);

  async function reloadForm() {
    if (!event) {
      return;
    }

    try {
      setIsFormLoading(true);
      setFormError("");

      const response = await api.get(`/event-forms/event/${event.id}`);
      const data = response?.data?.data;

      if (!data) {
        setForm(null);
        return;
      }

      setForm({
        ...data,
        fields: Array.isArray(data.fields)
          ? [...data.fields].sort(
              (a: FormField, b: FormField) => a.order - b.order,
            )
          : [],
      });

      setFormTitle(data.title || "");
      setFormDescription(data.description || "");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        setForm(null);
      } else {
        setFormError(
          getErrorMessage(
            error,
            "Unable to load the registration form.",
          ),
        );
      }
    } finally {
      setIsFormLoading(false);
    }
  }

  async function handleCreateForm() {
    if (!event) {
      return;
    }

    try {
      setIsCreatingForm(true);
      setFormError("");

      const response = await api.post(`/event-forms/event/${event.id}`, {
        title: formTitle.trim() || `${event.title} Registration`,
        description: formDescription.trim() || undefined,
        template: event.registrationTemplate || undefined,
      });

      const data = response?.data?.data;

      if (!data) {
        throw new Error("Unable to create registration form.");
      }

      setForm({
        ...data,
        fields: Array.isArray(data.fields)
          ? [...data.fields].sort(
              (a: FormField, b: FormField) => a.order - b.order,
            )
          : [],
      });

      setFormTitle(data.title || "");
      setFormDescription(data.description || "");
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(error, "Unable to create the registration form."),
      );
    } finally {
      setIsCreatingForm(false);
    }
  }

  async function handleSaveFormDetails() {
    if (!form) {
      return;
    }

    try {
      setIsSavingForm(true);
      setFormError("");

      const response = await api.patch(`/event-forms/${form.id}`, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });

      const data = response?.data?.data;

      if (data) {
        setForm({
          ...data,
          fields: Array.isArray(data.fields)
            ? [...data.fields].sort(
                (a: FormField, b: FormField) => a.order - b.order,
              )
            : form.fields,
        });
      }
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to save form details.",
        ),
      );
    } finally {
      setIsSavingForm(false);
    }
  }

  function openAddFieldModal() {
    if (!form || form.status !== "DRAFT") {
      return;
    }

    setEditingFieldId(null);
    setFieldDraft(createDraftField());
    setIsFieldModalOpen(true);
  }

  function openEditFieldModal(field: FormField) {
    if (!form || form.status !== "DRAFT" || field.isSystemField) {
      return;
    }

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
    setIsFieldModalOpen(true);
  }

  async function handleSaveField() {
    if (!form) {
      return;
    }

    const trimmedKey = fieldDraft.key.trim();
    const trimmedLabel = fieldDraft.label.trim();

    if (!trimmedKey || !trimmedLabel) {
      setFormError("Field key and field label are required.");
      return;
    }

    const optionTypes: FieldType[] = [
      "MULTIPLE_CHOICE",
      "CHECKBOXES",
      "DROPDOWN",
    ];

    if (
      optionTypes.includes(fieldDraft.type) &&
      fieldDraft.options.filter((item) => item.trim()).length === 0
    ) {
      setFormError("Add at least one option for this field type.");
      return;
    }

    try {
      setIsFieldSaving(true);
      setFormError("");

      const payload = {
        key: trimmedKey,
        label: trimmedLabel,
        description: fieldDraft.description.trim() || undefined,
        type: fieldDraft.type,
        scope: fieldDraft.scope,
        required: fieldDraft.required,
        placeholder: fieldDraft.placeholder.trim() || undefined,
        options: optionTypes.includes(fieldDraft.type)
          ? fieldDraft.options.map((item) => item.trim()).filter(Boolean)
          : undefined,
      };

      if (editingFieldId) {
        await api.patch(`/event-forms/fields/${editingFieldId}`, payload);
      } else {
        await api.post(`/event-forms/${form.id}/fields`, payload);
      }

      setIsFieldModalOpen(false);
      setEditingFieldId(null);
      setFieldDraft(createDraftField());

      await reloadForm();
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to save this form field.",
        ),
      );
    } finally {
      setIsFieldSaving(false);
    }
  }

  async function handleDeleteField(fieldId: string) {
    if (!form) {
      return;
    }

    try {
      setDeletingFieldId(fieldId);
      setFormError("");

      await api.delete(`/event-forms/fields/${fieldId}`);
      await reloadForm();
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to delete this form field.",
        ),
      );
    } finally {
      setDeletingFieldId(null);
    }
  }

  async function handleMoveField(fieldId: string, direction: "up" | "down") {
    if (!form) {
      return;
    }

    const fields = [...form.fields].sort((a, b) => a.order - b.order);
    const currentIndex = fields.findIndex((field) => field.id === fieldId);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= fields.length) {
      return;
    }

    const reordered = [...fields];
    const [movedField] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedField);

    const fieldIds = reordered.map((field) => field.id);

    try {
      setFormError("");

      await api.patch(`/event-forms/${form.id}/fields/reorder`, {
        fieldIds,
      });

      await reloadForm();
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to reorder form fields.",
        ),
      );
    }
  }

  async function handleFormAction(action: "publish" | "close" | "archive") {
    if (!form) {
      return;
    }

    try {
      setFormActionLoading(true);
      setFormError("");

      await api.patch(`/event-forms/${form.id}/${action}`);
      await reloadForm();
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(
          error,
          `Unable to ${action} the registration form.`,
        ),
      );
    } finally {
      setFormActionLoading(false);
    }
  }

  async function handleDeleteForm() {
    if (!form) {
      return;
    }

    try {
      setFormActionLoading(true);
      setFormError("");

      await api.delete(`/event-forms/${form.id}`);
      setForm(null);
      setFormTitle(event ? `${event.title} Registration` : "");
      setFormDescription("");
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to delete the registration form.",
        ),
      );
    } finally {
      setFormActionLoading(false);
    }
  }

  function updateOption(index: number, value: string) {
    setFieldDraft((current) => {
      const options = [...current.options];
      options[index] = value;
      return {
        ...current,
        options,
      };
    });
  }

  function addOption() {
    setFieldDraft((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  }

  function removeOption(index: number) {
    setFieldDraft((current) => ({
      ...current,
      options: current.options.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
        <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--primary)]" />
        <p className="mt-3 text-sm text-[var(--muted)]">Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
        <CalendarDays className="mx-auto h-9 w-9 text-[var(--muted)]" />

        <h1 className="mt-4 text-xl font-bold text-[var(--text)]">
          Event not found
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          {error || "This event is no longer available."}
        </p>

        <Link
          href="/dashboard/events"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);
  const registrationDeadline = formatDateTime(event.registrationDeadline);

  const eventEnd = event.endTime
    ? new Date(event.endTime)
    : new Date(event.eventDate);

  const isPast = !Number.isNaN(eventEnd.getTime())
    ? eventEnd.getTime() < Date.now()
    : false;

  const sortedFields = [...(form?.fields || [])].sort(
    (a, b) => a.order - b.order,
  );

  const canEditForm = form?.status === "DRAFT";
  const isRegistrationDeadlinePassed =
    Boolean(event.registrationDeadline) &&
    new Date(event.registrationDeadline as string).getTime() < Date.now();
  const isEventRegistrationClosed =
    isPast || event.status !== "PUBLISHED" || isRegistrationDeadlinePassed;
  const isInviteOnly = event.access === "INVITE_ONLY";

  const optionTypes: FieldType[] = [
    "MULTIPLE_CHOICE",
    "CHECKBOXES",
    "DROPDOWN",
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
        <div className="relative h-48 bg-[var(--surface)] sm:h-56 lg:h-64">
          {event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays className="h-12 w-12 text-[var(--muted)]" />
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              {getAccessLabel(event.access)}
            </span>

            {event.isFeatured && (
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                Featured
              </span>
            )}

            {isPast && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                Past Event
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[var(--text)] sm:text-3xl">
            {event.title}
          </h1>

          {event.shortDescription && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              {event.shortDescription}
            </p>
          )}

          <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Date
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text)]">
                  {formatDate(event.eventDate)}
                </p>
              </div>
            </div>

            {startTime && (
              <div className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--text)]">
                    {startTime}
                    {endTime ? ` - ${endTime}` : ""} IST
                  </p>
                </div>
              </div>
            )}

            {event.venue && (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Venue
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--text)]">
                    {event.venue}
                  </p>
                </div>
              </div>
            )}

            {event.capacity !== null && (
              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Capacity
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--text)]">
                    {event.capacity} participants
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            About the event
          </p>

          <h2 className="mt-2 text-xl font-bold text-[var(--text)]">
            Event Details
          </h2>

          <div className="mt-5 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
            {event.description}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-base font-bold text-[var(--text)]">
            Registration
          </h2>

          <div className="mt-4 space-y-4">
            {registrationDeadline && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Deadline
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text)]">
                  {registrationDeadline} IST
                </p>
              </div>
            )}

            {event.capacity !== null && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Registered
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text)]">
                  {event._count?.registrations || 0} / {event.capacity}
                </p>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Access
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">
                {getAccessLabel(event.access)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Registration Type
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">
                {getFormTemplateLabel(
                  event.registrationTemplate,
                  event.participationType,
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            {isInviteOnly ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-amber-800">
                  Invitation Required
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  This event is available only to invited participants.
                </p>
              </div>
            ) : isEventRegistrationClosed ? (
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600">
                {isPast
                  ? "This event has ended"
                  : event.status !== "PUBLISHED"
                    ? "Registration is not open"
                    : "Registration is closed"}
              </div>
            ) : (
              <Link
                href={`/dashboard/events/${event.slug}/register`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white transition-opacity hover:opacity-90"
              >
                Register for Event
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </aside>
      </div>

      {canManageForm && (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Registration Form
                </h2>
              </div>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Build the registration form that participants will complete.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white"
            >
              {isFormOpen ? (
                <>
                  Hide Builder
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Open Builder
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {isFormOpen && (
            <div className="p-5 sm:p-7">
              {isFormLoading ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)]" />
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Loading registration form...
                  </p>
                </div>
              ) : (
                <>
                  {formError && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium leading-6 text-red-700">
                      {formError}
                    </div>
                  )}

                  {!form ? (
                    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                      <FileText className="mx-auto h-10 w-10 text-[var(--muted)]" />

                      <h3 className="mt-4 text-lg font-bold text-[var(--text)]">
                        No registration form yet
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                        Create a form for this event. The form will use the
                        event&apos;s configured registration template.
                      </p>

                      <div className="mx-auto mt-6 max-w-xl space-y-4 text-left">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                            Form Title
                          </label>
                          <input
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                            placeholder="Registration Form"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                            Description
                          </label>
                          <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                            placeholder="Tell participants what they need to provide."
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleCreateForm}
                          disabled={isCreatingForm}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCreatingForm ? (
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
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  form.status === "PUBLISHED"
                                    ? "bg-green-100 text-green-700"
                                    : form.status === "CLOSED"
                                      ? "bg-orange-100 text-orange-700"
                                      : form.status === "ARCHIVED"
                                        ? "bg-gray-200 text-gray-700"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {FORM_STATUS_LABELS[form.status]}
                              </span>

                              <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                                {getFormTemplateLabel(
                                  form.template || event.registrationTemplate,
                                  event.participationType,
                                )}
                              </span>
                            </div>

                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                                  Form Title
                                </label>
                                <input
                                  value={formTitle}
                                  onChange={(e) => setFormTitle(e.target.value)}
                                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                                  Description
                                </label>
                                <textarea
                                  value={formDescription}
                                  onChange={(e) =>
                                    setFormDescription(e.target.value)
                                  }
                                  disabled={!canEditForm}
                                  rows={3}
                                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleSaveFormDetails}
                                disabled={isSavingForm || !canEditForm}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isSavingForm ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Save Form Details
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {form.status === "DRAFT" && (
                              <button
                                type="button"
                                onClick={() => handleFormAction("publish")}
                                disabled={formActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white disabled:opacity-60"
                              >
                                {formActionLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Publish
                              </button>
                            )}

                            {form.status === "PUBLISHED" && (
                              <button
                                type="button"
                                onClick={() => handleFormAction("close")}
                                disabled={formActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 disabled:opacity-60"
                              >
                                <X className="h-4 w-4" />
                                Close
                              </button>
                            )}

                            {form.status !== "ARCHIVED" && (
                              <button
                                type="button"
                                onClick={() => handleFormAction("archive")}
                                disabled={formActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
                              >
                                Archive
                              </button>
                            )}

                            {form.status !== "PUBLISHED" && (
                              <button
                                type="button"
                                onClick={handleDeleteForm}
                                disabled={formActionLoading}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
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
                              {sortedFields.length}{" "}
                              {sortedFields.length === 1 ? "field" : "fields"}{" "}
                              configured.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={openAddFieldModal}
                            disabled={!canEditForm}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                            Add Field
                          </button>
                        </div>

                        {sortedFields.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                            <FileText className="mx-auto h-9 w-9 text-[var(--muted)]" />
                            <p className="mt-3 text-sm font-medium text-[var(--text)]">
                              No custom fields added yet.
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              Add fields to collect the information required
                              from participants.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sortedFields.map((field, index) => (
                              <div
                                key={field.id}
                                className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)]">
                                    {index + 1}
                                  </div>

                                  <div className="min-w-0 flex-1">
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
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
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

                                    {normalizeOptions(field.options).length >
                                      0 && (
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

                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleMoveField(field.id, "up")
                                      }
                                      disabled={index === 0 || !canEditForm}
                                      aria-label="Move field up"
                                      className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleMoveField(field.id, "down")
                                      }
                                      disabled={
                                        index === sortedFields.length - 1 ||
                                        !canEditForm
                                      }
                                      aria-label="Move field down"
                                      className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => openEditFieldModal(field)}
                                      disabled={
                                        field.isSystemField || !canEditForm
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteField(field.id)
                                      }
                                      disabled={
                                        field.isSystemField ||
                                        !canEditForm ||
                                        deletingFieldId === field.id
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                </>
              )}
            </div>
          )}
        </section>
      )}

      {isFieldModalOpen && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {editingFieldId ? "Edit Form Field" : "Add Form Field"}
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Configure exactly what participants should provide.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFieldModalOpen(false)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
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
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] disabled:bg-gray-100"
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
                      type: e.target.value as FieldType,
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
                        scope: e.target.value as FieldScope,
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
                      onClick={addOption}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {fieldDraft.options.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
                        No options added.
                      </div>
                    ) : (
                      fieldDraft.options.map((option, index) => (
                        <div key={`${index}-${option}`} className="flex gap-2">
                          <input
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                          />

                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700"
                            aria-label={`Remove option ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {(fieldDraft.type === "FILE_UPLOAD" ||
                fieldDraft.type === "IMAGE_UPLOAD") && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                  <div className="flex gap-3">
                    <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        File field
                      </p>
                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        This field will be included in the registration form
                        configuration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsFieldModalOpen(false)}
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveField}
                  disabled={isFieldSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFieldSaving ? (
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
