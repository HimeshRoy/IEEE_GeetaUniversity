"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        const message = data.message;

        if (
          message.includes('"code":"invalid_format"') ||
          message.includes('"path":["email"]') ||
          message.includes("Invalid email address") ||
          message.includes("invalid_format")
        ) {
          return "Please enter a valid email address.";
        }

        if (
          message.includes("Invalid email or password") ||
          message.includes("invalid email or password")
        ) {
          return "Invalid email or password.";
        }

        if (message.includes("inactive")) {
          return "Your account is inactive. Please contact the branch administration.";
        }

        return message.length > 180
          ? "Unable to login. Please check your details and try again."
          : message;
      }
    }

    if (
      typeof response === "object" &&
      response !== null &&
      "status" in response &&
      typeof response.status === "number"
    ) {
      if (response.status === 400) {
        return "Please check your email address and password.";
      }

      if (response.status === 401) {
        return "Invalid email or password.";
      }

      if (response.status === 403) {
        return "Your account is inactive. Please contact the branch administration.";
      }
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes("Network Error") ||
      error.message.includes("ERR_NETWORK")
    ) {
      return "Unable to connect to the server. Please try again.";
    }

    return error.message.length > 180
      ? "Unable to login. Please try again."
      : error.message;
  }

  return "Unable to login. Please check your details and try again.";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect || "/dashboard");
    }
  }, [isAuthenticated, redirect, router]);

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);

    if (error) {
      setError("");
    }
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const loginResponse = await api.post("/auth/login", {
        email: normalizedEmail,
        password,
      });

      const loginData = loginResponse.data?.data;
      const token = loginData?.token;

      if (!token) {
        throw new Error("Login failed. No authentication token was received.");
      }

      localStorage.setItem("auth_token", token);

      const currentUserResponse = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentUser = currentUserResponse.data?.data;

      if (!currentUser) {
        localStorage.removeItem("auth_token");
        throw new Error(
          "Login completed, but your account information could not be loaded.",
        );
      }

      setUser(currentUser);

      router.replace(redirect || "/dashboard");
    } catch (error: unknown) {
      localStorage.removeItem("auth_token");
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--primary)]/[0.04] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <header className="mb-8 text-center sm:mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors duration-300 hover:bg-[var(--primary)]/20"
          >
            IEEE Geeta University
          </Link>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-4xl">
            Welcome back
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Login to access your IEEE Geeta University Student Branch account.
          </p>
        </header>

        <div className="rounded-3xl border border-[var(--border)] bg-white shadow-xl shadow-black/[0.02] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-150 fill-mode-both">
          <div className="p-6 sm:p-10">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm animate-in fade-in duration-300"
              >
                <p className="text-sm font-semibold leading-relaxed text-red-800">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-[var(--secondary)]"
                  >
                    Email Address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)] transition-colors duration-200 group-focus-within:text-[var(--primary)]" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                      required
                      className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 py-3.5 pl-12 pr-4 text-sm font-medium text-[var(--secondary)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    />
                  </div>

                  <p className="text-xs font-medium text-[var(--muted-foreground)]">
                    Use the email address you registered with.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-[var(--secondary)]"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)] transition-colors duration-200 group-focus-within:text-[var(--primary)]" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 py-3.5 pl-12 pr-12 text-sm font-medium text-[var(--secondary)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] transition-colors duration-200 hover:bg-[var(--border)] hover:text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 text-sm font-bold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin !text-white" />
                    <span className="!text-white">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4.5 w-4.5 !text-white transition-transform duration-300 group-hover:scale-110" />
                    <span className="!text-white">Login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[var(--border)] pt-8 text-center">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                Don&apos;t have an account?{" "}
                <Link
                  href={
                    redirect
                      ? `/signup?redirect=${encodeURIComponent(redirect)}`
                      : "/signup"
                  }
                  className="font-bold text-[var(--primary)] transition-colors duration-200 hover:text-[var(--primary-dark)] hover:underline hover:underline-offset-4"
                >
                  Join the Student Branch
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-300 fill-mode-both">
          IEEE Geeta University Student Branch
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-10 flex flex-col items-center">
              <div className="h-6 w-32 animate-pulse rounded-full bg-[var(--border)]" />
              <div className="mt-6 h-10 w-64 animate-pulse rounded-lg bg-[var(--border)]" />
              <div className="mt-4 h-4 w-56 animate-pulse rounded bg-[var(--surface-muted)]" />
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-xl shadow-black/[0.02] sm:p-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-muted)]" />
                  <div className="h-14 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-muted)]" />
                  <div className="h-14 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
                </div>
                <div className="h-14 animate-pulse rounded-xl bg-[var(--border)] mt-8" />
              </div>
            </div>
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
