"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function LoginPage() {
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
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <header className="mb-7 text-center sm:mb-8">
          <Link
            href="/"
            className="text-xs font-bold tracking-[0.2em] text-[var(--primary)] sm:text-sm"
          >
            IEEE GEETA UNIVERSITY
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Welcome back
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Login to access your IEEE Geeta University Student Branch account.
          </p>
        </header>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="p-5 sm:p-8">
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

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
                      className="!h-12 !min-h-12 !max-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 text-sm !leading-normal text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    Use the email address you registered with.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="!h-12 !min-h-12 !max-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-12 text-sm !leading-normal text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="!absolute !right-2.5 !top-1/2 !m-0 !flex !h-8 !min-h-8 !w-8 !min-w-8 !-translate-y-1/2 !items-center !justify-center !rounded-lg !border-0 !bg-transparent !p-0 !text-[var(--muted)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="!mt-7 !flex !h-12 !min-h-12 !max-h-12 !w-full !items-center !justify-center !rounded-xl !border-0 !bg-[var(--primary)] !px-5 !py-0 !text-sm !font-semibold !leading-none !text-white transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin !text-white" />
                    <span className="ml-2 !text-white">Signing in</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 !text-white" />
                    <span className="ml-2 !text-white">Login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm text-[var(--muted)]">
                Don&apos;t have an account?{" "}
                <Link
                  href={
                    redirect
                      ? `/signup?redirect=${encodeURIComponent(redirect)}`
                      : "/signup"
                  }
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  Join the Student Branch
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-[var(--muted)]">
          IEEE Geeta University Student Branch
        </p>
      </div>
    </main>
  );
}
