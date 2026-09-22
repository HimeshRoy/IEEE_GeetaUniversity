"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Loader2,
  Mail,
  MapPin,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
  Camera,
  ScanLine,
  ShieldCheck,
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

type EventItem = {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  startTime: string | null;
  endTime?: string | null;
  venue: string | null;
  status: EventStatus;
  capacity?: number | null;
  _count?: {
    registrations: number;
  };
};

type RegistrationStatus =
  | "REGISTERED"
  | "CANCELLED"
  | "ATTENDED"
  | "ABSENT"
  | "WAITLISTED";

type Registration = {
  id: string;
  eventId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  registrationStatus: RegistrationStatus;
  registeredAt: string;
  attendedAt: string | null;
};

type QrParticipant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isTeamLeader: boolean;
  registrationStatus: RegistrationStatus;
  attendedAt: string | null;
};

type QrScanResult = {
  type: "INDIVIDUAL" | "TEAM";
  event: {
    id: string;
    title: string;
  };
  team: {
    id: string;
    name: string;
  } | null;
  scannedParticipant: {
    id: string;
    name: string;
  };
  participants: QrParticipant[];
  attendanceRecordedAt: string;
};

type RegistrationStatistics = {
  total: number;
  registered: number;
  waitlisted: number;
  attended: number;
  absent: number;
  cancelled: number;
  availableSeats: number | null;
};

type RegistrationResponse = {
  event: {
    id: string;
    title: string;
    capacity: number | null;
  };
  statistics: RegistrationStatistics;
  registrations: Registration[];
};

type StatusFilter = "ALL" | RegistrationStatus;

type ConfirmAction =
  | {
      type: "status";
      registration: Registration;
      status: "ATTENDED" | "ABSENT" | "CANCELLED";
    }
  | {
      type: "promote";
      registration?: Registration;
    }
  | null;

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
    return "Date not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(date: string | null) {
  if (!date) {
    return "Time not specified";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Time not specified";
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatDateTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date not available";
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

function formatStatus(status: RegistrationStatus) {
  if (status === "REGISTERED") {
    return "Registered";
  }

  if (status === "WAITLISTED") {
    return "Waitlisted";
  }

  if (status === "ATTENDED") {
    return "Attended";
  }

  if (status === "ABSENT") {
    return "Absent";
  }

  return "Cancelled";
}

function getStatusClasses(status: RegistrationStatus) {
  if (status === "REGISTERED") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "WAITLISTED") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "ATTENDED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "ABSENT") {
    return "bg-orange-50 text-orange-700";
  }

  return "bg-red-50 text-red-700";
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--muted)]">{label}</p>

          <p className="mt-1 text-xl font-bold text-[var(--text)]">
            {value}
          </p>

          {description && (
            <p className="mt-0.5 text-[10px] text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-[var(--surface)] p-2">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  destructive = false,
}: {
  label: string;
  icon: typeof Check;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        destructive
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--surface)]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function RegistrationRow({
  registration,
  actionLoading,
  onAction,
}: {
  registration: Registration;
  actionLoading: string | null;
  onAction: (
    registration: Registration,
    status: "ATTENDED" | "ABSENT" | "CANCELLED",
  ) => void;
}) {
  const isLoading = actionLoading === registration.id;

  return (
    <tr className="border-b border-[var(--border)] last:border-b-0">
      <td className="px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text)]">
            {registration.name}
          </p>

          <p className="mt-0.5 text-[10px] text-[var(--muted)]">
            {registration.userId ? "Registered account" : "Public registration"}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[var(--text)]">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            <span className="max-w-[230px] truncate">{registration.email}</span>
          </div>

          {registration.phone && (
            <p className="text-[11px] text-[var(--muted)]">
              {registration.phone}
            </p>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
            registration.registrationStatus,
          )}`}
        >
          {formatStatus(registration.registrationStatus)}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-xs text-[var(--text)]">
          {formatDateTime(registration.registeredAt)}
        </p>
      </td>

      <td className="px-5 py-4">
        {registration.attendedAt ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{formatDateTime(registration.attendedAt)}</span>
          </div>
        ) : (
          <span className="text-xs text-[var(--muted)]">Not marked</span>
        )}
      </td>

      <td className="px-5 py-4">
        {isLoading ? (
          <div className="flex justify-end">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-1.5">
            {registration.registrationStatus === "REGISTERED" && (
              <>
                <ActionButton
                  label="Attended"
                  icon={UserCheck}
                  onClick={() => onAction(registration, "ATTENDED")}
                />

                <ActionButton
                  label="Absent"
                  icon={UserX}
                  onClick={() => onAction(registration, "ABSENT")}
                />

                <ActionButton
                  label="Cancel"
                  icon={XCircle}
                  destructive
                  onClick={() => onAction(registration, "CANCELLED")}
                />
              </>
            )}

            {registration.registrationStatus === "WAITLISTED" && (
              <span className="text-[10px] text-[var(--muted)]">
                Use waitlist controls
              </span>
            )}

            {(registration.registrationStatus === "ATTENDED" ||
              registration.registrationStatus === "ABSENT" ||
              registration.registrationStatus === "CANCELLED") && (
              <span className="text-[10px] text-[var(--muted)]">
                No further actions
              </span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function RegistrationManagementPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrationData, setRegistrationData] =
    useState<RegistrationResponse | null>(null);

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [pageError, setPageError] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionError, setActionError] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scanResult, setScanResult] = useState<QrScanResult | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      try {
        setIsLoadingEvents(true);
        setPageError("");

        const response = await api.get("/events/manage");
        const data = getResponseData<EventItem[]>(response);

        if (!mounted) {
          return;
        }

        const loadedEvents = Array.isArray(data) ? data : [];

        setEvents(loadedEvents);

        if (loadedEvents.length > 0) {
          setSelectedEventId(loadedEvents[0].id);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        setPageError(
          getErrorMessage(error, "Unable to load events right now."),
        );
      } finally {
        if (mounted) {
          setIsLoadingEvents(false);
        }
      }
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setRegistrationData(null);
      return;
    }

    let mounted = true;

    async function loadRegistrations() {
      try {
        setIsLoadingRegistrations(true);
        setRegistrationError("");

        const response = await api.get(
          `/registrations/event/${selectedEventId}`,
        );

        const data = getResponseData<RegistrationResponse>(response);

        if (!mounted) {
          return;
        }

        setRegistrationData(data);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setRegistrationData(null);
        setRegistrationError(
          getErrorMessage(error, "Unable to load registrations right now."),
        );
      } finally {
        if (mounted) {
          setIsLoadingRegistrations(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      mounted = false;
    };
  }, [selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const filteredRegistrations = useMemo(() => {
    const registrations = registrationData?.registrations ?? [];

    const normalizedSearch = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        registration.registrationStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        registration.name.toLowerCase().includes(normalizedSearch) ||
        registration.email.toLowerCase().includes(normalizedSearch) ||
        registration.phone?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [registrationData, search, statusFilter]);

  const waitlistedCount = registrationData?.statistics.waitlisted ?? 0;

  async function reloadRegistrations() {
    if (!selectedEventId) {
      return;
    }

    const response = await api.get(`/registrations/event/${selectedEventId}`);

    const data = getResponseData<RegistrationResponse>(response);

    setRegistrationData(data);
  }

  function handleRegistrationAction(
    registration: Registration,
    status: "ATTENDED" | "ABSENT" | "CANCELLED",
  ) {
    setActionError("");
    setConfirmAction({
      type: "status",
      registration,
      status,
    });
  }

  async function executeStatusUpdate(
    registration: Registration,
    status: "ATTENDED" | "ABSENT" | "CANCELLED",
  ) {
    try {
      setActionLoading(registration.id);
      setActionError("");

      await api.patch(`/registrations/${registration.id}/status`, {
        status,
      });

      await reloadRegistrations();

      setConfirmAction(null);
    } catch (error) {
      setActionError(
        getErrorMessage(error, "Unable to update registration status."),
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePromoteWaitlist() {
    if (!selectedEventId) {
      return;
    }

    try {
      setPromoting(true);
      setActionError("");

      await api.post(
        `/registrations/event/${selectedEventId}/promote-waitlist`,
      );

      await reloadRegistrations();

      setConfirmAction(null);
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          "Unable to promote the next waitlisted participant.",
        ),
      );
    } finally {
      setPromoting(false);
    }
  }

  async function handleDownloadExcel() {
    if (!selectedEventId) {
      return;
    }

    try {
      setDownloading(true);
      setActionError("");

      const response = await api.get(
        `/registrations/event/${selectedEventId}/export`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${
        registrationData?.event.title || "Event"
      }-Registrations.xlsx`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(
        getErrorMessage(error, "Unable to download the registration file."),
      );
    } finally {
      setDownloading(false);
    }
  }

  async function stopQrScanner() {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      await scanner.stop();
    } catch {}

    try {
      await scanner.clear();
    } catch {}

    scannerRef.current = null;
    setScannerReady(false);
  }

  async function startQrScanner() {
    if (!selectedEventId || scannerLoading) {
      return;
    }

    setScannerOpen(true);
    setScannerError("");
    setScanResult(null);
    setScannerLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const scanner = new Html5Qrcode("event-qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (scannerRef.current !== scanner) {
            return;
          }

          await stopQrScanner();

          setScannerLoading(true);
          setScannerError("");

          try {
            const response = await api.post("/registrations/scan-qr", {
              qrToken: decodedText,
              eventId: selectedEventId,
            });

            const data = getResponseData<QrScanResult>(response);

            if (!data) {
              throw new Error(
                "Attendance verification response was not returned.",
              );
            }

            setScanResult(data);
            await reloadRegistrations();
          } catch (error) {
            setScannerError(
              getErrorMessage(error, "Unable to verify this QR code."),
            );
          } finally {
            setScannerLoading(false);
          }
        },
        () => {
          setScannerReady(true);
          setScannerLoading(false);
        },
      );

      setScannerReady(true);
      setScannerLoading(false);
    } catch (error) {
      scannerRef.current = null;
      setScannerReady(false);
      setScannerLoading(false);
      setScannerError(
        getErrorMessage(
          error,
          "Unable to access the camera. Please allow camera permission and try again.",
        ),
      );
    }
  }

  async function closeQrScanner() {
    await stopQrScanner();
    setScannerOpen(false);
    setScannerError("");
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scanner.stop();
        scanner.clear();
        scannerRef.current = null;
      }
    };
  }, []);

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

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-7">
          <p className="text-xs font-semibold text-[var(--primary)]">
            IEEE Geeta University
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">
            Registration Management
          </h1>

          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Manage event participants, attendance, waitlists, and registration
            records.
          </p>
        </div>

        {pageError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">{pageError}</p>
          </div>
        )}

        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full xl:max-w-2xl">
              <label
                htmlFor="event"
                className="text-xs font-semibold text-[var(--text)]"
              >
                Event
              </label>

              <div className="relative mt-2">
                <select
                  id="event"
                  value={selectedEventId}
                  onChange={(event) => {
                    setSelectedEventId(event.target.value);
                    setSearch("");
                    setStatusFilter("ALL");
                    setRegistrationError("");
                    setActionError("");
                  }}
                  disabled={isLoadingEvents || events.length === 0}
                  className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 pr-10 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  {isLoadingEvents && <option>Loading events...</option>}

                  {!isLoadingEvents && events.length === 0 && (
                    <option>No events available</option>
                  )}

                  {!isLoadingEvents &&
                    events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={startQrScanner}
                disabled={!selectedEventId || scannerLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--primary)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary-light)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ScanLine className="h-4 w-4" />
                Scan QR
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={!selectedEventId || downloading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Excel
              </button>
            </div>
          </div>

          {selectedEvent && (
            <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>{formatDate(selectedEvent.eventDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Clock3 className="h-4 w-4 shrink-0" />
                <span>{formatTime(selectedEvent.startTime)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {selectedEvent.venue || "Venue to be announced"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Users className="h-4 w-4 shrink-0" />
                <span>
                  {selectedEvent.capacity === null ||
                  selectedEvent.capacity === undefined
                    ? "Unlimited capacity"
                    : `${selectedEvent.capacity} capacity`}
                </span>
              </div>
            </div>
          )}
        </section>

        {isLoadingRegistrations && (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[var(--primary)]" />

            <p className="mt-3 text-sm text-[var(--muted)]">
              Loading registration records...
            </p>
          </div>
        )}

        {!isLoadingRegistrations && registrationError && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {registrationError}
            </p>
          </div>
        )}

        {!isLoadingRegistrations && !registrationError && registrationData && (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total"
                value={registrationData.statistics.total}
                icon={Users}
                description="All registration records"
              />

              <StatCard
                label="Registered"
                value={registrationData.statistics.registered}
                icon={CheckCircle2}
                description="Currently registered"
              />

              <StatCard
                label="Waitlisted"
                value={registrationData.statistics.waitlisted}
                icon={Clock3}
                description="Waiting for a seat"
              />

              <StatCard
                label="Attended"
                value={registrationData.statistics.attended}
                icon={UserCheck}
                description="Attendance marked"
              />

              <StatCard
                label="Absent"
                value={registrationData.statistics.absent}
                icon={UserX}
                description="Marked absent"
              />

              <StatCard
                label="Cancelled"
                value={registrationData.statistics.cancelled}
                icon={XCircle}
                description="Cancelled registrations"
              />

              <StatCard
                label="Available Seats"
                value={
                  registrationData.statistics.availableSeats === null
                    ? "Unlimited"
                    : registrationData.statistics.availableSeats
                }
                icon={Users}
                description="Remaining capacity"
              />

              <StatCard
                label="Capacity"
                value={
                  registrationData.event.capacity === null
                    ? "Unlimited"
                    : registrationData.event.capacity
                }
                icon={Users}
                description="Event capacity"
              />
            </section>

            {actionError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-red-700">
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

            <section className="mt-5 rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="border-b border-[var(--border)] p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text)]">
                      Participants
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {filteredRegistrations.length} of{" "}
                      {registrationData.registrations.length} registration
                      {registrationData.registrations.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />

                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search participants..."
                        className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] sm:w-60"
                      />
                    </div>

                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value as StatusFilter)
                        }
                        className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 pr-9 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--primary)] sm:w-44"
                      >
                        <option value="ALL">All statuses</option>
                        <option value="REGISTERED">Registered</option>
                        <option value="WAITLISTED">Waitlisted</option>
                        <option value="ATTENDED">Attended</option>
                        <option value="ABSENT">Absent</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
                    </div>
                  </div>
                </div>
              </div>

              {waitlistedCount > 0 && (
                <div className="flex flex-col gap-3 border-b border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {waitlistedCount} participant
                      {waitlistedCount === 1 ? "" : "s"} waiting
                    </p>

                    <p className="mt-0.5 text-xs text-amber-700">
                      Promote the next participant when a seat becomes available.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        type: "promote",
                      })
                    }
                    disabled={
                      promoting ||
                      registrationData.statistics.availableSeats === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Promote Next
                  </button>
                </div>
              )}

              {filteredRegistrations.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="mx-auto h-9 w-9 text-[var(--muted)]" />

                  <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">
                    No registrations found
                  </h3>

                  <p className="mt-1.5 text-xs text-[var(--muted)]">
                    {search || statusFilter !== "ALL"
                      ? "No participants match the current search or filter."
                      : "No participants have registered for this event yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                        <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Participant
                        </th>

                        <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Contact
                        </th>

                        <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Status
                        </th>

                        <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Registered
                        </th>

                        <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Attendance
                        </th>

                        <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRegistrations.map((registration) => (
                        <RegistrationRow
                          key={registration.id}
                          registration={registration}
                          actionLoading={actionLoading}
                          onAction={handleRegistrationAction}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text)]">
                    {confirmAction.type === "promote"
                      ? "Promote Waitlisted Participant"
                      : "Update Registration"}
                  </h2>

                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    {confirmAction.type === "promote"
                      ? "The next participant in the waitlist will be moved to Registered."
                      : `Change ${
                          confirmAction.registration.name
                        } to ${formatStatus(confirmAction.status)}?`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmAction(null);
                    setActionError("");
                  }}
                  className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {confirmAction.type === "status" && (
                <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {confirmAction.registration.name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {confirmAction.registration.email}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                        confirmAction.registration.registrationStatus,
                      )}`}
                    >
                      Current:{" "}
                      {formatStatus(
                        confirmAction.registration.registrationStatus,
                      )}
                    </span>

                    <span className="mx-2 text-xs text-[var(--muted)]">→</span>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                        confirmAction.status,
                      )}`}
                    >
                      {formatStatus(confirmAction.status)}
                    </span>
                  </div>
                </div>
              )}

              {actionError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">
                    {actionError}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAction(null);
                    setActionError("");
                  }}
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading !== null || promoting}
                  onClick={() => {
                    if (confirmAction.type === "status") {
                      executeStatusUpdate(
                        confirmAction.registration,
                        confirmAction.status,
                      );
                    } else {
                      handlePromoteWaitlist();
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold !text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading !== null || promoting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {scannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                    Attendance Verification
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[var(--text)]">
                    Scan Participant QR
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {registrationData?.event.title ?? "Selected event"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void closeQrScanner()}
                  className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  aria-label="Close QR scanner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 max-h-[80vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {!scanResult ? (
                  <>
                    <div className="overflow-hidden rounded-2xl bg-black">
                      <div
                        id="event-qr-reader"
                        className="min-h-[320px] w-full"
                      />
                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <Camera className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />

                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">
                          Camera verification only
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          Point the camera at the participant's event QR code.
                          Attendance is verified directly against this event.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                          <ShieldCheck className="h-5 w-5 text-emerald-700" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-emerald-800">
                            Attendance Verified
                          </p>

                          <p className="mt-0.5 text-xs text-emerald-700">
                            {formatDateTime(scanResult.attendanceRecordedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {scanResult.type === "TEAM" && scanResult.team ? (
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Team
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-[var(--text)]">
                          {scanResult.team.name}
                        </h3>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {scanResult.participants.length} participant
                          {scanResult.participants.length === 1 ? "" : "s"} marked
                          present
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Participant
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-[var(--text)]">
                          {scanResult.scannedParticipant.name}
                        </h3>
                      </div>
                    )}

                    <div className="rounded-2xl border border-[var(--border)] bg-white">
                      <div className="border-b border-[var(--border)] px-5 py-4">
                        <h3 className="text-sm font-bold text-[var(--text)]">
                          {scanResult.type === "TEAM"
                            ? "Team Members"
                            : "Participant"}
                        </h3>
                      </div>

                      <div className="divide-y divide-[var(--border)]">
                        {scanResult.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between gap-4 px-5 py-4"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-[var(--text)]">
                                  {participant.name}
                                </p>

                                {participant.isTeamLeader ? (
                                  <span className="rounded-full bg-[var(--primary-light)] px-2 py-0.5 text-[9px] font-semibold text-[var(--primary)]">
                                    Leader
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-1 truncate text-xs text-[var(--muted)]">
                                {participant.email}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-4 w-4" />
                              Present
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setScanResult(null);
                          setScannerError("");
                          void startQrScanner();
                        }}
                        className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface)]"
                      >
                        Scan Another
                      </button>

                      <button
                        type="button"
                        onClick={() => void closeQrScanner()}
                        className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white transition-opacity hover:opacity-90"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}

                {scannerLoading && !scanResult ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting camera...
                  </div>
                ) : null}

                {scannerError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-700">
                      {scannerError}
                    </p>
                  </div>
                ) : null}

                {scannerReady && !scanResult && !scannerError ? (
                  <p className="mt-3 text-center text-xs text-emerald-700">
                    Camera ready — point it at the QR code.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}