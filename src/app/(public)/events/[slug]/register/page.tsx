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

type EventAccess =
  | "PUBLIC"
  | "UNIVERSITY"
  | "MEMBERS_ONLY"
  | "INVITE_ONLY";

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

  if (
    value.data &&
    typeof value.data === "object" &&
    "data" in value.data
  ) {
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

  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

function normalizeOptions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string",
  );
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

  return "border-blue-200 bg-blue-50 text-blue-700";
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
      image.onerror = () =>
        reject(new Error("Unable to prepare QR image"));
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
    context.font =
      '700 42px Inter, Arial, "Helvetica Neue", sans-serif';

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
    context.font =
      '600 22px Inter, Arial, "Helvetica Neue", sans-serif';

    currentY += 18;

    context.fillText(
      "EVENT ENTRY QR CODE",
      canvas.width / 2,
      currentY,
    );

    const qrSize = 620;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = currentY + 45;

    context.fillStyle = "#ffffff";
    context.shadowColor = "rgba(15, 23, 42, 0.12)";
    context.shadowBlur = 24;
    context.shadowOffsetY = 8;

    context.fillRect(
      qrX - 25,
      qrY - 25,
      qrSize + 50,
      qrSize + 50,
    );

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    context.drawImage(image, qrX, qrY, qrSize, qrSize);

    let detailsY = qrY + qrSize + 75;

    context.fillStyle = "#0f172a";
    context.font =
      '700 26px Inter, Arial, "Helvetica Neue", sans-serif';

    context.fillText(
      participantName,
      canvas.width / 2,
      detailsY,
    );

    if (teamName) {
      detailsY += 40;

      context.fillStyle = "#475569";
      context.font =
        '600 22px Inter, Arial, "Helvetica Neue", sans-serif';

      context.fillText(
        `Team: ${teamName}`,
        canvas.width / 2,
        detailsY,
      );
    }

    detailsY += 50;

    context.fillStyle = "#94a3b8";
    context.font =
      '500 18px Inter, Arial, "Helvetica Neue", sans-serif';

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

    window.setTimeout(
      () => URL.revokeObjectURL(downloadUrl),
      1000,
    );
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
    const selected = Array.isArray(current[key])
      ? current[key]
      : [];

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
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 disabled:bg-gray-50 disabled:text-gray-500";

  const selected = Array.isArray(value) ? value : [];

  if (
    field.type === "FILE_UPLOAD" ||
    field.type === "IMAGE_UPLOAD"
  ) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-800">
          {field.label}
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-700">
          File uploads are configured for this form, but this
          registration endpoint does not provide file storage.
        </p>
      </div>
    );
  }

  if (field.type === "PARAGRAPH") {
    return (
      <textarea
        id={inputId}
        value={typeof value === "string" ? value : ""}
        onChange={(event) =>
          onChange(field.key, event.target.value)
        }
        disabled={disabled}
        placeholder={field.placeholder ?? ""}
        required={field.required}
        minLength={validation.minLength}
        maxLength={validation.maxLength}
        rows={5}
        className={`${inputClasses} resize-y`}
      />
    );
  }

  if (field.type === "MULTIPLE_CHOICE") {
    return (
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
              value === option
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] bg-white hover:bg-[var(--surface)]"
            }`}
          >
            <input
              type="radio"
              name={radioName}
              value={option}
              checked={value === option}
              disabled={disabled}
              onChange={() =>
                onChange(field.key, option)
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-[var(--text)]">
              {option}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "CHECKBOXES") {
    return (
      <div className="space-y-2">
        {options.map((option) => {
          const checked = selected.includes(option);

          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                checked
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] bg-white hover:bg-[var(--surface)]"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() =>
                  onToggleCheckbox(field.key, option)
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-[var(--text)]">
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
        onChange={(event) =>
          onChange(field.key, event.target.value)
        }
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
        typeof value === "string" ||
        typeof value === "number"
          ? String(value)
          : ""
      }
      onChange={(event) => {
        const raw = event.target.value;

        const nextValue: AnswerValue =
          field.type === "NUMBER" && raw !== ""
            ? Number(raw)
            : raw;

        onChange(field.key, nextValue);
      }}
      disabled={disabled}
      required={field.required}
      minLength={validation.minLength}
      maxLength={validation.maxLength}
      min={
        field.type === "NUMBER"
          ? validation.min
          : undefined
      }
      max={
        field.type === "NUMBER"
          ? validation.max
          : undefined
      }
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
  const [registration, setRegistration] =
    useState<Registration | null>(null);

  const [answers, setAnswers] = useState<Answers>({});
  const [teamAnswers, setTeamAnswers] = useState<Answers>({});
  const [teamMembers, setTeamMembers] = useState<
    TeamMemberDraft[]
  >([]);

  const [currentStep, setCurrentStep] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isDownloadingQr, setIsDownloadingQr] =
    useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");
  const [downloadError, setDownloadError] =
    useState("");

  const sortedFields = useMemo(
    () =>
      [...(form?.fields ?? [])].sort(
        (a, b) => a.order - b.order,
      ),
    [form],
  );

  const participantFields = useMemo(
    () =>
      sortedFields.filter(
        (field) => field.scope === "PARTICIPANT",
      ),
    [sortedFields],
  );

  const teamFields = useMemo(
    () =>
      sortedFields.filter(
        (field) =>
          field.scope === "TEAM" &&
          field.key !== "team_name",
      ),
    [sortedFields],
  );

  const minAdditionalMembers = useMemo(() => {
    if (
      !event ||
      event.participationType !== "TEAM"
    ) {
      return 0;
    }

    return Math.max(
      (event.minTeamSize ?? 1) - 1,
      0,
    );
  }, [event]);

  const maxAdditionalMembers = useMemo(() => {
    if (
      !event ||
      event.participationType !== "TEAM"
    ) {
      return 0;
    }

    const maxTeamSize =
      typeof event.maxTeamSize === "number" &&
      event.maxTeamSize > 0
        ? event.maxTeamSize
        : event.minTeamSize ?? 1;

    return Math.max(maxTeamSize - 1, 0);
  }, [event]);

  const totalSteps =
    event?.participationType === "TEAM"
      ? 2 + teamMembers.length
      : 1;

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
      const deadline = new Date(
        event.registrationDeadline,
      ).getTime();

      if (
        !Number.isNaN(deadline) &&
        deadline <= Date.now()
      ) {
        return true;
      }
    }

    return false;
  }, [event, form]);

  const qrEnabled =
    Boolean(event?.enableQrAttendance) &&
    Boolean(registration?.qrToken) &&
    (registration?.registrationStatus ===
      "REGISTERED" ||
      registration?.registrationStatus ===
        "ATTENDED");

  useEffect(() => {
    setCurrentStep((step) =>
      Math.min(
        step,
        Math.max(totalSteps - 1, 0),
      ),
    );
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

        const response = await api.get(
          `/events/slug/${slug}`,
        );

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
            const storageKey =
              `ieee-gu:event-registration:${eventData.id}`;

            const stored =
              window.sessionStorage.getItem(
                storageKey,
              );

            if (stored) {
              const parsed =
                JSON.parse(stored) as Registration;

              if (
                parsed &&
                parsed.id &&
                parsed.eventId ===
                  eventData.id &&
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

        setError(
          getErrorMessage(
            requestError,
            "Unable to load this event.",
          ),
        );
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

    async function loadPublicForm(
      eventId: string,
    ) {
      try {
        setIsFormLoading(true);
        setFormError("");

        const response = await api.get(
          `/event-forms/public/${eventId}`,
        );

        const publicEvent = getData<
          Event & {
            registrationForm?: EventForm | null;
          }
        >(response);

        const publicForm =
          publicEvent?.registrationForm;

        if (!publicForm) {
          throw new Error(
            "Registration form is not available",
          );
        }

        const normalizedForm: EventForm = {
          ...publicForm,
          fields: Array.isArray(publicForm.fields)
            ? [...publicForm.fields].sort(
                (a, b) => a.order - b.order,
              )
            : [],
        };

        if (!mounted) {
          return;
        }

        setForm(normalizedForm);

        const initialAnswers: Answers = {};

        for (const field of normalizedForm.fields) {
          if (
            field.scope === "PARTICIPANT" &&
            field.key === "academic_year"
          ) {
            const now = new Date();
            const year = now.getFullYear();
            const start =
              now.getMonth() >= 6
                ? year
                : year - 1;

            initialAnswers[field.key] =
              `${start}-${String(
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

        if (
          publicEvent?.participationType ===
          "TEAM"
        ) {
          setTeamMembers((current) => {
            const target = Math.min(
              Math.max(
                current.length,
                minAdditionalMembers,
              ),
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

  function updateAnswer(
    key: string,
    value: AnswerValue,
  ) {
    setAnswerValue(
      setAnswers,
      key,
      value,
    );

    setFormError("");
  }

  function updateTeamAnswer(
    key: string,
    value: AnswerValue,
  ) {
    setAnswerValue(
      setTeamAnswers,
      key,
      value,
    );

    setFormError("");
  }

  function updateMemberAnswer(
    index: number,
    key: string,
    value: AnswerValue,
  ) {
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

  function toggleMemberCheckbox(
    index: number,
    key: string,
    option: string,
  ) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) => {
        if (memberIndex !== index) {
          return member;
        }

        const selected = Array.isArray(
          member.answers[key],
        )
          ? member.answers[key]
          : [];

        return {
          ...member,
          answers: {
            ...member.answers,
            [key]: selected.includes(option)
              ? selected.filter(
                  (item) => item !== option,
                )
              : [...selected, option],
          },
        };
      }),
    );

    setFormError("");
  }

  function getMemberValue(
    member: TeamMemberDraft,
    field: FormField,
  ) {
    return member.answers[field.key];
  }

  function addTeamMember() {
    if (
      event?.participationType !== "TEAM"
    ) {
      return;
    }

    if (
      teamMembers.length >=
      maxAdditionalMembers
    ) {
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
    if (
      teamMembers.length <=
      minAdditionalMembers
    ) {
      return;
    }

    setTeamMembers((current) =>
      current.filter(
        (_, memberIndex) =>
          memberIndex !== index,
      ),
    );

    setCurrentStep((step) =>
      Math.min(
        step,
        Math.max(
          0,
          1 + teamMembers.length - 1,
        ),
      ),
    );
  }

  function validateField(
    field: FormField,
    value: AnswerValue | undefined,
  ) {
    const validation = normalizeValidation(
      field.validation,
    );

    if (
      field.required &&
      isEmpty(value)
    ) {
      return `${field.label} is required.`;
    }

    if (isEmpty(value)) {
      return null;
    }

    if (
      field.type === "EMAIL" &&
      typeof value === "string"
    ) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          value.trim(),
        )
      ) {
        return `${field.label} must be a valid email address.`;
      }
    }

    if (
      field.type === "PHONE" &&
      typeof value === "string"
    ) {
      if (
        !/^\+?[0-9\s()-]{10,20}$/.test(
          value.trim(),
        )
      ) {
        return `${field.label} must be a valid phone number.`;
      }
    }

    if (
      (
        field.type === "SHORT_ANSWER" ||
        field.type === "PARAGRAPH"
      ) &&
      typeof value !== "string"
    ) {
      return `${field.label} must be text.`;
    }

    if (
      field.type === "NUMBER" &&
      (
        typeof value !== "number" ||
        !Number.isFinite(value)
      )
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
      (
        typeof value !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(
          value,
        )
      )
    ) {
      return `${field.label} must be a valid time.`;
    }

    const options = normalizeOptions(
      field.options,
    );

    if (field.type === "CHECKBOXES") {
      if (!Array.isArray(value)) {
        return `${field.label} contains invalid selections.`;
      }

      if (
        value.some(
          (item) => !options.includes(item),
        )
      ) {
        return `${field.label} contains an invalid option.`;
      }
    }

    if (
      (
        field.type === "MULTIPLE_CHOICE" ||
        field.type === "DROPDOWN"
      ) &&
      (
        typeof value !== "string" ||
        (
          options.length > 0 &&
          !options.includes(value)
        )
      )
    ) {
      return `${field.label} contains an invalid option.`;
    }

    if (typeof value === "string") {
      if (
        typeof validation.minLength ===
          "number" &&
        value.length <
          validation.minLength
      ) {
        return `${field.label} is shorter than the minimum allowed length.`;
      }

      if (
        typeof validation.maxLength ===
          "number" &&
        value.length >
          validation.maxLength
      ) {
        return `${field.label} exceeds the maximum allowed length.`;
      }

      const pattern =
        validation.pattern ??
        validation.regex;

      if (
        typeof pattern === "string" &&
        pattern.length > 0
      ) {
        try {
          if (
            !new RegExp(pattern).test(
              value,
            )
          ) {
            return `${field.label} has an invalid format.`;
          }
        } catch {
          return `The validation pattern for ${field.label} is invalid.`;
        }
      }
    }

    if (typeof value === "number") {
      if (
        typeof validation.min ===
          "number" &&
        value < validation.min
      ) {
        return `${field.label} is below the minimum allowed value.`;
      }

      if (
        typeof validation.max ===
          "number" &&
        value > validation.max
      ) {
        return `${field.label} exceeds the maximum allowed value.`;
      }
    }

    if (Array.isArray(value)) {
      if (
        typeof validation.minSelections ===
          "number" &&
        value.length <
          validation.minSelections
      ) {
        return `${field.label} requires more selections.`;
      }

      if (
        typeof validation.maxSelections ===
          "number" &&
        value.length >
          validation.maxSelections
      ) {
        return `${field.label} allows fewer selections.`;
      }
    }

    if (
      field.type === "FILE_UPLOAD" ||
      field.type === "IMAGE_UPLOAD"
    ) {
      return `${field.label} cannot be submitted until file upload storage is enabled.`;
    }

    return null;
  }

  function validateParticipantAnswers(
    values: Answers,
  ) {
    for (const field of participantFields) {
      const message = validateField(
        field,
        values[field.key],
      );

      if (message) {
        return message;
      }
    }

    const nameValue =
      values.name ??
      values.full_name;

    const emailValue =
      values.email;

    if (
      typeof nameValue !== "string" ||
      nameValue.trim().length < 2
    ) {
      return "Full name is required.";
    }

    if (
      typeof emailValue !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailValue.trim(),
      )
    ) {
      return "Please enter a valid email address.";
    }

    return null;
  }

  function validateTeamDetails() {
    const teamName =
      teamAnswers.team_name;

    if (
      typeof teamName !== "string" ||
      teamName.trim().length < 2 ||
      teamName.trim().length > 100
    ) {
      return "Team name must contain 2 to 100 characters.";
    }

    for (const field of teamFields) {
      const message = validateField(
        field,
        teamAnswers[field.key],
      );

      if (message) {
        return message;
      }
    }

    return null;
  }

  function validateMember(
    index: number,
  ) {
    const member =
      teamMembers[index];

    if (!member) {
      return "Team member details are not available.";
    }

    for (const field of participantFields) {
      const message = validateField(
        field,
        getMemberValue(member, field),
      );

      if (message) {
        return `Team member ${
          index + 2
        }: ${message}`;
      }
    }

    return null;
  }

  function validateCurrentStep() {
    setFormError("");

    if (!event || !form) {
      setFormError(
        "Registration form is not available.",
      );
      return false;
    }

    if (
      event.participationType ===
      "INDIVIDUAL"
    ) {
      const message =
        validateParticipantAnswers(
          answers,
        );

      if (message) {
        setFormError(message);
        return false;
      }

      return true;
    }

    if (currentStep === 0) {
      const message =
        validateParticipantAnswers(
          answers,
        );

      if (message) {
        setFormError(message);
        return false;
      }

      return true;
    }

    if (currentStep === 1) {
      const message =
        validateTeamDetails();

      if (message) {
        setFormError(message);
        return false;
      }

      return true;
    }

    const memberIndex =
      currentStep - 2;

    const message =
      validateMember(memberIndex);

    if (message) {
      setFormError(message);
      return false;
    }

    return true;
  }

  function validateEntireForm() {
    if (!event || !form) {
      setFormError(
        "Registration form is not available.",
      );
      return false;
    }

    if (registrationClosed) {
      setFormError(
        "Registration is not currently available.",
      );
      return false;
    }

    const participantMessage =
      validateParticipantAnswers(
        answers,
      );

    if (participantMessage) {
      setFormError(participantMessage);
      return false;
    }

    if (
      event.participationType ===
      "INDIVIDUAL"
    ) {
      return true;
    }

    if (
      teamMembers.length <
      minAdditionalMembers
    ) {
      setFormError(
        `This team requires at least ${
          event.minTeamSize ?? 2
        } members including the team leader.`,
      );
      return false;
    }

    if (
      teamMembers.length >
      maxAdditionalMembers
    ) {
      setFormError(
        `This team cannot exceed ${
          event.maxTeamSize ?? "the maximum"
        } members including the team leader.`,
      );
      return false;
    }

    const teamMessage =
      validateTeamDetails();

    if (teamMessage) {
      setFormError(teamMessage);
      return false;
    }

    const leaderEmail =
      typeof answers.email === "string"
        ? answers.email
            .trim()
            .toLowerCase()
        : "";

    const memberEmails =
      teamMembers.map((member) => {
        const field =
          participantFields.find(
            (item) => item.key === "email",
          );

        const value = field
          ? member.answers[field.key]
          : "";

        return typeof value === "string"
          ? value.trim().toLowerCase()
          : "";
      });

    const allEmails = [
      leaderEmail,
      ...memberEmails,
    ];

    if (
      new Set(allEmails).size !==
      allEmails.length
    ) {
      setFormError(
        "The same email address cannot be used more than once in a team.",
      );
      return false;
    }

    for (
      let index = 0;
      index < teamMembers.length;
      index += 1
    ) {
      const message =
        validateMember(index);

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

    if (
      currentStep <
      totalSteps - 1
    ) {
      setCurrentStep(
        (step) => step + 1,
      );

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

    setCurrentStep(
      (step) =>
        Math.max(step - 1, 0),
    );

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDownloadQr() {
    if (
      !event ||
      !registration?.qrToken ||
      !qrEnabled
    ) {
      return;
    }

    try {
      setIsDownloadingQr(true);
      setDownloadError("");

      await createQrDownload(
        registration.qrToken,
        event.title,
        registration.name,
        registration.team?.name ??
          null,
      );
    } catch {
      setDownloadError(
        "The QR image could not be prepared for download. Please try again.",
      );
    } finally {
      setIsDownloadingQr(false);
    }
  }

  async function handleSubmit(
    formEvent: FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault();

    if (
      !event ||
      registration ||
      isSubmitting
    ) {
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

      const nameField =
        participantFields.find(
          (field) =>
            field.key === "name" ||
            field.key === "full_name",
        );

      const emailField =
        participantFields.find(
          (field) =>
            field.key === "email",
        );

      const phoneField =
        participantFields.find(
          (field) =>
            field.key === "phone" ||
            field.key === "mobile_number",
        );

      const participantName =
        typeof answers[
          nameField?.key ?? "name"
        ] === "string"
          ? String(
              answers[
                nameField?.key ?? "name"
              ],
            ).trim()
          : "";

      const participantEmail =
        typeof answers[
          emailField?.key ?? "email"
        ] === "string"
          ? String(
              answers[
                emailField?.key ?? "email"
              ],
            )
              .trim()
              .toLowerCase()
          : "";

      const participantPhone =
        typeof answers[
          phoneField?.key ?? "phone"
        ] === "string"
          ? String(
              answers[
                phoneField?.key ?? "phone"
              ],
            ).replace(/\D/g, "")
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
        payload.phone =
          participantPhone;
      }

      if (
        event.participationType ===
        "TEAM"
      ) {
        const teamName =
          typeof teamAnswers.team_name ===
          "string"
            ? teamAnswers.team_name.trim()
            : "";

        payload.teamName =
          teamName;

        payload.teamAnswers = {
          ...teamAnswers,
          team_name: teamName,
        };

        payload.teamMembers =
          teamMembers.map(
            (member) => {
              const memberAnswers = {
                ...member.answers,
              };

              const memberName =
                nameField
                  ? memberAnswers[
                      nameField.key
                    ]
                  : "";

              const memberEmail =
                emailField
                  ? memberAnswers[
                      emailField.key
                    ]
                  : "";

              const memberPhone =
                phoneField
                  ? memberAnswers[
                      phoneField.key
                    ]
                  : "";

              const name =
                typeof memberName ===
                "string"
                  ? memberName.trim()
                  : "";

              const email =
                typeof memberEmail ===
                "string"
                  ? memberEmail
                      .trim()
                      .toLowerCase()
                  : "";

              if (nameField) {
                memberAnswers[
                  nameField.key
                ] = name;
              }

              if (emailField) {
                memberAnswers[
                  emailField.key
                ] = email;
              }

              if (
                phoneField &&
                typeof memberPhone ===
                  "string" &&
                memberPhone.trim()
              ) {
                memberAnswers[
                  phoneField.key
                ] = memberPhone.replace(
                  /\D/g,
                  "",
                );
              }

              return {
                name,
                email,
                ...(typeof memberPhone ===
                  "string" &&
                memberPhone.trim()
                  ? {
                      phone:
                        memberPhone.replace(
                          /\D/g,
                          "",
                        ),
                    }
                  : {}),
                answers:
                  memberAnswers,
              };
            },
          );
      }

      const response = await api.post(
        `/registrations/${event.id}`,
        payload,
      );

      const data =
        getData<Registration>(
          response,
        );

      if (!data) {
        throw new Error(
          "Registration response was not returned.",
        );
      }

      setRegistration(data);

      setSuccessMessage(
        data.registrationStatus ===
          "WAITLISTED"
          ? "Event is full. You have been added to the waitlist."
          : "Your registration has been completed successfully.",
      );

      if (
        typeof window !==
        "undefined"
      ) {
        try {
          window.sessionStorage.setItem(
            `ieee-gu:event-registration:${event.id}`,
            JSON.stringify(data),
          );
        } catch {}
      }

      if (
        data.registrationStatus ===
          "REGISTERED" &&
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
            data.team?.name ??
              null,
          );
        } catch {
          setDownloadError(
            "Registration succeeded, but the automatic QR download failed. Use the Download QR Code button below.",
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
      const message =
        getErrorMessage(
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
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)]" />

            <p className="mt-3 text-sm text-[var(--muted)]">
              Loading event registration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />

            <h1 className="mt-4 text-xl font-bold text-red-800">
              Unable to load event
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white"
            >
              <ArrowLeft className="h-4 w-4" />
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

  const deadline = formatDateTime(
    event.registrationDeadline,
  );

  if (registration) {
    const isWaitlisted =
      registration.registrationStatus ===
      "WAITLISTED";

    const isCancelled =
      registration.registrationStatus ===
      "CANCELLED";

    return (
      <div className="min-h-screen px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
            <div className="p-6 text-center sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              <h1 className="mt-5 text-2xl font-bold text-[var(--text)] sm:text-3xl">
                {isWaitlisted
                  ? "You're on the Waitlist"
                  : isCancelled
                    ? "Registration Cancelled"
                    : "Registration Successful"}
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                {isWaitlisted
                  ? "The event has reached its capacity. Your registration has been added to the waitlist."
                  : isCancelled
                    ? "This registration has been cancelled."
                    : "You are successfully registered for this event. Please keep your QR code safe for event entry and attendance verification."}
              </p>

              {successMessage && (
                <div className="mx-auto mt-5 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
                  <p className="text-sm font-medium leading-6 text-emerald-700">
                    {successMessage}
                  </p>
                </div>
              )}
            </div>

            {event.bannerImage && (
              <div className="relative h-44 bg-[var(--surface)] sm:h-56">
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                  {getAccessLabel(
                    event.access,
                  )}
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    registration.registrationStatus,
                  )}`}
                >
                  {getStatusLabel(
                    registration.registrationStatus,
                  )}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold text-[var(--text)] sm:text-2xl">
                {event.title}
              </h2>

              <div className="mt-5 grid gap-3 rounded-xl bg-[var(--surface)] p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
                  {formatDate(
                    event.eventDate,
                  )}
                </div>

                {event.startTime && (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                    {formatTime(
                      event.startTime,
                    )}
                    {event.endTime
                      ? ` - ${formatTime(
                          event.endTime,
                        )}`
                      : ""}
                    {" IST"}
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <MapPin className="h-4 w-4 text-[var(--primary)]" />
                    {event.venue}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <UserRound className="h-4 w-4 text-[var(--primary)]" />
                  {registration.name}
                </div>
              </div>

              {registration.team?.name && (
                <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Team
                  </p>

                  <p className="mt-1 text-base font-bold text-[var(--text)]">
                    {registration.team.name}
                  </p>

                  {registration.isTeamLeader && (
                    <p className="mt-1 text-xs font-medium text-[var(--primary)]">
                      Team Leader
                    </p>
                  )}
                </div>
              )}

              {registration.teamMembers &&
                registration.teamMembers.length >
                  0 && (
                  <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      Team Members
                    </p>

                    <div className="mt-3 space-y-2">
                      {registration.teamMembers.map(
                        (member) => (
                          <div
                            key={member.id}
                            className="rounded-lg border border-[var(--border)] bg-white p-3"
                          >
                            <p className="text-sm font-semibold text-[var(--text)]">
                              {member.name}
                            </p>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {member.email}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {qrEnabled &&
                registration.qrToken && (
                  <div className="mt-7 rounded-2xl border border-[var(--primary)]/15 bg-[var(--surface)] p-5 sm:p-7">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)]">
                        <QrCode className="h-6 w-6 text-[var(--primary)]" />
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-[var(--text)]">
                        Your Event QR Code
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                        Important: download and keep this
                        QR code safe. It will be scanned
                        at the event for entry and
                        attendance verification.
                      </p>
                    </div>

                    <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                      <img
                        src={getQrImageUrl(
                          registration.qrToken,
                        )}
                        alt={`QR code for ${event.title}`}
                        className="h-64 w-64 sm:h-72 sm:w-72"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDownloadQr()
                      }
                      disabled={
                        isDownloadingQr
                      }
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDownloadingQr ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Downloading QR...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download QR Code
                        </>
                      )}
                    </button>

                    {downloadError && (
                      <p className="mt-3 text-center text-xs font-medium text-red-600">
                        {downloadError}
                      </p>
                    )}
                  </div>
                )}

              {event.enableQrAttendance &&
                !qrEnabled &&
                !isWaitlisted &&
                !isCancelled && (
                  <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">
                      QR attendance is enabled for this
                      event, but a QR code is not currently
                      available for this registration.
                    </p>
                  </div>
                )}

              {!event.enableQrAttendance &&
                !isWaitlisted &&
                !isCancelled && (
                  <div className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      QR attendance is not enabled for
                      this event.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Your registration is confirmed.
                    </p>
                  </div>
                )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/events/${event.slug}`}
                  className="flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Event
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      typeof window !==
                      "undefined"
                    ) {
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
                  className="flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                >
                  Register Another Participant
                </button>

                <Link
                  href="/events"
                  className="flex flex-1 items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white hover:opacity-90"
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

  const isInviteOnly =
    event.access === "INVITE_ONLY";

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          {event.bannerImage && (
            <div className="relative h-44 bg-[var(--surface)] sm:h-56">
              <img
                src={event.bannerImage}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                {getAccessLabel(event.access)}
              </span>

              <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                {event.participationType ===
                "TEAM"
                  ? `Team Event${
                      event.minTeamSize ||
                      event.maxTeamSize
                        ? ` · ${
                            event.minTeamSize ??
                            1
                          }–${
                            event.maxTeamSize ??
                            event.minTeamSize ??
                            1
                          } members`
                        : ""
                    }`
                  : "Individual Event"}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[var(--text)] sm:text-3xl">
              Register for {event.title}
            </h1>

            {event.shortDescription && (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {event.shortDescription}
              </p>
            )}

            <div className="mt-5 grid gap-3 rounded-xl bg-[var(--surface)] p-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
                {formatDate(
                  event.eventDate,
                )}
              </div>

              {event.startTime && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                  {formatTime(
                    event.startTime,
                  )}
                  {event.endTime
                    ? ` - ${formatTime(
                        event.endTime,
                      )}`
                    : ""}
                  {" IST"}
                </div>
              )}

              {event.venue && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <MapPin className="h-4 w-4 text-[var(--primary)]" />
                  {event.venue}
                </div>
              )}

              {deadline && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                  Deadline: {deadline} IST
                </div>
              )}
            </div>
          </div>
        </div>

        {isInviteOnly ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-800">
              Invitation Required
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-700">
              This event is available only to invited
              participants.
            </p>
          </div>
        ) : isFormLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)]" />

              <p className="mt-3 text-sm text-[var(--muted)]">
                Loading registration form...
              </p>
            </div>
          </div>
        ) : formError && !form ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-800">
              Registration form unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {formError}
            </p>
          </div>
        ) : registrationClosed ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-bold text-[var(--text)]">
              Registration is closed
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {form?.status !==
              "PUBLISHED"
                ? "The registration form is not currently open."
                : "Registration is not currently available for this event."}
            </p>
          </div>
        ) : form ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                Public Registration
              </p>

              <h2 className="mt-1 text-xl font-bold text-[var(--text)]">
                {form.title}
              </h2>

              <p className="mt-1.5 text-sm text-[var(--muted)]">
                Complete the registration form. No account
                is required.
              </p>
            </div>

            {(error || formError) && (
              <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm font-medium leading-6 text-red-700">
                  {error || formError}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-7"
            >
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                      Step {currentStep + 1} of{" "}
                      {totalSteps}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                      {event.participationType ===
                      "TEAM"
                        ? currentStep === 0
                          ? "Team Leader Details"
                          : currentStep === 1
                            ? "Team Details"
                            : `Team Member ${
                                currentStep - 1
                              } Details`
                        : "Participant Details"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {Array.from(
                      {
                        length: totalSteps,
                      },
                      (_, index) => (
                        <span
                          key={index}
                          className={`h-1.5 shrink-0 rounded-full transition-all ${
                            index <=
                            currentStep
                              ? "w-7 bg-[var(--primary)]"
                              : "w-3 bg-[var(--border)]"
                          }`}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>

              {currentStep === 0 && (
                <section className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text)]">
                      {event.participationType ===
                      "TEAM"
                        ? "Team Leader Details"
                        : "Participant Details"}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Complete every field configured in
                      the registration form.
                    </p>
                  </div>

                  {participantFields.map(
                    (field) => (
                      <div
                        key={field.id}
                        className="space-y-2"
                      >
                        <label
                          htmlFor={`field-${field.id}`}
                          className="block text-sm font-semibold text-[var(--text)]"
                        >
                          {field.label}

                          {field.required && (
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          )}
                        </label>

                        {field.description && (
                          <p className="text-xs leading-5 text-[var(--muted)]">
                            {field.description}
                          </p>
                        )}

                        <RegistrationField
                          field={field}
                          value={
                            answers[field.key]
                          }
                          onChange={
                            updateAnswer
                          }
                          onToggleCheckbox={(
                            key,
                            option,
                          ) =>
                            toggleAnswerCheckbox(
                              setAnswers,
                              key,
                              option,
                            )
                          }
                        />
                      </div>
                    ),
                  )}
                </section>
              )}

              {event.participationType ===
                "TEAM" &&
                currentStep === 1 && (
                  <section className="space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)]">
                        Team Details
                      </h3>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Enter the team information and add
                        all required team members.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="team-name"
                        className="mb-2 block text-sm font-semibold text-[var(--text)]"
                      >
                        Team Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="team-name"
                        value={
                          typeof teamAnswers.team_name ===
                          "string"
                            ? teamAnswers.team_name
                            : ""
                        }
                        onChange={(event) =>
                          updateTeamAnswer(
                            "team_name",
                            event.target.value,
                          )
                        }
                        minLength={2}
                        maxLength={100}
                        required
                        placeholder="Enter your team name"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                      />
                    </div>

                    {teamFields.map(
                      (field) => (
                        <div
                          key={field.id}
                          className="space-y-2"
                        >
                          <label
                            htmlFor={`team-field-${field.id}`}
                            className="block text-sm font-semibold text-[var(--text)]"
                          >
                            {field.label}

                            {field.required && (
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            )}
                          </label>

                          {field.description && (
                            <p className="text-xs leading-5 text-[var(--muted)]">
                              {field.description}
                            </p>
                          )}

                          <RegistrationField
                            field={field}
                            value={
                              teamAnswers[
                                field.key
                              ]
                            }
                            onChange={
                              updateTeamAnswer
                            }
                            onToggleCheckbox={(
                              key,
                              option,
                            ) =>
                              toggleAnswerCheckbox(
                                setTeamAnswers,
                                key,
                                option,
                              )
                            }
                          />
                        </div>
                      ),
                    )}

                    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">
                            Team Members
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            {teamMembers.length + 1} of{" "}
                            {event.maxTeamSize ??
                              teamMembers.length +
                                1}{" "}
                            team members added.
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            {teamMembers.length <
                            minAdditionalMembers
                              ? `${
                                  minAdditionalMembers -
                                  teamMembers.length
                                } more member${
                                  minAdditionalMembers -
                                    teamMembers.length ===
                                  1
                                    ? ""
                                    : "s"
                                } required.`
                              : teamMembers.length <
                                maxAdditionalMembers
                                ? `You can add ${
                                    maxAdditionalMembers -
                                    teamMembers.length
                                  } more member${
                                    maxAdditionalMembers -
                                      teamMembers.length ===
                                    1
                                      ? ""
                                      : "s"
                                  }.`
                                : "Maximum team size reached."}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={
                            addTeamMember
                          }
                          disabled={
                            isSubmitting ||
                            isFormLoading ||
                            teamMembers.length >=
                              maxAdditionalMembers
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          Add Member
                        </button>
                      </div>
                    </div>

                    {teamMembers.length >
                      0 && (
                      <div className="space-y-2">
                        {teamMembers.map(
                          (_, index) => (
                            <div
                              key={`member-summary-${index}`}
                              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-[var(--text)]">
                                  Member{" "}
                                  {index + 2}
                                </p>

                                <p className="mt-0.5 text-xs text-[var(--muted)]">
                                  Complete their
                                  details in the
                                  next steps.
                                </p>
                              </div>

                              {teamMembers.length >
                                minAdditionalMembers && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeTeamMember(
                                      index,
                                    )
                                  }
                                  disabled={
                                    isSubmitting
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </button>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </section>
                )}

              {event.participationType ===
                "TEAM" &&
                currentStep >= 2 &&
                teamMembers[
                  currentStep - 2
                ] && (
                  <section className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                        Team Member{" "}
                        {currentStep - 1}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-[var(--text)]">
                        Complete Member{" "}
                        {currentStep - 1} Details
                      </h3>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Complete every field configured
                        in the registration form for this
                        participant.
                      </p>
                    </div>

                    <div className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                      {participantFields.map(
                        (field) => {
                          const memberIndex =
                            currentStep - 2;

                          const member =
                            teamMembers[
                              memberIndex
                            ];

                          return (
                            <div
                              key={field.id}
                              className="space-y-2"
                            >
                              <label
                                htmlFor={`member-${memberIndex}-${field.id}`}
                                className="block text-sm font-semibold text-[var(--text)]"
                              >
                                {field.label}

                                {field.required && (
                                  <span className="ml-1 text-red-500">
                                    *
                                  </span>
                                )}
                              </label>

                              {field.description && (
                                <p className="text-xs leading-5 text-[var(--muted)]">
                                  {field.description}
                                </p>
                              )}

                              <RegistrationField
                                field={field}
                                value={
                                  member.answers[
                                    field.key
                                  ]
                                }
                                onChange={(
                                  key,
                                  value,
                                ) =>
                                  updateMemberAnswer(
                                    memberIndex,
                                    key,
                                    value,
                                  )
                                }
                                onToggleCheckbox={(
                                  key,
                                  option,
                                ) =>
                                  toggleMemberCheckbox(
                                    memberIndex,
                                    key,
                                    option,
                                  )
                                }
                                idPrefix={`member-${memberIndex}`}
                                inputName={`member-${memberIndex}-${field.key}`}
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </section>
                )}

              {form.description && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {form.description}
                  </p>
                </div>
              )}

              <div className="border-t border-[var(--border)] pt-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={
                        handlePreviousStep
                      }
                      disabled={
                        isSubmitting
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}

                  {currentStep <
                  totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={
                        handleNextStep
                      }
                      disabled={
                        isSubmitting ||
                        isFormLoading ||
                        registrationClosed
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        isFormLoading ||
                        registrationClosed
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Confirm Registration
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  {currentStep <
                  totalSteps - 1
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