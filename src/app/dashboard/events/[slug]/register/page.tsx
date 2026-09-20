"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Plus,
  QrCode,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api, getCurrentUser } from "@/lib/api";

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
  registrationTemplate: string | null;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  enableQrAttendance: boolean;
}

interface MemberProfile {
  membershipStatus: string;
  department: string | null;
  course: string | null;
  year: string | null;
  rollNumber: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  ieeeMembershipNumber?: string | null;
  memberProfile?: MemberProfile | null;
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
  team?: { id: string; name: string } | null;
  event?: { id: string; title: string; enableQrAttendance: boolean };
}

interface TeamMemberDraft {
  answers: Answers;
}

function getData<T>(response: unknown): T | undefined {
  if (!response || typeof response !== "object") return undefined;
  const value = response as { data?: unknown };
  if (value.data && typeof value.data === "object" && "data" in value.data) {
    return (value.data as { data?: T }).data;
  }
  return value.data as T | undefined;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeValidation(value: unknown): FormValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
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
  if (!value) return "Date not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not specified";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
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
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getAccessLabel(access: EventAccess) {
  if (access === "MEMBERS_ONLY") return "Members Only";
  if (access === "UNIVERSITY") return "University";
  if (access === "INVITE_ONLY") return "Invite Only";
  return "Public";
}

function getStatusLabel(status: RegistrationStatus) {
  if (status === "WAITLISTED") return "Waitlisted";
  if (status === "ATTENDED") return "Attended";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "ABSENT") return "Absent";
  return "Registered";
}

function getStatusClasses(status: RegistrationStatus) {
  if (status === "WAITLISTED")
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "ATTENDED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "CANCELLED") return "border-red-200 bg-red-50 text-red-700";
  if (status === "ABSENT") return "border-gray-200 bg-gray-50 text-gray-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function formatAnswer(value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === undefined || value === "") return "—";
  return String(value);
}

function getQrImageUrl(token: string) {
  return `https://quickchart.io/qr?size=360&margin=2&text=${encodeURIComponent(token)}`;
}

function currentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const start = now.getMonth() >= 6 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

function getInitialValue(field: FormField, source?: User) {
  const profile = source?.memberProfile;
  switch (field.key) {
    case "name":
    case "full_name":
      return `${source?.firstName ?? ""} ${source?.lastName ?? ""}`.trim();
    case "email":
      return source?.email ?? "";
    case "phone":
    case "mobile_number":
      return source?.phone ?? "";
    case "ieee_membership_number":
      return source?.ieeeMembershipNumber ?? "";
    case "department":
      return profile?.department ?? "";
    case "course":
      return profile?.course ?? "";
    case "year":
      return profile?.year ?? "";
    case "roll_number":
      return profile?.rollNumber ?? "";
    case "academic_year":
      return currentAcademicYear();
    default:
      return "";
  }
}

function setAnswerValue(
  setter: Dispatch<SetStateAction<Answers>>,
  key: string,
  value: AnswerValue,
) {
  setter((current) => ({ ...current, [key]: value }));
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
}: {
  field: FormField;
  value: AnswerValue | undefined;
  onChange: (key: string, value: AnswerValue) => void;
  onToggleCheckbox: (key: string, option: string) => void;
  disabled?: boolean;
}) {
  const options = normalizeOptions(field.options);
  const validation = normalizeValidation(field.validation);
  const inputId = `field-${field.id}`;
  const inputClasses =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 disabled:bg-gray-50 disabled:text-gray-500";
  const selected = Array.isArray(value) ? value : [];

  const commonProps = {
    id: inputId,
    disabled,
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-[var(--text)]"
      >
        {field.label}
        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {field.description ? (
        <p className="mb-2.5 text-xs leading-5 text-[var(--muted)]">
          {field.description}
        </p>
      ) : null}

      {field.type === "PARAGRAPH" ? (
        <textarea
          {...commonProps}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder ?? ""}
          rows={5}
          minLength={validation.minLength}
          maxLength={validation.maxLength}
          className={`${inputClasses} resize-y`}
        />
      ) : null}

      {field.type === "MULTIPLE_CHOICE" ? (
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${value === option ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-white hover:bg-[var(--surface)]"}`}
            >
              <input
                type="radio"
                name={`${field.id}`}
                value={option}
                checked={value === option}
                disabled={disabled}
                onChange={() => onChange(field.key, option)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text)]">{option}</span>
            </label>
          ))}
        </div>
      ) : null}

      {field.type === "CHECKBOXES" ? (
        <div className="space-y-2">
          {options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${checked ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] bg-white hover:bg-[var(--surface)]"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggleCheckbox(field.key, option)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text)]">{option}</span>
              </label>
            );
          })}
        </div>
      ) : null}

      {field.type === "DROPDOWN" ? (
        <select
          {...commonProps}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputClasses}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "FILE_UPLOAD" || field.type === "IMAGE_UPLOAD" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            {field.type === "IMAGE_UPLOAD" ? "Image upload" : "File upload"}
          </p>
          <p className="mt-1 text-xs leading-5">
            This field is configured on the form, but the current registration
            API does not expose a file-storage endpoint. The form cannot safely
            submit this value yet.
          </p>
        </div>
      ) : null}

      {![
        "PARAGRAPH",
        "MULTIPLE_CHOICE",
        "CHECKBOXES",
        "DROPDOWN",
        "FILE_UPLOAD",
        "IMAGE_UPLOAD",
      ].includes(field.type) ? (
        <input
          {...commonProps}
          type={
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
                      : "text"
          }
          value={
            typeof value === "string" || typeof value === "number"
              ? String(value)
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value;
            onChange(
              field.key,
              field.type === "NUMBER" && raw !== "" ? Number(raw) : raw,
            );
          }}
          min={field.type === "NUMBER" ? validation.min : undefined}
          max={field.type === "NUMBER" ? validation.max : undefined}
          minLength={validation.minLength}
          maxLength={validation.maxLength}
          placeholder={field.placeholder ?? ""}
          className={inputClasses}
        />
      ) : null}
    </div>
  );
}

export default function StudentEventRegistrationPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [event, setEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<EventForm | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);

  const [leaderAnswers, setLeaderAnswers] = useState<Answers>({});
  const [teamAnswers, setTeamAnswers] = useState<Answers>({});
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberDraft[]>([]);
  const [step, setStep] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    if (!event || event.participationType !== "TEAM") return 0;
    return Math.max((event.minTeamSize ?? 1) - 1, 0);
  }, [event]);

  const maxAdditionalMembers = useMemo(() => {
    if (!event || event.participationType !== "TEAM") return 0;
    return Math.max((event.maxTeamSize ?? 1) - 1, 0);
  }, [event]);

  const steps = useMemo(() => {
    if (!event || event.participationType !== "TEAM") {
      return [
        {
          key: "participant",
          title: "Your Details",
          subtitle: "Complete the registration form",
        },
        {
          key: "review",
          title: "Review & Submit",
          subtitle: "Check your information",
        },
      ];
    }
    return [
      {
        key: "team",
        title: "Team Details",
        subtitle: "Team name and team information",
      },
      { key: "leader", title: "Team Leader", subtitle: "Your details" },
      ...teamMembers.map((_, index) => ({
        key: `member-${index}`,
        title: `Member ${index + 1}`,
        subtitle: "Participant details",
      })),
      {
        key: "review",
        title: "Review & Submit",
        subtitle: "Check the complete team",
      },
    ];
  }, [event, teamMembers.length]);

  const registrationClosed = useMemo(() => {
    if (!event || !form) return false;
    if (event.status !== "PUBLISHED") return true;
    if (form.status !== "PUBLISHED") return true;
    if (event.access === "INVITE_ONLY") return true;
    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline).getTime();
      if (!Number.isNaN(deadline) && deadline <= Date.now()) return true;
    }
    return false;
  }, [event, form]);

  function applyInitialAnswers(fields: FormField[], source?: User) {
    const initial: Answers = {};
    for (const field of fields) {
      if (field.scope !== "PARTICIPANT") continue;
      const value = getInitialValue(field, source);
      if (value !== "") initial[field.key] = value;
    }
    return initial;
  }

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    async function loadPage() {
      try {
        setIsLoading(true);
        setError("");
        const [eventResponse, currentUserResponse, registrationsResponse] =
          await Promise.all([
            api.get(`/events/slug/${slug}`),
            getCurrentUser(),
            api.get("/registrations/me"),
          ]);

        if (!mounted) return;
        const eventData = getData<Event>(eventResponse);
        const userData =
          getData<User>(currentUserResponse) ?? currentUserResponse;
        const registrationsData = getData<Registration[]>(
          registrationsResponse,
        );

        if (!eventData) throw new Error("Event not found");
        if (!userData) throw new Error("Unable to load your account");

        setEvent(eventData);
        setUser(userData);

        if (Array.isArray(registrationsData)) {

          const existing = registrationsData.find(
            (item) =>
              String(item.eventId).trim() === String(eventData.id).trim() ||
              String(item.event?.id).trim() === String(eventData.id).trim(),
          );


          if (existing) {
            setRegistration(existing);
          }
        }
      } catch (requestError: unknown) {
        if (!mounted) return;
        const status =
          typeof requestError === "object" &&
          requestError !== null &&
          "response" in requestError
            ? (requestError as { response?: { status?: number } }).response
                ?.status
            : undefined;
        if (status === 401) {
          router.replace(`/login?redirect=/dashboard/events/${slug}/register`);
          return;
        }
        setError(
          getErrorMessage(requestError, "Unable to load registration details."),
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadPage();
    return () => {
      mounted = false;
    };
  }, [router, slug]);

  useEffect(() => {
    if (!event?.id || registration) return;
    let mounted = true;

    const participationType = event.participationType;

    async function loadForm(eventId: string) {
      try {
        setIsFormLoading(true);
        setFormError("");
        const response = await api.get(`/event-forms/public/${eventId}`);
        const publicEvent = getData<
          Event & { registrationForm?: EventForm | null }
        >(response);
        const publicForm = publicEvent?.registrationForm;
        if (!publicForm) throw new Error("Registration form is not available");

        const normalizedForm: EventForm = {
          ...publicForm,
          fields: Array.isArray(publicForm.fields)
            ? [...publicForm.fields].sort((a, b) => a.order - b.order)
            : [],
        };

        if (!mounted) return;
        setForm(normalizedForm);
        setLeaderAnswers((current) => ({
          ...applyInitialAnswers(normalizedForm.fields, user ?? undefined),
          ...current,
        }));

        const target =
          participationType === "TEAM" ? minAdditionalMembers : 0;
        setTeamMembers((current) =>
          Array.from(
            { length: target },
            (_, index) => current[index] ?? { answers: {} },
          ),
        );
      } catch (requestError: unknown) {
        if (!mounted) return;
        setForm(null);
        setFormError(
          getErrorMessage(
            requestError,
            "Unable to load the registration form.",
          ),
        );
      } finally {
        if (mounted) setIsFormLoading(false);
      }
    }

    void loadForm(event.id);
    return () => {
      mounted = false;
    };
  }, [
    event?.id,
    event?.participationType,
    minAdditionalMembers,
    registration,
    user?.id,
  ]);

  function setLeaderAnswer(key: string, value: AnswerValue) {
    setAnswerValue(setLeaderAnswers, key, value);
    setFormError("");
  }

  function setTeamAnswer(key: string, value: AnswerValue) {
    setAnswerValue(setTeamAnswers, key, value);
    setFormError("");
  }

  function setMemberAnswer(index: number, key: string, value: AnswerValue) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? { ...member, answers: { ...member.answers, [key]: value } }
          : member,
      ),
    );
    setFormError("");
  }

  function toggleMemberCheckbox(index: number, key: string, option: string) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) => {
        if (memberIndex !== index) return member;
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
  }

  function addTeamMember() {
    if (teamMembers.length >= maxAdditionalMembers) return;
    setTeamMembers((current) => [...current, { answers: {} }]);
  }

  function removeTeamMember(index: number) {
    if (teamMembers.length <= minAdditionalMembers) return;
    setTeamMembers((current) =>
      current.filter((_, memberIndex) => memberIndex !== index),
    );
    if (step > 0)
      setStep((current) => Math.min(current, Math.max(0, steps.length - 2)));
  }

  function validateField(field: FormField, value: AnswerValue | undefined) {
    const validation = normalizeValidation(field.validation);
    if (field.required && isEmpty(value)) return `${field.label} is required.`;
    if (isEmpty(value)) return null;

    if (
      field.type === "EMAIL" &&
      typeof value === "string" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    )
      return `${field.label} must be a valid email address.`;
    if (
      field.type === "PHONE" &&
      typeof value === "string" &&
      !/^\+?[0-9\s()-]{10,20}$/.test(value.trim())
    )
      return `${field.label} must be a valid phone number.`;
    if (
      (field.type === "SHORT_ANSWER" || field.type === "PARAGRAPH") &&
      typeof value !== "string"
    )
      return `${field.label} must be text.`;
    if (
      field.type === "NUMBER" &&
      (typeof value !== "number" || !Number.isFinite(value))
    )
      return `${field.label} must be a valid number.`;
    if (
      field.type === "DATE" &&
      typeof value === "string" &&
      Number.isNaN(Date.parse(value))
    )
      return `${field.label} must be a valid date.`;
    if (
      field.type === "TIME" &&
      typeof value === "string" &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    )
      return `${field.label} must be a valid time.`;

    const options = normalizeOptions(field.options);
    if (field.type === "CHECKBOXES") {
      if (!Array.isArray(value))
        return `${field.label} contains invalid selections.`;
      if (value.some((item) => !options.includes(item)))
        return `${field.label} contains an invalid option.`;
    }
    if (
      (field.type === "MULTIPLE_CHOICE" || field.type === "DROPDOWN") &&
      (typeof value !== "string" ||
        (options.length > 0 && !options.includes(value)))
    )
      return `${field.label} contains an invalid option.`;

    if (typeof value === "string") {
      if (
        typeof validation.minLength === "number" &&
        value.length < validation.minLength
      )
        return `${field.label} is shorter than the minimum allowed length.`;
      if (
        typeof validation.maxLength === "number" &&
        value.length > validation.maxLength
      )
        return `${field.label} exceeds the maximum allowed length.`;
      const pattern = validation.pattern ?? validation.regex;
      if (pattern) {
        try {
          if (!new RegExp(pattern).test(value))
            return `${field.label} has an invalid format.`;
        } catch {
          return `The validation pattern for ${field.label} is invalid.`;
        }
      }
    }

    if (typeof value === "number") {
      if (typeof validation.min === "number" && value < validation.min)
        return `${field.label} is below the minimum allowed value.`;
      if (typeof validation.max === "number" && value > validation.max)
        return `${field.label} exceeds the maximum allowed value.`;
    }

    if (Array.isArray(value)) {
      if (
        typeof validation.minSelections === "number" &&
        value.length < validation.minSelections
      )
        return `${field.label} requires more selections.`;
      if (
        typeof validation.maxSelections === "number" &&
        value.length > validation.maxSelections
      )
        return `${field.label} allows fewer selections.`;
    }

    if (field.type === "FILE_UPLOAD" || field.type === "IMAGE_UPLOAD")
      return `${field.label} cannot be submitted until file upload storage is enabled.`;
    return null;
  }

  function validateParticipantAnswers(
    answers: Answers,
    fields = participantFields,
  ) {
    for (const field of fields) {
      const message = validateField(field, answers[field.key]);
      if (message) return message;
    }
    return null;
  }

  function syncRequiredBasicAnswers(answers: Answers) {
    const next = { ...answers };
    const nameField = participantFields.find((field) =>
      ["name", "full_name"].includes(field.key),
    );
    const emailField = participantFields.find((field) => field.key === "email");
    const phoneField = participantFields.find((field) =>
      ["phone", "mobile_number"].includes(field.key),
    );
    if (nameField && isEmpty(next[nameField.key])) next[nameField.key] = "";
    if (emailField && isEmpty(next[emailField.key])) next[emailField.key] = "";
    if (phoneField && next[phoneField.key] === undefined)
      next[phoneField.key] = "";
    return next;
  }

  function validateCurrentStep() {
    setFormError("");
    if (!event || !form) return false;

    if (step === 0 && event.participationType === "TEAM") {
      if (teamName.trim().length < 2 || teamName.trim().length > 100) {
        setFormError("Team name must contain 2 to 100 characters.");
        return false;
      }
      for (const field of teamFields) {
        const message = validateField(field, teamAnswers[field.key]);
        if (message) {
          setFormError(message);
          return false;
        }
      }
      return true;
    }

    const leaderStepIndex = event.participationType === "TEAM" ? 1 : 0;
    if (step === leaderStepIndex) {
      const next = syncRequiredBasicAnswers(leaderAnswers);
      setLeaderAnswers(next);
      const leaderName = String(
        next[
          participantFields.find((field) =>
            ["name", "full_name"].includes(field.key),
          )?.key ?? "name"
        ] ?? "",
      ).trim();
      const leaderEmail = String(
        next[
          participantFields.find((field) => field.key === "email")?.key ??
            "email"
        ] ?? "",
      ).trim();
      if (leaderName.length < 2 || leaderName.length > 100) {
        setFormError("Team Leader name must contain 2 to 100 characters.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leaderEmail)) {
        setFormError("Team Leader email must be a valid email address.");
        return false;
      }
      const message = validateParticipantAnswers(next);
      if (message) {
        setFormError(message);
        return false;
      }
      return true;
    }

    if (
      event.participationType === "TEAM" &&
      step > 1 &&
      step < steps.length - 1
    ) {
      const memberIndex = step - 2;
      const member = teamMembers[memberIndex];
      if (!member) return false;
      const next = { ...member.answers };
      const nameField = participantFields.find((field) =>
        ["name", "full_name"].includes(field.key),
      );
      const emailField = participantFields.find(
        (field) => field.key === "email",
      );
      const phoneField = participantFields.find((field) =>
        ["phone", "mobile_number"].includes(field.key),
      );
      if (nameField && next[nameField.key] === undefined)
        next[nameField.key] = "";
      if (emailField && next[emailField.key] === undefined)
        next[emailField.key] = "";
      if (phoneField && next[phoneField.key] === undefined)
        next[phoneField.key] = "";
      setTeamMembers((current) =>
        current.map((item, index) =>
          index === memberIndex ? { ...item, answers: next } : item,
        ),
      );
      const memberName = String(next[nameField?.key ?? "name"] ?? "").trim();
      const memberEmail = String(next[emailField?.key ?? "email"] ?? "").trim();
      if (memberName.length < 2 || memberName.length > 100) {
        setFormError(
          `Member ${memberIndex + 1}: name must contain 2 to 100 characters.`,
        );
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
        setFormError(
          `Member ${memberIndex + 1}: email must be a valid email address.`,
        );
        return false;
      }
      const message = validateParticipantAnswers(next);
      if (message) {
        setFormError(`Member ${memberIndex + 1}: ${message}`);
        return false;
      }
      const emails = teamMembers
        .map((item, index) =>
          index === memberIndex
            ? String(next[emailField?.key ?? "email"] ?? "")
                .trim()
                .toLowerCase()
            : String(item.answers[emailField?.key ?? "email"] ?? "")
                .trim()
                .toLowerCase(),
        )
        .filter(Boolean);
      const leaderEmail = String(
        leaderAnswers[emailField?.key ?? "email"] ?? "",
      )
        .trim()
        .toLowerCase();
      if (emails.includes(leaderEmail)) {
        setFormError(
          "A team member cannot use the team leader's email address.",
        );
        return false;
      }
      if (new Set(emails).size !== emails.length) {
        setFormError(
          "The same email address cannot be used more than once in a team.",
        );
        return false;
      }
      return true;
    }

    return true;
  }

  function validateBeforeSubmit() {
    if (!event || !form) return false;
    if (registrationClosed) {
      setFormError("Registration is not currently open for this event.");
      return false;
    }

    if (event.participationType === "TEAM") {
      if (teamMembers.length < minAdditionalMembers) {
        setFormError(
          `This team requires at least ${event.minTeamSize ?? 2} members including the team leader.`,
        );
        return false;
      }
      if (teamMembers.length > maxAdditionalMembers) {
        setFormError(
          `This team cannot exceed ${event.maxTeamSize ?? "the maximum"} members.`,
        );
        return false;
      }
      if (!validateCurrentStep()) return false;
      const leaderMessage = validateParticipantAnswers(leaderAnswers);
      if (leaderMessage) {
        setFormError(`Team Leader: ${leaderMessage}`);
        return false;
      }
      for (let index = 0; index < teamMembers.length; index += 1) {
        const message = validateParticipantAnswers(teamMembers[index].answers);
        if (message) {
          setFormError(`Member ${index + 1}: ${message}`);
          return false;
        }
      }
      const emailField = participantFields.find(
        (field) => field.key === "email",
      );
      const leaderEmail = String(
        leaderAnswers[emailField?.key ?? "email"] ?? "",
      )
        .trim()
        .toLowerCase();
      const memberEmails = teamMembers.map((member) =>
        String(member.answers[emailField?.key ?? "email"] ?? "")
          .trim()
          .toLowerCase(),
      );
      if (
        new Set([leaderEmail, ...memberEmails]).size !==
        memberEmails.length + 1
      ) {
        setFormError(
          "The same email address cannot be used more than once in a team.",
        );
        return false;
      }
    } else {
      const message = validateParticipantAnswers(leaderAnswers);
      if (message) {
        setFormError(message);
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setFormError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function previousStep() {
    setFormError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event || !form || registration || isSubmitting) return;
    setError("");
    setSuccessMessage("");

    if (!validateBeforeSubmit()) return;

    try {
      setIsSubmitting(true);
      const nameField = participantFields.find((field) =>
        ["name", "full_name"].includes(field.key),
      );
      const emailField = participantFields.find(
        (field) => field.key === "email",
      );
      const phoneField = participantFields.find((field) =>
        ["phone", "mobile_number"].includes(field.key),
      );

      const leaderName = String(
        leaderAnswers[nameField?.key ?? "name"] ?? "",
      ).trim();
      const leaderEmail = String(
        leaderAnswers[emailField?.key ?? "email"] ?? "",
      )
        .trim()
        .toLowerCase();
      const leaderPhone = String(
        leaderAnswers[phoneField?.key ?? "phone"] ?? "",
      ).trim();

      if (!leaderName || !leaderEmail) {
        setFormError("Team Leader name and email are required.");
        return;
      }

      const payload = {
        name: leaderName,
        email: leaderEmail,
        ...(leaderPhone ? { phone: leaderPhone } : {}),
        ...(event.participationType === "TEAM"
          ? { teamName: teamName.trim() }
          : {}),
        answers: leaderAnswers,
        teamAnswers:
          event.participationType === "TEAM"
            ? { ...teamAnswers, team_name: teamName.trim() }
            : {},
        teamMembers:
          event.participationType === "TEAM"
            ? teamMembers.map((member) => ({
                name: String(
                  member.answers[nameField?.key ?? "name"] ?? "",
                ).trim(),
                email: String(member.answers[emailField?.key ?? "email"] ?? "")
                  .trim()
                  .toLowerCase(),
                phone:
                  String(
                    member.answers[phoneField?.key ?? "phone"] ?? "",
                  ).trim() || undefined,
                answers: member.answers,
              }))
            : [],
      };

      const response = await api.post(`/registrations/${event.id}`, payload);


      const data = getData<Registration>(response);
      if (!data)
        throw new Error(
          "Registration response was not returned by the server.",
        );
      setRegistration(data);
      setSuccessMessage(
        data.registrationStatus === "WAITLISTED"
          ? "Event is full. You have been added to the waitlist."
          : "Your event registration has been completed successfully.",
      );
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(requestError, "Registration failed. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="mt-3 text-sm text-[var(--muted)]">
          Loading registration details...
        </p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-bold text-red-800">Unable to register</h1>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <Link
          href="/dashboard/events"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>
      </div>
    );
  }

  if (!event) return null;

  const deadline = formatDateTime(event.registrationDeadline);
  const qrEnabled =
    event.enableQrAttendance &&
    Boolean(registration?.qrToken) &&
    (registration?.registrationStatus === "REGISTERED" ||
      registration?.registrationStatus === "ATTENDED");

  if (registration) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/dashboard/events/${event.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Event
        </Link>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="relative h-40 bg-[var(--surface)] sm:h-52">
            {event.bannerImage ? (
              <img
                src={event.bannerImage}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CalendarDays className="h-10 w-10 text-[var(--muted)]" />
              </div>
            )}
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                {getAccessLabel(event.access)}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(registration.registrationStatus)}`}
              >
                {getStatusLabel(registration.registrationStatus)}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[var(--text)]">
              {event.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {registration.registrationStatus === "WAITLISTED"
                ? "Your registration is currently on the event waitlist."
                : registration.registrationStatus === "ATTENDED"
                  ? "Your attendance has been recorded."
                  : "You are already registered for this event."}
            </p>
            {registration.team?.name ? (
              <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Team
                </p>
                <p className="mt-1 font-semibold text-[var(--text)]">
                  {registration.team.name}
                </p>
                {registration.isTeamLeader ? (
                  <p className="mt-1 text-xs text-[var(--primary)]">
                    Team Leader
                  </p>
                ) : null}
              </div>
            ) : null}
            {qrEnabled && registration.qrToken ? (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
                <QrCode className="mx-auto h-6 w-6 text-[var(--primary)]" />
                <h2 className="mt-3 font-bold text-[var(--text)]">
                  Your Event QR Code
                </h2>
                <img
                  src={getQrImageUrl(registration.qrToken)}
                  alt="Event registration QR code"
                  className="mx-auto mt-5 h-56 w-56 rounded-xl bg-white p-2"
                />
              </div>
            ) : null}
            {successMessage ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}
            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/events"
                className="flex flex-1 items-center justify-center rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold"
              >
                Back to Events
              </Link>
              <Link
                href="/dashboard/registrations"
                className="flex flex-1 items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white"
              >
                My Registrations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (event.access === "INVITE_ONLY") {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-xl font-bold text-amber-800">
          Invitation Required
        </h1>
        <p className="mt-2 text-sm text-amber-700">
          This event is available only to invited participants.
        </p>
      </div>
    );
  }

  if (isFormLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="mt-3 text-sm text-[var(--muted)]">
          Loading registration form...
        </p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-xl font-bold text-red-800">
          Registration form unavailable
        </h1>
        <p className="mt-2 text-sm text-red-700">
          {formError || "The registration form could not be loaded."}
        </p>
      </div>
    );
  }

  const isTeam = event.participationType === "TEAM";
  const isReview = step === steps.length - 1;
  const isLeaderStep = (!isTeam && step === 0) || (isTeam && step === 1);
  const currentMemberIndex =
    isTeam && step > 1 && step < steps.length - 1 ? step - 2 : -1;
  const currentMember =
    currentMemberIndex >= 0 ? teamMembers[currentMemberIndex] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/dashboard/events/${event.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Event
      </Link>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="relative h-36 bg-[var(--surface)] sm:h-48">
          {event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays className="h-10 w-10 text-[var(--muted)]" />
            </div>
          )}
        </div>
        <div className="p-5 sm:p-7">
          <span className="inline-flex rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            {getAccessLabel(event.access)}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Register for {event.title}
          </h1>
          {event.shortDescription ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {event.shortDescription}
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 rounded-xl bg-[var(--surface)] p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
              {formatDate(event.eventDate)}
            </div>
            {event.startTime ? (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                {formatTime(event.startTime)}
                {event.endTime ? ` - ${formatTime(event.endTime)}` : ""} IST
              </div>
            ) : null}
            {event.venue ? (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                {event.venue}
              </div>
            ) : null}
            {deadline ? (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                Deadline: {deadline} IST
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {registrationClosed ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-amber-800">Registration is closed</h2>
          <p className="mt-2 text-sm text-amber-700">
            {form.status !== "PUBLISHED"
              ? "The registration form is not published."
              : "Registration is not currently available for this event."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              Registration
            </p>
            <h2 className="mt-1 text-xl font-bold text-[var(--text)]">
              {form.title}
            </h2>
            {form.description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {form.description}
              </p>
            ) : null}

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {steps.map((item, index) => {
                const active = index === step;
                const complete = index < step;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => index < step && setStep(index)}
                    disabled={index > step}
                    className={`flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${active ? "border-[var(--primary)] bg-[var(--primary)] text-white" : complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5">
                      {complete ? <Check className="h-3 w-3" /> : index + 1}
                    </span>
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>

          {error || formError ? (
            <div className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4 sm:mx-7">
              <p className="text-sm font-medium leading-6 text-red-700">
                {error || formError}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="p-5 sm:p-7">
            {!isReview && isTeam && step === 0 ? (
              <section className="space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    <Users className="h-3.5 w-3.5" /> Team
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Team Details
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Create the team first. You will be the leader because you
                    are starting this registration.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="teamName"
                    className="mb-2 block text-sm font-semibold text-[var(--text)]"
                  >
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => {
                      setTeamName(e.target.value);
                      setFormError("");
                    }}
                    minLength={2}
                    maxLength={100}
                    placeholder="Enter your team name"
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Team size: {event.minTeamSize ?? 1}–
                    {event.maxTeamSize ?? "∞"} members including the leader.
                  </p>
                </div>
                {teamFields.length > 0 ? (
                  <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <div>
                      <h4 className="font-semibold text-[var(--text)]">
                        Team Information
                      </h4>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        These fields apply to the whole team.
                      </p>
                    </div>
                    {teamFields.map((field) => (
                      <RegistrationField
                        key={field.id}
                        field={field}
                        value={teamAnswers[field.key]}
                        onChange={setTeamAnswer}
                        onToggleCheckbox={(key, option) =>
                          toggleAnswerCheckbox(setTeamAnswers, key, option)
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {!isReview && isLeaderStep ? (
              <section className="space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    <UserRound className="h-3.5 w-3.5" />{" "}
                    {isTeam ? "Step 2" : "Participant"}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    {isTeam ? "Team Leader Details" : "Participant Details"}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Fill every field configured by the event organiser. Your
                    account details are pre-filled where available.
                  </p>
                </div>
                <div className="space-y-5">
                  {participantFields.map((field) => (
                    <RegistrationField
                      key={field.id}
                      field={field}
                      value={leaderAnswers[field.key]}
                      onChange={setLeaderAnswer}
                      onToggleCheckbox={(key, option) =>
                        toggleAnswerCheckbox(setLeaderAnswers, key, option)
                      }
                      disabled={false}
                    />
                  ))}
                </div>
                {isTeam &&
                maxAdditionalMembers > 0 &&
                teamMembers.length === 0 ? (
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                  >
                    <Plus className="h-4 w-4" /> Add Member 1
                  </button>
                ) : null}
              </section>
            ) : null}

            {!isReview && currentMember ? (
              <section className="space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    <UserRound className="h-3.5 w-3.5" /> Team Member
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Member {currentMemberIndex + 1} Details
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Enter the same complete participant information required by
                    the registration form. Do not enter the leader again.
                  </p>
                </div>
                <div className="space-y-5">
                  {participantFields.map((field) => (
                    <RegistrationField
                      key={field.id}
                      field={field}
                      value={currentMember.answers[field.key]}
                      onChange={(key, value) =>
                        setMemberAnswer(currentMemberIndex, key, value)
                      }
                      onToggleCheckbox={(key, option) =>
                        toggleMemberCheckbox(currentMemberIndex, key, option)
                      }
                    />
                  ))}
                </div>
                {teamMembers.length < maxAdditionalMembers &&
                currentMemberIndex === teamMembers.length - 1 ? (
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                  >
                    <Plus className="h-4 w-4" /> Add another member
                  </button>
                ) : null}
                {teamMembers.length > minAdditionalMembers &&
                currentMemberIndex === teamMembers.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(currentMemberIndex)}
                    className="ml-2 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Remove this member
                  </button>
                ) : null}
              </section>
            ) : null}

            {isReview ? (
              <section className="space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Final Review
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Review your registration
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Please check every participant before submitting. Nothing is
                    submitted until you press Confirm Registration.
                  </p>
                </div>

                {isTeam ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Team
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--text)]">
                      {teamName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {teamMembers.length + 1} total participant
                      {teamMembers.length === 0 ? "" : "s"}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--border)] p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[var(--text)]">
                        {isTeam ? "Team Leader" : "Your Details"}
                      </h4>
                      <span className="text-xs font-semibold text-[var(--primary)]">
                        {isTeam ? "Leader" : "Participant"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {participantFields.map((field) => (
                        <div
                          key={field.id}
                          className="rounded-lg bg-[var(--surface)] p-3"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            {field.label}
                          </p>
                          <p className="mt-1 break-words text-sm text-[var(--text)]">
                            {formatAnswer(leaderAnswers[field.key])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {isTeam &&
                    teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-[var(--border)] p-5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[var(--text)]">
                            Member {index + 1}
                          </h4>
                          <span className="text-xs font-semibold text-[var(--muted)]">
                            Participant
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {participantFields.map((field) => (
                            <div
                              key={field.id}
                              className="rounded-lg bg-[var(--surface)] p-3"
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                                {field.label}
                              </p>
                              <p className="mt-1 break-words text-sm text-[var(--text)]">
                                {formatAnswer(member.answers[field.key])}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ) : null}

            {form.description && !isReview ? (
              <div className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted)]">
                {form.description}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 0 || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              {!isReview ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || registrationClosed}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />{" "}
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Confirm Registration
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-[var(--muted)]">
              By confirming, you submit the information shown above to the IEEE
              GU Student Branch event team.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
