"use client";

import {
  Activity,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSearch,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AuditUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email?: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  createdAt: string;
  user?: AuditUser | null;
  actor?: AuditUser | null;
  metadata?: unknown;
}

interface AuditLogsResponse {
  success: boolean;
  message?: string;
  data:
    | AuditLog[]
    | {
        logs: AuditLog[];
        total: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };
}

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "PUBLISH",
  "CANCEL",
  "ATTEND",
  "REGISTER",
];

const ENTITY_TYPES = [
  "EVENT",
  "EVENT_REGISTRATION",
  "MAINTENANCE",
  "USER",
  "MEMBERSHIP",
  "ANNOUNCEMENT",
  "GALLERY",
  "LEADERSHIP",
];

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatEntity(entity: string) {
  return entity
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) {
    return "Time not specified";
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return "Time not specified";
  }

  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getActor(log: AuditLog) {
  return log.user ?? log.actor ?? null;
}

function getActionClasses(action: string) {
  switch (action) {
    case "CREATE":
    case "REGISTER":
    case "APPROVE":
    case "PUBLISH":
    case "ATTEND":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "DELETE":
    case "CANCEL":
    case "REJECT":
      return "bg-red-50 text-red-700 border-red-200";

    case "UPDATE":
      return "bg-blue-50 text-blue-700 border-blue-200";

    default:
      return "bg-[var(--surface)] text-[var(--muted-foreground)] border-[var(--border)]";
  }
}

function getActionDot(action: string) {
  switch (action) {
    case "CREATE":
    case "REGISTER":
    case "APPROVE":
    case "PUBLISH":
    case "ATTEND":
      return "bg-emerald-500";

    case "DELETE":
    case "CANCEL":
    case "REJECT":
      return "bg-red-500";

    case "UPDATE":
      return "bg-[var(--primary)]";

    default:
      return "bg-slate-400";
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 20;

  const loadAuditLogs = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (action) {
          params.set("action", action);
        }

        if (entityType) {
          params.set("entityType", entityType);
        }

        const response = await api.get<AuditLogsResponse>(
          `/audit?${params.toString()}`,
        );

        const result = response.data;

        if (!result.success) {
          throw new Error(
            result.message ?? "Unable to load audit logs.",
          );
        }

        if (Array.isArray(result.data)) {
          setLogs(result.data);
          setTotal(result.data.length);
          setTotalPages(1);
        } else {
          setLogs(result.data.logs ?? []);
          setTotal(result.data.total ?? 0);

          const calculatedPages = Math.max(
            1,
            Math.ceil((result.data.total ?? 0) / limit),
          );

          setTotalPages(result.data.totalPages ?? calculatedPages);
        }
      } catch (requestError: unknown) {
        const axiosError = requestError as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };

        setError(
          axiosError.response?.data?.message ??
            axiosError.message ??
            "Unable to load audit logs.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [action, entityType, page, search],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAuditLogs();
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadAuditLogs]);

  function clearFilters() {
    setSearch("");
    setAction("");
    setEntityType("");
    setPage(1);
  }

  const hasFilters = Boolean(search || action || entityType);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                Administration
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-3xl">
                Audit Logs
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
            Review important actions performed across the IEEE Geeta
            University Student Branch portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAuditLogs(true)}
          disabled={loading || refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--secondary)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:text-[var(--primary)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}
          Refresh
        </button>
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Activity size={19} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Total Records
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[var(--secondary)]">
                {total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileSearch size={19} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Current Page
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[var(--secondary)]">
                {page}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                Showing
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[var(--secondary)]">
                {logs.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter
              size={18}
              className="text-[var(--primary)]"
            />

            <h2 className="text-sm font-extrabold text-[var(--secondary)]">
              Filters
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--secondary)]"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search audit logs..."
              className="w-full rounded-xl border border-[var(--border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
            />
          </div>

          {/* Action */}
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            <option value="">All actions</option>

            {ACTIONS.map((item) => (
              <option key={item} value={item}>
                {formatAction(item)}
              </option>
            ))}
          </select>

          {/* Entity */}
          <select
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value);
              setPage(1);
            }}
            className="w-full appearance-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            <option value="">All entities</option>

            {ENTITY_TYPES.map((item) => (
              <option key={item} value={item}>
                {formatEntity(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="min-w-0">
            <p>Unable to load audit logs</p>

            <p className="mt-1 text-xs font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Audit list */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
          <h2 className="text-lg font-extrabold text-[var(--secondary)]">
            Activity History
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Recent administrative and system activity.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2
              size={30}
              className="animate-spin text-[var(--primary)]"
            />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--muted-foreground)]">
              <FileSearch size={28} />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-[var(--secondary)]">
              No audit records found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
              {hasFilters
                ? "Try changing or clearing your filters to see more activity."
                : "System activity will appear here when actions are recorded."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold !text-white transition hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]/40">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                      Activity
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                      Entity
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                      Performed By
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
                  {logs.map((log) => {
                    const actor = getActor(log);

                    return (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-[var(--surface)]/30"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-4">
                            <div className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)]">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${getActionDot(log.action)}`}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${getActionClasses(log.action)}`}
                                >
                                  {formatAction(log.action)}
                                </span>
                              </div>

                              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[var(--secondary)]">
                                {log.description ??
                                  `${formatAction(log.action)} ${formatEntity(log.entityType)}`}
                              </p>

                              {log.entityId && (
                                <p className="mt-1 truncate font-mono text-[10px] text-[var(--muted-foreground)]">
                                  ID: {log.entityId}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--secondary)]">
                            {formatEntity(log.entityType)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {actor ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-xs font-extrabold text-[var(--primary)]">
                                {actor.firstName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[var(--secondary)]">
                                  {actor.firstName}{" "}
                                  {actor.lastName ?? ""}
                                </p>

                                {actor.email && (
                                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                                    {actor.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                              <UserRound size={16} />
                              System
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={15}
                              className="text-[var(--muted-foreground)]"
                            />

                            <div>
                              <p className="text-sm font-semibold text-[var(--secondary)]">
                                {formatDate(log.createdAt)}
                              </p>

                              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                                {formatTime(log.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-[var(--border)] md:hidden">
              {logs.map((log) => {
                const actor = getActor(log);

                return (
                  <div key={log.id} className="p-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)]">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${getActionDot(log.action)}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${getActionClasses(log.action)}`}
                          >
                            {formatAction(log.action)}
                          </span>

                          <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--secondary)]">
                            {formatEntity(log.entityType)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--secondary)]">
                          {log.description ??
                            `${formatAction(log.action)} ${formatEntity(log.entityType)}`}
                        </p>

                        <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                            <UserRound size={14} />

                            <span>
                              {actor
                                ? `${actor.firstName} ${actor.lastName ?? ""}`
                                : "System"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                            <CalendarDays size={14} />

                            <span>
                              {formatDate(log.createdAt)} ·{" "}
                              {formatTime(log.createdAt)}
                            </span>
                          </div>

                          {log.entityId && (
                            <p className="break-all font-mono text-[10px] text-[var(--muted-foreground)]">
                              ID: {log.entityId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-bold text-[var(--secondary)] transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-bold text-[var(--secondary)] transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <ShieldCheck
          size={21}
          className="mt-0.5 shrink-0 text-[var(--primary)]"
        />

        <div>
          <p className="text-sm font-bold text-[var(--secondary)]">
            Webmaster audit trail
          </p>

          <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
            Audit records are generated by the backend when important
            administrative and system actions are performed. This page is
            read-only.
          </p>
        </div>
      </div>
    </div>
  );
}