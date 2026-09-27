"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Power,
  Save,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface MaintenanceStatus {
  enabled: boolean;
  title: string | null;
  message: string | null;
  updatedAt: string;
}

interface MaintenanceResponse {
  success: boolean;
  message: string;
  data: MaintenanceStatus;
}

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMaintenance() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<MaintenanceResponse>("/maintenance");

        if (!mounted) {
          return;
        }

        const data = response.data?.data;

        if (!data) {
          throw new Error("Maintenance status was not returned.");
        }

        setEnabled(data.enabled);
        setTitle(data.title ?? "");
        setMessage(data.message ?? "");
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

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
            "Unable to load maintenance settings.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadMaintenance();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch<MaintenanceResponse>("/maintenance", {
        enabled,
        title: title.trim() || undefined,
        message: message.trim() || undefined,
      });

      const data = response.data?.data;

      if (!data) {
        throw new Error("Updated maintenance status was not returned.");
      }

      setEnabled(data.enabled);
      setTitle(data.title ?? "");
      setMessage(data.message ?? "");

      setSuccess(
        enabled
          ? "Maintenance mode has been enabled."
          : "Maintenance mode has been disabled.",
      );
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
          "Unable to update maintenance settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 size={30} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <ServerCog size={22} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
              System
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-3xl">
              Maintenance Mode
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
          Temporarily take the public IEEE Geeta University website offline
          while you perform maintenance, updates, or server-side work.
        </p>
      </div>

      {/* Status */}
      <div
        className={`rounded-3xl border p-6 shadow-sm ${
          enabled
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              enabled
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {enabled ? <AlertTriangle size={23} /> : <CheckCircle2 size={23} />}
          </div>

          <div className="min-w-0">
            <p
              className={`text-sm font-extrabold ${
                enabled ? "text-amber-900" : "text-emerald-900"
              }`}
            >
              {enabled
                ? "Maintenance mode is currently ON"
                : "Website is currently LIVE"}
            </p>

            <p
              className={`mt-1 text-sm leading-6 ${
                enabled ? "text-amber-800" : "text-emerald-800"
              }`}
            >
              {enabled
                ? "Public visitors will see the maintenance page instead of the normal website."
                : "The public website is operating normally."}
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-3xl border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
          <h2 className="text-lg font-extrabold text-[var(--secondary)]">
            Maintenance Settings
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Configure what visitors should see while the website is offline.
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {/* Toggle */}
          <div className="flex items-center justify-between gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Power size={20} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[var(--secondary)]">
                  Enable Maintenance Mode
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  When enabled, visitors will see the maintenance page.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Enable Maintenance Mode"
              onClick={() => setEnabled((value) => !value)}
              className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 ${
                enabled
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-slate-300 bg-slate-200"
              }`}
            >
              <span
                className={`absolute left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  enabled ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="maintenance-title"
              className="text-sm font-bold text-[var(--secondary)]"
            >
              Maintenance Title
            </label>

            <input
              id="maintenance-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              placeholder="We'll be back soon"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
            />

            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Maximum 150 characters.
            </p>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="maintenance-message"
              className="text-sm font-bold text-[var(--secondary)]"
            >
              Visitor Message
            </label>

            <textarea
              id="maintenance-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="The IEEE Geeta University website is currently undergoing scheduled maintenance. Please check back shortly."
              className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--secondary)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
            />

            <div className="mt-1.5 flex justify-end">
              <span className="text-xs text-[var(--muted-foreground)]">
                {message.length}/1000
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end border-t border-[var(--border)] pt-6">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold !text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <ShieldCheck
          size={21}
          className="mt-0.5 shrink-0 text-[var(--primary)]"
        />

        <div>
          <p className="text-sm font-bold text-[var(--secondary)]">
            Webmaster controlled
          </p>

          <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
            Maintenance changes are restricted to the Webmaster account and are
            recorded in the system audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
