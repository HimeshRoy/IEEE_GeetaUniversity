"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[var(--primary)]/[0.06] blur-3xl" />
        <div className="absolute -bottom-48 -right-40 h-[520px] w-[520px] rounded-full bg-blue-400/[0.05] blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)]/[0.025] blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="w-full max-w-[1080px]">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <section className="relative hidden overflow-hidden bg-[var(--primary)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-14">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />

                <div className="relative">
                  <Link
                    href="/"
                    className="inline-flex items-center transition-opacity hover:opacity-90"
                  >
                    <Image
                      src="/ieeeguwhitelogo.png"
                      alt="IEEE"
                      width={200}
                      height={75}
                      className="h-auto w-auto"
                      priority
                    />
                  </Link>

                  <div className="mt-12 max-w-md">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
                      Student Branch
                    </span>

                    <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
                      Welcome back to the community.
                    </h1>

                    <p className="mt-6 max-w-sm text-sm leading-7 text-white/75 xl:text-base">
                      Sign in to stay connected with IEEE Geeta University
                      Student Branch events, membership, opportunities, and your
                      account.
                    </p>
                  </div>
                </div>

                {/* <div className="relative mt-12">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <LogIn className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        IEEE Geeta University
                      </p>
                      <p className="mt-0.5 text-xs text-white/60">
                        Student Branch
                      </p>
                    </div>
                  </div>
                </div> */}
              </section>

              <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
                <div className="mx-auto w-full max-w-[470px]">
                  <div className="mb-8 lg:hidden">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2"
                      aria-label="IEEE Geeta University Student Branch home"
                    >
                      <Image
                        src="/ieeegusblogo.png"
                        alt="IEEE Geeta University Student Branch"
                        width={200}
                        height={58}
                        className="h-15 w-auto object-contain"
                        priority
                      />
                    </Link>
                  </div>

                  <div className="mb-8">
                    <div className="mb-5 inline-flex items-center rounded-full bg-[var(--primary)]/[0.08] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                      Member Login
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-4xl">
                      Welcome back
                    </h2>

                    <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
                      Login to access your IEEE Geeta University Student Branch
                      account.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
                    >
                      <p className="text-sm font-semibold leading-6 text-red-800">
                        {error}
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
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
                          className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 py-3.5 pl-12 pr-4 text-sm font-medium text-[var(--secondary)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm font-bold text-[var(--secondary)]"
                        >
                          Password
                        </label>
                      </div>

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
                          className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 py-3.5 pl-12 pr-12 text-sm font-medium text-[var(--secondary)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] transition-colors duration-200 hover:bg-[var(--surface)] hover:text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin !text-white" />
                          <span className="!text-white">Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span className="!text-white">Sign in</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                      IEEE Geeta University
                    </span>
                    <div className="h-px flex-1 bg-[var(--border)]" />
                  </div>

                  <div className="text-center">
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

                  <p className="mt-7 text-center text-[11px] font-medium leading-5 text-[var(--muted-foreground)]">
                    By continuing, you are accessing the official IEEE Geeta
                    University Student Branch platform.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            IEEE Geeta University Student Branch
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative z-10 w-full max-w-[1080px]">
            <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-xl">
              <div className="grid min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
                <div className="hidden animate-pulse bg-[var(--surface)] lg:block" />

                <div className="flex items-center px-6 py-10 sm:px-10">
                  <div className="mx-auto w-full max-w-[470px]">
                    <div className="mb-8">
                      <div className="h-7 w-28 animate-pulse rounded-full bg-[var(--surface-muted)]" />
                      <div className="mt-6 h-10 w-60 animate-pulse rounded-lg bg-[var(--border)]" />
                      <div className="mt-4 h-4 w-72 animate-pulse rounded bg-[var(--surface-muted)]" />
                    </div>

                    <div className="space-y-5">
                      <div className="h-14 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
                      <div className="h-14 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
                      <div className="mt-7 h-14 animate-pulse rounded-xl bg-[var(--border)]" />
                    </div>
                  </div>
                </div>
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
