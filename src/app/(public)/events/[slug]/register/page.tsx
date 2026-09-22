"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  MapPin,
  Plus,
  QrCode,
  Trash2,
  UserRound,
} from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

type EventAccess = "PUBLIC" | "UNIVERSITY" | "MEMBERS_ONLY" | "INVITE_ONLY";

type ParticipationType = "INDIVIDUAL" | "TEAM";

type RegistrationStatus =
  | "REGISTERED"
  | "CANCELLED"
  | "ATTENDED"
  | "ABSENT"
  | "WAITLISTED";

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

type AnswerValue = string | number | boolean | string[];

type Answers = Record<string, AnswerValue>;

interface Event {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description?: string | null;
  bannerImage: string | null;
  venue: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;
  capacity: number | null;
  access: EventAccess;
  status: string;
  participationType: ParticipationType;
  registrationTemplate:
    | "UNIVERSITY_INDIVIDUAL"
    | "UNIVERSITY_TEAM"
    | "INTER_UNIVERSITY_INDIVIDUAL"
    | "INTER_UNIVERSITY_TEAM"
    | "PUBLIC_INDIVIDUAL"
    | "PUBLIC_TEAM"
    | "CUSTOM"
    | null;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  enableQrAttendance: boolean;
}

interface FormValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
  pattern?: string;
  regex?: string;
}

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
  validation?: unknown;
  order: number;
  isSystemField: boolean;
}

interface EventForm {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  fields: FormField[];
}

interface RegistrationTeam {
  id: string;
  name: string;
}

interface RegistrationTeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  qrToken?: string | null;
  registrationStatus?: RegistrationStatus;
}

interface Registration {
  id: string;
  eventId: string;
  userId: string | null;
  teamId: string | null;
  name: string;
  email: string;
  phone: string | null;
  qrToken: string | null;
  isTeamLeader: boolean;
  registrationStatus: RegistrationStatus;
  registeredAt: string;
  attendedAt: string | null;
  team?: RegistrationTeam | null;
  teamMembers?: RegistrationTeamMember[];
  event?: {
    id: string;
    title: string;
    enableQrAttendance: boolean;
  };
}

interface TeamMemberDraft {
  answers: Answers;
}

function getData<T>(response: unknown): T | undefined {
  if (!response || typeof response !== "object") {
    return undefined;
  }

  const value = response as { data?: unknown };

  if (value.data && typeof value.data === "object" && "data" in value.data) {
    return (value.data as { data?: T }).data;
  }

  return value.data as T | undefined;
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

  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeOptions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeValidation(value: unknown): FormValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as FormValidation;
}

function isEmpty(value: AnswerValue | undefined) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getAccessLabel(access: EventAccess) {
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

function getStatusLabel(status: RegistrationStatus) {
  if (status === "WAITLISTED") {
    return "Waitlisted";
  }

  if (status === "ATTENDED") {
    return "Attended";
  }

  if (status === "CANCELLED") {
    return "Cancelled";
  }

  if (status === "ABSENT") {
    return "Absent";
  }

  return "Registered";
}

function getStatusClasses(status: RegistrationStatus) {
  if (status === "WAITLISTED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "ATTENDED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "CANCELLED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "ABSENT") {
    return "border-gray-200 bg-gray-50 text-gray-700";
  }

  return "border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]";
}

function getQrImageUrl(token: string) {
  return `https://quickchart.io/qr?size=640&margin=2&text=${encodeURIComponent(
    token,
  )}`;
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = context.measureText(testLine).width;

    if (width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    context.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

async function createQrDownload(
  token: string,
  eventTitle: string,
  participantName: string,
  teamName: string | null,
) {
  const response = await fetch(getQrImageUrl(token), {
    method: "GET",
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to download QR image");
  }

  const qrBlob = await response.blob();
  const imageUrl = URL.createObjectURL(qrBlob);

  try {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to prepare QR image"));
      image.src = imageUrl;
    });

    const canvas = document.createElement("canvas");

    canvas.width = 1000;
    canvas.height = 1180;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create QR image");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#0f172a";
    context.textAlign = "center";
    context.font = '700 42px Inter, Arial, "Helvetica Neue", sans-serif';

    let currentY = 85;

    currentY = drawWrappedText(
      context,
      eventTitle,
      canvas.width / 2,
      currentY,
      850,
      52,
    );

    context.fillStyle = "#64748b";
    context.font = '600 22px Inter, Arial, "Helvetica Neue", sans-serif';

    currentY += 18;

    context.fillText("EVENT ENTRY QR CODE", canvas.width / 2, currentY);

    const qrSize = 620;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = currentY + 45;

    context.fillStyle = "#ffffff";
    context.shadowColor = "rgba(15, 23, 42, 0.12)";
    context.shadowBlur = 24;
    context.shadowOffsetY = 8;

    context.fillRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    context.drawImage(image, qrX, qrY, qrSize, qrSize);

    let detailsY = qrY + qrSize + 75;

    context.fillStyle = "#0f172a";
    context.font = '700 26px Inter, Arial, "Helvetica Neue", sans-serif';

    context.fillText(participantName, canvas.width / 2, detailsY);

    if (teamName) {
      detailsY += 40;

      context.fillStyle = "#475569";
      context.font = '600 22px Inter, Arial, "Helvetica Neue", sans-serif';

      context.fillText(`Team: ${teamName}`, canvas.width / 2, detailsY);
    }

    detailsY += 50;

    context.fillStyle = "#94a3b8";
    context.font = '500 18px Inter, Arial, "Helvetica Neue", sans-serif';

    context.fillText(
      "Keep this QR code ready for event entry and attendance verification.",
      canvas.width / 2,
      detailsY,
    );

    const finalBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png", 1);
    });

    if (!finalBlob) {
      throw new Error("Unable to generate QR download");
    }

    const downloadUrl = URL.createObjectURL(finalBlob);

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${sanitizeFileName(
      `IEEE GU - ${eventTitle} - ${participantName} - QR Code`,
    )}.png`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function setAnswerValue(
  setter: Dispatch<SetStateAction<Answers>>,
  key: string,
  value: AnswerValue,
) {
  setter((current) => ({
    ...current,
    [key]: value,
  }));
}

function toggleAnswerCheckbox(
  setter: Dispatch<SetStateAction<Answers>>,
  key: string,
  option: string,
) {
  setter((current) => {
    const selected = Array.isArray(current[key]) ? current[key] : [];

    return {
      ...current,
      [key]: selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    };
  });
}

function RegistrationField({
  field,
  value,
  onChange,
  onToggleCheckbox,
  disabled = false,
  idPrefix = "field",
  inputName,
}: {
  field: FormField;
  value: AnswerValue | undefined;
  onChange: (key: string, value: AnswerValue) => void;
  onToggleCheckbox: (key: string, option: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  inputName?: string;
}) {
  const options = normalizeOptions(field.options);
  const validation = normalizeValidation(field.validation);

  const inputId = `${idPrefix}-${field.id}`;
  const radioName = inputName ?? field.key;

  const inputClasses =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--secondary)] shadow-sm outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:py-3.5";

  const selected = Array.isArray(value) ? value : [];

  if (field.type === "FILE_UPLOAD" || field.type === "IMAGE_UPLOAD") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
        <p className="text-sm font-bold text-amber-800">{field.label}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-700 sm:text-sm">
          File uploads are configured for this form, but this registration
          endpoint does not provide file storage.
        </p>
      </div>
    );
  }

  if (field.type === "PARAGRAPH") {
    return (
      <textarea
        id={inputId}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(field.key, event.target.value)}
        disabled={disabled}
        placeholder={field.placeholder ?? ""}
        required={field.required}
        minLength={validation.minLength}
        maxLength={validation.maxLength}
        rows={4}
        className={`${inputClasses} resize-y leading-relaxed sm:rows-5`}
      />
    );
  }

  if (field.type === "MULTIPLE_CHOICE") {
    return (
      <div className="space-y-2.5 sm:space-y-3">
        {options.map((option) => (
          <label
            key={option}
            className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 shadow-sm transition-all duration-200 sm:px-4 sm:py-3.5 ${
              value === option
                ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                : "border-[var(--border)] bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--surface)]"
            }`}
          >
            <input
              type="radio"
              name={radioName}
              value={option}
              checked={value === option}
              disabled={disabled}
              onChange={() => onChange(field.key, option)}
              className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] sm:h-4.5 sm:w-4.5"
            />
            <span className={`text-sm font-medium ${value === option ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "CHECKBOXES") {
    return (
      <div className="space-y-2.5 sm:space-y-3">
        {options.map((option) => {
          const checked = selected.includes(option);

          return (
            <label
              key={option}
              className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 shadow-sm transition-all duration-200 sm:px-4 sm:py-3.5 ${
                checked
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--surface)]"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggleCheckbox(field.key, option)}
                className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] sm:h-4.5 sm:w-4.5"
              />
              <span className={`text-sm font-medium ${checked ? "text-[var(--primary)]" : "text-[var(--secondary)]"}`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  if (field.type === "DROPDOWN") {
    return (
      <select
        id={inputId}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(field.key, event.target.value)}
        disabled={disabled}
        required={field.required}
        className={inputClasses}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  const inputType =
    field.type === "EMAIL"
      ? "email"
      : field.type === "PHONE"
        ? "tel"
        : field.type === "NUMBER"
          ? "number"
          : field.type === "DATE"
            ? "date"
            : field.type === "TIME"
              ? "time"
              : "text";

  return (
    <input
      id={inputId}
      type={inputType}
      value={
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : ""
      }
      onChange={(event) => {
        const raw = event.target.value;

        const nextValue: AnswerValue =
          field.type === "NUMBER" && raw !== "" ? Number(raw) : raw;

        onChange(field.key, nextValue);
      }}
      disabled={disabled}
      required={field.required}
      minLength={validation.minLength}
      maxLength={validation.maxLength}
      min={field.type === "NUMBER" ? validation.min : undefined}
      max={field.type === "NUMBER" ? validation.max : undefined}
      placeholder={field.placeholder ?? ""}
      className={inputClasses}
    />
  );
}

export default function EventRegistrationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);

  const [answers, setAnswers] = useState<Answers>({});
  const [teamAnswers, setTeamAnswers] = useState<Answers>({});
  const [teamMembers, setTeamMembers] = useState<TeamMemberDraft[]>([]);

  const [currentStep, setCurrentStep] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [downloadingMemberQrId, setDownloadingMemberQrId] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [downloadError, setDownloadError] = useState("");

  const sortedFields = useMemo(
    () => [...(form?.fields ?? [])].sort((a, b) => a.order - b.order),
    [form],
  );

  const participantFields = useMemo(
    () => sortedFields.filter((field) => field.scope === "PARTICIPANT"),
    [sortedFields],
  );

  const teamFields = useMemo(
    () =>
      sortedFields.filter(
        (field) => field.scope === "TEAM" && field.key !== "team_name",
      ),
    [sortedFields],
  );

  const minAdditionalMembers = useMemo(() => {
    if (!event || event.participationType !== "TEAM") {
      return 0;
    }

    return Math.max((event.minTeamSize ?? 1) - 1, 0);
  }, [event]);

  const maxAdditionalMembers = useMemo(() => {
    if (!event || event.participationType !== "TEAM") {
      return 0;
    }

    const maxTeamSize =
      typeof event.maxTeamSize === "number" && event.maxTeamSize > 0
        ? event.maxTeamSize
        : (event.minTeamSize ?? 1);

    return Math.max(maxTeamSize - 1, 0);
  }, [event]);

  const totalSteps =
    event?.participationType === "TEAM" ? 2 + teamMembers.length : 1;

  const registrationClosed = useMemo(() => {
    if (!event || !form) {
      return true;
    }

    if (event.status !== "PUBLISHED") {
      return true;
    }

    if (form.status !== "PUBLISHED") {
      return true;
    }

    if (event.access === "INVITE_ONLY") {
      return true;
    }

    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline).getTime();

      if (!Number.isNaN(deadline) && deadline <= Date.now()) {
        return true;
      }
    }

    return false;
  }, [event, form]);

  const qrEnabled =
    Boolean(event?.enableQrAttendance) &&
    Boolean(registration?.qrToken) &&
    (registration?.registrationStatus === "REGISTERED" ||
      registration?.registrationStatus === "ATTENDED");

  useEffect(() => {
    setCurrentStep((step) => Math.min(step, Math.max(totalSteps - 1, 0)));
  }, [totalSteps]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let mounted = true;

    async function loadPage() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/events/slug/${slug}`);

        if (!mounted) {
          return;
        }

        const eventData = getData<Event>(response);

        if (!eventData) {
          throw new Error("Event not found");
        }

        setEvent(eventData);

        if (typeof window !== "undefined") {
          try {
            const storageKey = `ieee-gu:event-registration:${eventData.id}`;

            const stored = window.sessionStorage.getItem(storageKey);

            if (stored) {
              const parsed = JSON.parse(stored) as Registration;

              if (
                parsed &&
                parsed.id &&
                parsed.eventId === eventData.id &&
                parsed.name &&
                parsed.email &&
                parsed.registrationStatus
              ) {
                setRegistration(parsed);
              }
            }
          } catch {
            window.sessionStorage.removeItem(
              `ieee-gu:event-registration:${eventData.id}`,
            );
          }
        }
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

        setError(getErrorMessage(requestError, "Unable to load this event."));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!event?.id || registration) {
      return;
    }

    let mounted = true;

    async function loadPublicForm(eventId: string) {
      try {
        setIsFormLoading(true);
        setFormError("");

        const response = await api.get(`/event-forms/public/${eventId}`);

        const publicEvent = getData<
          Event & {
            registrationForm?: EventForm | null;
          }
        >(response);

        const publicForm = publicEvent?.registrationForm;

        if (!publicForm) {
          throw new Error("Registration form is not available");
        }

        const normalizedForm: EventForm = {
          ...publicForm,
          fields: Array.isArray(publicForm.fields)
            ? [...publicForm.fields].sort((a, b) => a.order - b.order)
            : [],
        };

        if (!mounted) {
          return;
        }

        setForm(normalizedForm);

        const initialAnswers: Answers = {};

        for (const field of normalizedForm.fields) {
          if (field.scope === "PARTICIPANT" && field.key === "academic_year") {
            const now = new Date();
            const year = now.getFullYear();
            const start = now.getMonth() >= 6 ? year : year - 1;

            initialAnswers[field.key] = `${start}-${String(
              (start + 1) % 100,
            ).padStart(2, "0")}`;
          }
        }

        setAnswers((current) => ({
          ...initialAnswers,
          ...current,
        }));

        const initialTeamAnswers: Answers = {};

        for (const field of normalizedForm.fields) {
          if (field.scope !== "TEAM") {
            continue;
          }

          if (field.key === "team_name") {
            continue;
          }

          initialTeamAnswers[field.key] = "";
        }

        setTeamAnswers((current) => ({
          ...initialTeamAnswers,
          ...current,
        }));

        if (publicEvent?.participationType === "TEAM") {
          setTeamMembers((current) => {
            const target = Math.min(
              Math.max(current.length, minAdditionalMembers),
              maxAdditionalMembers,
            );

            return Array.from(
              { length: target },
              (_, index) =>
                current[index] ?? {
                  answers: {},
                },
            );
          });
        }
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

        setForm(null);

        setFormError(
          getErrorMessage(
            requestError,
            "Unable to load the registration form.",
          ),
        );
      } finally {
        if (mounted) {
          setIsFormLoading(false);
        }
      }
    }

    void loadPublicForm(event.id);

    return () => {
      mounted = false;
    };
  }, [
    event?.id,
    event?.participationType,
    registration,
    minAdditionalMembers,
    maxAdditionalMembers,
  ]);

  function updateAnswer(key: string, value: AnswerValue) {
    setAnswerValue(setAnswers, key, value);
    setFormError("");
  }

  function updateTeamAnswer(key: string, value: AnswerValue) {
    setAnswerValue(setTeamAnswers, key, value);
    setFormError("");
  }

  function updateMemberAnswer(index: number, key: string, value: AnswerValue) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              answers: {
                ...member.answers,
                [key]: value,
              },
            }
          : member,
      ),
    );
    setFormError("");
  }

  function toggleMemberCheckbox(index: number, key: string, option: string) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) => {
        if (memberIndex !== index) {
          return member;
        }

        const selected = Array.isArray(member.answers[key])
          ? member.answers[key]
          : [];

        return {
          ...member,
          answers: {
            ...member.answers,
            [key]: selected.includes(option)
              ? selected.filter((item) => item !== option)
              : [...selected, option],
          },
        };
      }),
    );
    setFormError("");
  }

  function getMemberValue(member: TeamMemberDraft, field: FormField) {
    return member.answers[field.key];
  }

  function addTeamMember() {
    if (event?.participationType !== "TEAM") {
      return;
    }

    if (teamMembers.length >= maxAdditionalMembers) {
      return;
    }

    setTeamMembers((current) => [
      ...current,
      {
        answers: {},
      },
    ]);

    setFormError("");
  }

  function removeTeamMember(index: number) {
    if (teamMembers.length <= minAdditionalMembers) {
      return;
    }

    setTeamMembers((current) =>
      current.filter((_, memberIndex) => memberIndex !== index),
    );

    setCurrentStep((step) =>
      Math.min(step, Math.max(0, 1 + teamMembers.length - 1)),
    );
  }

  function validateField(field: FormField, value: AnswerValue | undefined) {
    const validation = normalizeValidation(field.validation);

    if (field.required && isEmpty(value)) {
      return `${field.label} is required.`;
    }

    if (isEmpty(value)) {
      return null;
    }

    if (field.type === "EMAIL" && typeof value === "string") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return `${field.label} must be a valid email address.`;
      }
    }

    if (field.type === "PHONE" && typeof value === "string") {
      if (!/^\+?[0-9\s()-]{10,20}$/.test(value.trim())) {
        return `${field.label} must be a valid phone number.`;
      }
    }

    if (
      (field.type === "SHORT_ANSWER" || field.type === "PARAGRAPH") &&
      typeof value !== "string"
    ) {
      return `${field.label} must be text.`;
    }

    if (
      field.type === "NUMBER" &&
      (typeof value !== "number" || !Number.isFinite(value))
    ) {
      return `${field.label} must be a valid number.`;
    }

    if (
      field.type === "DATE" &&
      typeof value === "string" &&
      Number.isNaN(Date.parse(value))
    ) {
      return `${field.label} must be a valid date.`;
    }

    if (
      field.type === "TIME" &&
      (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    ) {
      return `${field.label} must be a valid time.`;
    }

    const options = normalizeOptions(field.options);

    if (field.type === "CHECKBOXES") {
      if (!Array.isArray(value)) {
        return `${field.label} contains invalid selections.`;
      }

      if (value.some((item) => !options.includes(item))) {
        return `${field.label} contains an invalid option.`;
      }
    }

    if (
      (field.type === "MULTIPLE_CHOICE" || field.type === "DROPDOWN") &&
      (typeof value !== "string" ||
        (options.length > 0 && !options.includes(value)))
    ) {
      return `${field.label} contains an invalid option.`;
    }

    if (typeof value === "string") {
      if (
        typeof validation.minLength === "number" &&
        value.length < validation.minLength
      ) {
        return `${field.label} is shorter than the minimum allowed length.`;
      }

      if (
        typeof validation.maxLength === "number" &&
        value.length > validation.maxLength
      ) {
        return `${field.label} exceeds the maximum allowed length.`;
      }

      const pattern = validation.pattern ?? validation.regex;

      if (typeof pattern === "string" && pattern.length > 0) {
        try {
          if (!new RegExp(pattern).test(value)) {
            return `${field.label} has an invalid format.`;
          }
        } catch {
          return `The validation pattern for ${field.label} is invalid.`;
        }
      }
    }

    if (typeof value === "number") {
      if (typeof validation.min === "number" && value < validation.min) {
        return `${field.label} is below the minimum allowed value.`;
      }

      if (typeof validation.max === "number" && value > validation.max) {
        return `${field.label} exceeds the maximum allowed value.`;
      }
    }

    if (Array.isArray(value)) {
      if (
        typeof validation.minSelections === "number" &&
        value.length < validation.minSelections
      ) {
        return `${field.label} requires more selections.`;
      }

      if (
        typeof validation.maxSelections === "number" &&
        value.length > validation.maxSelections
      ) {
        return `${field.label} allows fewer selections.`;
      }
    }

    if (field.type === "FILE_UPLOAD" || field.type === "IMAGE_UPLOAD") {
      return `${field.label} cannot be submitted until file upload storage is enabled.`;
    }

    return null;
  }

  function validateParticipantAnswers(values: Answers) {
    for (const field of participantFields) {
      const message = validateField(field, values[field.key]);

      if (message) {
        return message;
      }
    }

    const nameValue = values.name ?? values.full_name;
    const emailValue = values.email;

    if (typeof nameValue !== "string" || nameValue.trim().length < 2) {
      return "Full name is required.";
    }

    if (
      typeof emailValue !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())
    ) {
      return "Please enter a valid email address.";
    }

    return null;
  }

  function validateTeamDetails() {
    const teamName = teamAnswers.team_name;

    if (
      typeof teamName !== "string" ||
      teamName.trim().length < 2 ||
      teamName.trim().length > 100
    ) {
      return "Team name must contain 2 to 100 characters.";
    }

    for (const field of teamFields) {
      const message = validateField(field, teamAnswers[field.key]);

      if (message) {
        return message;
      }
    }

    return null;
  }

  function validateMember(index: number) {
    const member = teamMembers[index];

    if (!member) {
      return "Team member details are not available.";
    }

    for (const field of participantFields) {
      const message = validateField(field, getMemberValue(member, field));

      if (message) {
        return `Team member ${index + 2}: ${message}`;
      }
    }

    return null;
  }

  function validateCurrentStep() {
    setFormError("");

    if (!event || !form) {
      setFormError("Registration form is not available.");
      return false;
    }

    if (event.participationType === "INDIVIDUAL") {
      const message = validateParticipantAnswers(answers);

      if (message) {
        setFormError(message);
        return false;
      }

      return true;
    }

    if (currentStep === 0) {
      const message = validateParticipantAnswers(answers);

      if (message) {
        setFormError(message);
        return false;
      }

      return true;
    }

    if (currentStep === 1) {
      const message = validateTeamDetails();

      if (message) {
        setFormError(message);
        return false;
      }

      return true;
    }

    const memberIndex = currentStep - 2;
    const message = validateMember(memberIndex);

    if (message) {
      setFormError(message);
      return false;
    }

    return true;
  }

  function validateEntireForm() {
    if (!event || !form) {
      setFormError("Registration form is not available.");
      return false;
    }

    if (registrationClosed) {
      setFormError("Registration is not currently available.");
      return false;
    }

    const participantMessage = validateParticipantAnswers(answers);

    if (participantMessage) {
      setFormError(participantMessage);
      return false;
    }

    if (event.participationType === "INDIVIDUAL") {
      return true;
    }

    if (teamMembers.length < minAdditionalMembers) {
      setFormError(
        `This team requires at least ${
          event.minTeamSize ?? 2
        } members including the team leader.`,
      );
      return false;
    }

    if (teamMembers.length > maxAdditionalMembers) {
      setFormError(
        `This team cannot exceed ${
          event.maxTeamSize ?? "the maximum"
        } members including the team leader.`,
      );
      return false;
    }

    const teamMessage = validateTeamDetails();

    if (teamMessage) {
      setFormError(teamMessage);
      return false;
    }

    const leaderEmail =
      typeof answers.email === "string"
        ? answers.email.trim().toLowerCase()
        : "";

    const memberEmails = teamMembers.map((member) => {
      const field = participantFields.find((item) => item.key === "email");
      const value = field ? member.answers[field.key] : "";
      return typeof value === "string" ? value.trim().toLowerCase() : "";
    });

    const allEmails = [leaderEmail, ...memberEmails];

    if (new Set(allEmails).size !== allEmails.length) {
      setFormError(
        "The same email address cannot be used more than once in a team.",
      );
      return false;
    }

    for (let index = 0; index < teamMembers.length; index += 1) {
      const message = validateMember(index);

      if (message) {
        setFormError(message);
        return false;
      }
    }

    return true;
  }

  function handleNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((step) => step + 1);
      setFormError("");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function handlePreviousStep() {
    if (currentStep === 0) {
      return;
    }

    setCurrentStep((step) => Math.max(step - 1, 0));
    setFormError("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDownloadQr() {
    if (!event || !registration?.qrToken || !qrEnabled) {
      return;
    }

    try {
      setIsDownloadingQr(true);
      setDownloadError("");

      await createQrDownload(
        registration.qrToken,
        event.title,
        registration.name,
        registration.team?.name ?? null,
      );
    } catch {
      setDownloadError(
        "The QR image could not be prepared for download. Please try again.",
      );
    } finally {
      setIsDownloadingQr(false);
    }
  }

  async function handleDownloadTeamMemberQr(member: RegistrationTeamMember) {
    if (!event || !member.qrToken || !qrEnabled) {
      return;
    }

    try {
      setDownloadingMemberQrId(member.id);
      setDownloadError("");

      await createQrDownload(
        member.qrToken,
        event.title,
        member.name,
        registration?.team?.name ?? null,
      );
    } catch {
      setDownloadError(
        `The QR image for ${member.name} could not be prepared for download. Please try again.`,
      );
    } finally {
      setDownloadingMemberQrId(null);
    }
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (!event || registration || isSubmitting) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setFormError("");

    if (!validateEntireForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const nameField = participantFields.find(
        (field) => field.key === "name" || field.key === "full_name",
      );

      const emailField = participantFields.find(
        (field) => field.key === "email",
      );

      const phoneField = participantFields.find(
        (field) => field.key === "phone" || field.key === "mobile_number",
      );

      const participantName =
        typeof answers[nameField?.key ?? "name"] === "string"
          ? String(answers[nameField?.key ?? "name"]).trim()
          : "";

      const participantEmail =
        typeof answers[emailField?.key ?? "email"] === "string"
          ? String(answers[emailField?.key ?? "email"])
              .trim()
              .toLowerCase()
          : "";

      const participantPhone =
        typeof answers[phoneField?.key ?? "phone"] === "string"
          ? String(answers[phoneField?.key ?? "phone"]).replace(/\D/g, "")
          : "";

      const payload: {
        name: string;
        email: string;
        phone?: string;
        teamName?: string;
        answers: Answers;
        teamAnswers: Answers;
        teamMembers: Array<{
          name: string;
          email: string;
          phone?: string;
          answers: Answers;
        }>;
      } = {
        name: participantName,
        email: participantEmail,
        answers: {
          ...answers,
        },
        teamAnswers: {},
        teamMembers: [],
      };

      if (participantPhone) {
        payload.phone = participantPhone;
      }

      if (event.participationType === "TEAM") {
        const teamName =
          typeof teamAnswers.team_name === "string"
            ? teamAnswers.team_name.trim()
            : "";

        payload.teamName = teamName;

        payload.teamAnswers = {
          ...teamAnswers,
          team_name: teamName,
        };

        payload.teamMembers = teamMembers.map((member) => {
          const memberAnswers = {
            ...member.answers,
          };

          const memberName = nameField ? memberAnswers[nameField.key] : "";
          const memberEmail = emailField ? memberAnswers[emailField.key] : "";
          const memberPhone = phoneField ? memberAnswers[phoneField.key] : "";

          const name = typeof memberName === "string" ? memberName.trim() : "";
          const email =
            typeof memberEmail === "string"
              ? memberEmail.trim().toLowerCase()
              : "";

          if (nameField) {
            memberAnswers[nameField.key] = name;
          }

          if (emailField) {
            memberAnswers[emailField.key] = email;
          }

          if (
            phoneField &&
            typeof memberPhone === "string" &&
            memberPhone.trim()
          ) {
            memberAnswers[phoneField.key] = memberPhone.replace(/\D/g, "");
          }

          return {
            name,
            email,
            ...(typeof memberPhone === "string" && memberPhone.trim()
              ? {
                  phone: memberPhone.replace(/\D/g, ""),
                }
              : {}),
            answers: memberAnswers,
          };
        });
      }

      const response = await api.post(`/registrations/${event.id}`, payload);

      const data = getData<Registration>(response);

      if (!data) {
        throw new Error("Registration response was not returned.");
      }

      setRegistration(data);

      setSuccessMessage(
        data.registrationStatus === "WAITLISTED"
          ? "Event is full. You have been added to the waitlist."
          : "Your registration has been completed successfully.",
      );

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            `ieee-gu:event-registration:${event.id}`,
            JSON.stringify(data),
          );
        } catch {}
      }

      if (
        data.registrationStatus === "REGISTERED" &&
        event.enableQrAttendance &&
        data.qrToken
      ) {
        try {
          setIsDownloadingQr(true);
          setDownloadError("");

          await createQrDownload(
            data.qrToken,
            event.title,
            data.name,
            data.team?.name ?? null,
          );

          if (data.teamMembers && data.teamMembers.length > 0) {
            for (const member of data.teamMembers) {
              if (!member.qrToken) {
                continue;
              }

              await createQrDownload(
                member.qrToken,
                event.title,
                member.name,
                data.team?.name ?? null,
              );
            }
          }
        } catch {
          setDownloadError(
            "Registration succeeded, but one or more QR downloads failed. Use the download buttons below.",
          );
        } finally {
          setIsDownloadingQr(false);
        }
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError: unknown) {
      const message = getErrorMessage(
        requestError,
        "Registration failed. Please try again.",
      );

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center animate-in fade-in duration-500">
          <div className="w-full rounded-3xl border border-[var(--border)] bg-white p-8 sm:p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--primary)]" />
            <p className="mt-5 text-base font-semibold text-[var(--secondary)]">
              Loading event registration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center animate-in fade-in duration-500">
          <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-10 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-600" />

            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-red-800">
              Unable to load event
            </h1>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-red-700">{error}</p>

            <Link
              href="/events"
              className="group mx-auto mt-6 sm:mt-8 flex w-fit items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 sm:px-6 sm:py-3.5 text-sm font-bold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const deadline = formatDateTime(event.registrationDeadline);

  if (registration) {
    const isWaitlisted = registration.registrationStatus === "WAITLISTED";
    const isCancelled = registration.registrationStatus === "CANCELLED";

    return (
      <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:py-14 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <Link
            href={`/events/${event.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] transition-colors duration-300 hover:text-[var(--primary)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Event
          </Link>

          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
            <div className="p-6 text-center sm:p-10 lg:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 sm:h-20 sm:w-20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 sm:h-10 sm:w-10" />
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--secondary)] sm:mt-6 sm:text-3xl lg:text-4xl">
                {isWaitlisted
                  ? "You're on the Waitlist"
                  : isCancelled
                    ? "Registration Cancelled"
                    : "Registration Successful"}
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:mt-4 sm:text-base">
                {isWaitlisted
                  ? "The event has reached its capacity. Your registration has been added to the waitlist."
                  : isCancelled
                    ? "This registration has been cancelled."
                    : "You are successfully registered for this event. Please keep your QR code safe for event entry and attendance verification."}
              </p>

              {successMessage && (
                <div className="mx-auto mt-5 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 text-left shadow-sm">
                  <p className="text-sm font-semibold leading-relaxed text-emerald-800">
                    {successMessage}
                  </p>
                </div>
              )}
            </div>

            {event.bannerImage && (
              <div className="relative aspect-video sm:aspect-[21/9] w-full bg-[var(--surface)]">
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-5 sm:p-8 lg:p-12">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex rounded-full bg-[var(--primary)]/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                  {getAccessLabel(event.access)}
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm ${getStatusClasses(
                    registration.registrationStatus,
                  )}`}
                >
                  {getStatusLabel(registration.registrationStatus)}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[var(--secondary)] sm:mt-6 sm:text-2xl lg:text-3xl">
                {event.title}
              </h2>

              <div className="mt-6 grid gap-3 rounded-2xl bg-[var(--surface)]/50 p-4 sm:p-6 sm:gap-4 sm:grid-cols-2 border border-[var(--border)]">
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                  <CalendarDays className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                  {formatDate(event.eventDate)}
                </div>

                {event.startTime && (
                  <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                    <Clock3 className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                    {formatTime(event.startTime)}
                    {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
                    {" IST"}
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                    <MapPin className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                    {event.venue}
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                  <UserRound className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                  {registration.name}
                </div>
              </div>

              {registration.team?.name && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                    Team
                  </p>

                  <p className="mt-1.5 text-base sm:text-lg font-extrabold text-[var(--secondary)]">
                    {registration.team.name}
                  </p>

                  {registration.isTeamLeader && (
                    <p className="mt-1.5 inline-flex rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)]">
                      Team Leader
                    </p>
                  )}
                </div>
              )}

              {registration.teamMembers &&
                registration.teamMembers.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                    <p className="text-base font-bold tracking-tight text-[var(--secondary)]">
                      Team Members
                    </p>

                    <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
                      {registration.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <p className="text-sm font-bold text-[var(--secondary)]">
                            {member.name}
                          </p>

                          <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                            {member.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {qrEnabled && registration.qrToken && (
                <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
                  <div className="rounded-3xl border border-[var(--primary)]/20 bg-gradient-to-b from-[var(--surface)] to-white p-6 shadow-lg shadow-[var(--primary)]/5 sm:p-10">
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                        <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--primary)]" />
                      </div>

                      <h3 className="mt-5 text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--secondary)]">
                        Your Event QR Code
                      </h3>

                      <p className="mx-auto mt-2 sm:mt-3 max-w-lg text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
                        This QR code is unique to your registration. Keep it
                        saved on your phone and show it at the event entrance
                        for verification and attendance.
                      </p>
                    </div>

                    <div className="mx-auto mt-6 w-fit rounded-3xl bg-white p-4 sm:p-6 shadow-xl ring-1 ring-black/5">
                      <img
                        src={getQrImageUrl(registration.qrToken)}
                        alt={`QR code for ${registration.name}`}
                        className="h-48 w-48 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
                      />
                    </div>

                    <div className="mt-6 sm:mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                      <p className="text-sm font-bold text-amber-800">
                        Important: Download your QR code
                      </p>

                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-amber-700">
                        Download and keep this QR code safe. It will be scanned
                        at the event for entry and attendance verification.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDownloadQr()}
                      disabled={isDownloadingQr}
                      className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 sm:px-6 sm:py-4 text-sm font-bold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDownloadingQr ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Downloading QR...
                        </>
                      ) : (
                        <>
                          <Download className="h-4.5 w-4.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                          Download QR Code
                        </>
                      )}
                    </button>
                  </div>

                  {registration.team &&
                    registration.teamMembers &&
                    registration.teamMembers.length > 0 && (
                      <div className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--surface)]/50 p-5 sm:p-8">
                        <div>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                              <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)]" />
                            </div>

                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-[var(--secondary)]">
                                Team Member QR Codes
                              </h3>

                              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                                Each team member has a separate QR code for
                                individual entry and attendance verification.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                          {registration.teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6 shadow-sm"
                            >
                              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm sm:text-base font-bold text-[var(--secondary)]">
                                    {member.name}
                                  </p>

                                  <p className="mt-1 break-all text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">
                                    {member.email}
                                  </p>

                                  <p className="mt-2 inline-flex rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-[var(--primary)]">
                                    Team Member
                                  </p>
                                </div>

                                {member.qrToken ? (
                                  <div className="flex shrink-0 flex-col items-center gap-3 sm:gap-4">
                                    <div className="rounded-2xl bg-white p-2 sm:p-3 shadow-md ring-1 ring-black/5">
                                      <img
                                        src={getQrImageUrl(member.qrToken)}
                                        alt={`QR code for ${member.name}`}
                                        className="h-28 w-28 sm:h-32 sm:w-32 lg:h-40 lg:w-40"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDownloadTeamMemberQr(member)
                                      }
                                      disabled={
                                        isDownloadingQr ||
                                        downloadingMemberQrId === member.id
                                      }
                                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold !text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                      {downloadingMemberQrId === member.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Downloading...
                                        </>
                                      ) : (
                                        <>
                                          <Download className="h-4 w-4" />
                                          Download QR
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-amber-800">
                                    QR code is not currently available.
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {downloadError && (
                    <p className="text-center text-xs sm:text-sm font-medium text-red-600">
                      {downloadError}
                    </p>
                  )}
                </div>
              )}

              {event.enableQrAttendance &&
                !qrEnabled &&
                !isWaitlisted &&
                !isCancelled && (
                  <div className="mt-6 sm:mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 shadow-sm">
                    <p className="text-sm font-semibold leading-relaxed text-amber-800">
                      QR attendance is enabled for this event, but a QR code is
                      not currently available for this registration.
                    </p>
                  </div>
                )}

              {!event.enableQrAttendance && !isWaitlisted && !isCancelled && (
                <div className="mt-6 sm:mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm">
                  <p className="text-sm sm:text-base font-bold text-[var(--secondary)]">
                    QR attendance is not enabled for this event.
                  </p>

                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Your registration is confirmed.
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row border-t border-[var(--border)] pt-6 sm:pt-8">
                <Link
                  href={`/events/${event.slug}`}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3.5 sm:px-6 sm:py-4 text-sm font-bold text-[var(--secondary)] shadow-sm transition-all hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Event
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.sessionStorage.removeItem(
                        `ieee-gu:event-registration:${event.id}`,
                      );
                    }

                    setRegistration(null);
                    setSuccessMessage("");
                    setDownloadError("");
                    setError("");
                    setFormError("");
                    setAnswers({});
                    setTeamAnswers({});
                    setTeamMembers([]);
                    setCurrentStep(0);
                  }}
                  className="flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-3.5 sm:px-6 sm:py-4 text-sm font-bold text-[var(--secondary)] shadow-sm transition-all hover:bg-slate-50"
                >
                  Register Another
                </button>

                <Link
                  href="/events"
                  className="flex flex-1 items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3.5 sm:px-6 sm:py-4 text-sm font-bold !text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20"
                >
                  Browse Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isInviteOnly = event.access === "INVITE_ONLY";

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:py-14 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
        <Link
          href={`/events/${event.slug}`}
          className="group inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] transition-colors duration-300 hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Event
        </Link>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
          {event.bannerImage && (
            <div className="relative aspect-video sm:aspect-[21/9] w-full bg-[var(--surface)]">
              <img
                src={event.bannerImage}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-5 sm:p-8 lg:p-12">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex rounded-full bg-[var(--primary)]/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                {getAccessLabel(event.access)}
              </span>

              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--secondary)] shadow-sm">
                {event.participationType === "TEAM"
                  ? `Team Event${
                      event.minTeamSize || event.maxTeamSize
                        ? ` · ${event.minTeamSize ?? 1}–${
                            event.maxTeamSize ?? event.minTeamSize ?? 1
                          } members`
                        : ""
                    }`
                  : "Individual Event"}
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--secondary)] sm:mt-6 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              Register for {event.title}
            </h1>

            {event.shortDescription && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:mt-4 sm:text-base sm:leading-relaxed">
                {event.shortDescription}
              </p>
            )}

            <div className="mt-6 grid gap-3 rounded-2xl bg-[var(--surface)]/50 p-4 sm:p-6 sm:gap-4 sm:grid-cols-2 border border-[var(--border)]">
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                <CalendarDays className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                {formatDate(event.eventDate)}
              </div>

              {event.startTime && (
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                  <Clock3 className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                  {formatTime(event.startTime)}
                  {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
                  {" IST"}
                </div>
              )}

              {event.venue && (
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                  <MapPin className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                  {event.venue}
                </div>
              )}

              {deadline && (
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--secondary)]">
                  <Clock3 className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                  Deadline: {deadline} IST
                </div>
              )}
            </div>
          </div>
        </div>

        {isInviteOnly ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-amber-800">
              Invitation Required
            </h2>

            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed text-amber-700">
              This event is available only to invited participants.
            </p>
          </div>
        ) : isFormLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-[var(--border)] bg-white p-8 sm:p-12 text-center shadow-sm">
            <div>
              <Loader2 className="mx-auto h-8 w-8 sm:h-10 sm:w-10 animate-spin text-[var(--primary)]" />
              <p className="mt-4 sm:mt-5 text-sm sm:text-base font-semibold text-[var(--secondary)]">
                Loading registration form...
              </p>
            </div>
          </div>
        ) : formError && !form ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-red-800">
              Registration form unavailable
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed text-red-700">{formError}</p>
          </div>
        ) : registrationClosed ? (
          <div className="rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--secondary)]">
              Registration is closed
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
              {form?.status !== "PUBLISHED"
                ? "The registration form is not currently open."
                : "Registration is not currently available for this event."}
            </p>
          </div>
        ) : form ? (
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-10 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                Public Registration
              </p>

              <h2 className="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-3xl">
                {form.title}
              </h2>

              <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
                Complete the registration form. No account is required.
              </p>
            </div>

            {(error || formError) && (
              <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 shadow-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-red-600" />
                <p className="text-xs sm:text-sm font-semibold leading-relaxed text-red-800">
                  {error || formError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                      Step {currentStep + 1} of {totalSteps}
                    </p>

                    <p className="mt-1.5 sm:mt-2 text-sm sm:text-base font-extrabold tracking-tight text-[var(--secondary)] sm:text-lg">
                      {event.participationType === "TEAM"
                        ? currentStep === 0
                          ? "Team Leader Details"
                          : currentStep === 1
                            ? "Team Details"
                            : `Team Member ${currentStep - 1} Details`
                        : "Participant Details"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
                    {Array.from(
                      {
                        length: totalSteps,
                      },
                      (_, index) => (
                        <span
                          key={index}
                          className={`h-1.5 sm:h-2 shrink-0 rounded-full transition-all duration-300 ${
                            index <= currentStep
                              ? "w-6 sm:w-8 bg-[var(--primary)]"
                              : "w-2.5 sm:w-3 bg-[var(--border)]"
                          }`}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>

              {currentStep === 0 && (
                <section className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border-b border-[var(--border)] pb-5 sm:pb-6">
                    <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--secondary)]">
                      {event.participationType === "TEAM"
                        ? "Team Leader Details"
                        : "Participant Details"}
                    </h3>

                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                      Complete every field configured in the registration form.
                    </p>
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    {participantFields.map((field) => (
                      <div key={field.id} className="space-y-2.5 sm:space-y-3">
                        <label
                          htmlFor={`field-${field.id}`}
                          className="block text-sm font-bold text-[var(--secondary)]"
                        >
                          {field.label}
                          {field.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </label>

                        {field.description && (
                          <p className="text-[11px] sm:text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                            {field.description}
                          </p>
                        )}

                        <RegistrationField
                          field={field}
                          value={answers[field.key]}
                          onChange={updateAnswer}
                          onToggleCheckbox={(key, option) =>
                            toggleAnswerCheckbox(setAnswers, key, option)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {event.participationType === "TEAM" && currentStep === 1 && (
                <section className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border-b border-[var(--border)] pb-5 sm:pb-6">
                    <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--secondary)]">
                      Team Details
                    </h3>

                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                      Enter the team information and add all required team
                      members.
                    </p>
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    <div className="space-y-2.5 sm:space-y-3">
                      <label
                        htmlFor="team-name"
                        className="block text-sm font-bold text-[var(--secondary)]"
                      >
                        Team Name <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="team-name"
                        value={
                          typeof teamAnswers.team_name === "string"
                            ? teamAnswers.team_name
                            : ""
                        }
                        onChange={(event) =>
                          updateTeamAnswer("team_name", event.target.value)
                        }
                        minLength={2}
                        maxLength={100}
                        required
                        placeholder="Enter your team name"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 sm:py-3.5 text-sm text-[var(--secondary)] shadow-sm outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                      />
                    </div>

                    {teamFields.map((field) => (
                      <div key={field.id} className="space-y-2.5 sm:space-y-3">
                        <label
                          htmlFor={`team-field-${field.id}`}
                          className="block text-sm font-bold text-[var(--secondary)]"
                        >
                          {field.label}
                          {field.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </label>

                        {field.description && (
                          <p className="text-[11px] sm:text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                            {field.description}
                          </p>
                        )}

                        <RegistrationField
                          field={field}
                          value={teamAnswers[field.key]}
                          onChange={updateTeamAnswer}
                          onToggleCheckbox={(key, option) =>
                            toggleAnswerCheckbox(setTeamAnswers, key, option)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm sm:text-base font-bold text-[var(--secondary)]">
                          Team Members
                        </p>

                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                          {teamMembers.length + 1} of{" "}
                          {event.maxTeamSize ?? teamMembers.length + 1} team
                          members added.
                        </p>

                        <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-[var(--primary)]">
                          {teamMembers.length < minAdditionalMembers
                            ? `${
                                minAdditionalMembers - teamMembers.length
                              } more member${
                                minAdditionalMembers - teamMembers.length === 1
                                  ? ""
                                  : "s"
                              } required.`
                            : teamMembers.length < maxAdditionalMembers
                              ? `You can add ${
                                  maxAdditionalMembers - teamMembers.length
                                } more member${
                                  maxAdditionalMembers - teamMembers.length ===
                                  1
                                    ? ""
                                    : "s"
                                }.`
                              : "Maximum team size reached."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addTeamMember}
                        disabled={
                          isSubmitting ||
                          isFormLoading ||
                          teamMembers.length >= maxAdditionalMembers
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Member
                      </button>
                    </div>

                    {teamMembers.length > 0 && (
                      <div className="mt-5 sm:mt-6 space-y-3 border-t border-[var(--border)]/60 pt-5 sm:pt-6">
                        {teamMembers.map((_, index) => (
                          <div
                            key={`member-summary-${index}`}
                            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--border)] bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-sm"
                          >
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-[var(--secondary)]">
                                Member {index + 2}
                              </p>

                              <p className="mt-1 text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)]">
                                Complete their details in the next steps.
                              </p>
                            </div>

                            {teamMembers.length > minAdditionalMembers && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                disabled={isSubmitting}
                                className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 w-fit"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {event.participationType === "TEAM" &&
                currentStep >= 2 &&
                teamMembers[currentStep - 2] && (
                  <section className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="border-b border-[var(--border)] pb-5 sm:pb-6">
                      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                        Team Member {currentStep - 1}
                      </p>

                      <h3 className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-extrabold tracking-tight text-[var(--secondary)]">
                        Complete Member {currentStep - 1} Details
                      </h3>

                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                        Complete every field configured in the registration form
                        for this participant.
                      </p>
                    </div>

                    <div className="space-y-5 sm:space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-5 sm:p-8 shadow-sm">
                      {participantFields.map((field) => {
                        const memberIndex = currentStep - 2;
                        const member = teamMembers[memberIndex];

                        return (
                          <div key={field.id} className="space-y-2.5 sm:space-y-3">
                            <label
                              htmlFor={`member-${memberIndex}-${field.id}`}
                              className="block text-sm font-bold text-[var(--secondary)]"
                            >
                              {field.label}

                              {field.required && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </label>

                            {field.description && (
                              <p className="text-[11px] sm:text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                                {field.description}
                              </p>
                            )}

                            <RegistrationField
                              field={field}
                              value={member.answers[field.key]}
                              onChange={(key, value) =>
                                updateMemberAnswer(memberIndex, key, value)
                              }
                              onToggleCheckbox={(key, option) =>
                                toggleMemberCheckbox(memberIndex, key, option)
                              }
                              idPrefix={`member-${memberIndex}`}
                              inputName={`member-${memberIndex}-${field.key}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

              {form.description && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50 p-5 sm:p-6 shadow-sm">
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {form.description}
                  </p>
                </div>
              )}

              <div className="border-t border-[var(--border)] pt-6 sm:pt-8">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      disabled={isSubmitting}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold text-[var(--secondary)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                      Back
                    </button>
                  )}

                  {currentStep < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        isSubmitting || isFormLoading || registrationClosed
                      }
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting || isFormLoading || registrationClosed
                      }
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-600 px-5 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold !text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                          Confirm Registration
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-5 sm:mt-6 text-center text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)]">
                  {currentStep < totalSteps - 1
                    ? "Complete this step to continue."
                    : "By confirming, you submit the information provided in this registration form."}
                </p>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
