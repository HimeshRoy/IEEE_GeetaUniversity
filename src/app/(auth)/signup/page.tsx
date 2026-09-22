"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  ieeeMembershipNumber: string;
  department: string;
  course: string;
  year: string;
  rollNumber: string;
};

const initialForm: SignupForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  ieeeMembershipNumber: "",
  department: "",
  course: "",
  year: "",
  rollNumber: "",
};

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function validateAccountStep() {
    if (!form.firstName.trim()) {
      setError("Please enter your first name.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return false;
    }

    if (!form.password) {
      setError("Please create a password.");
      return false;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return false;
    }

    return true;
  }

  function validateAcademicStep() {
    if (!form.ieeeMembershipNumber.trim()) {
      setError("Please enter your IEEE Membership Number.");
      return false;
    }

    if (!form.department.trim()) {
      setError("Please enter your department.");
      return false;
    }

    if (!form.course.trim()) {
      setError("Please enter your course.");
      return false;
    }

    if (!form.year.trim()) {
      setError("Please enter your current year.");
      return false;
    }

    if (!form.rollNumber.trim()) {
      setError("Please enter your roll number.");
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 1) {
      setError("");

      if (validateAccountStep()) {
        setStep(2);
      }

      return;
    }

    void createAccount();
  }

  async function createAccount() {
    setError("");

    if (!validateAcademicStep()) {
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/signup", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        ieeeMembershipNumber: form.ieeeMembershipNumber.trim(),
        department: form.department.trim(),
        course: form.course.trim(),
        year: form.year.trim(),
        rollNumber: form.rollNumber.trim(),
      });

      setSuccess(true);

      window.setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Unable to create your account. Please check your details and try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    setError("");
    setStep(1);
  }

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--primary)]/[0.04] blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-700 ease-out">
          <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center shadow-xl shadow-black/[0.02] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>

            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-3xl">
              Registration Successful
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              Your account has been created and your IEEE Geeta University
              Student Branch application is now pending review.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-[var(--muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
              Redirecting to login...
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--primary)]/[0.04] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <header className="mb-8 text-center sm:mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-colors duration-300 hover:bg-[var(--primary)]/20"
          >
            IEEE Geeta University
          </Link>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--secondary)] sm:text-4xl">
            Join the Student Branch
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Register your account with your official IEEE Membership Number.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-xl shadow-black/[0.02] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-150 fill-mode-both">
          <div className="border-b border-[var(--border)] bg-[var(--surface)]/30 px-6 py-5 sm:px-10 sm:py-6">
            <div className="flex items-center justify-center sm:justify-start">
              <Step
                number={1}
                label="Account"
                active={step === 1}
                completed={step === 2}
              />

              <div className="mx-4 h-px flex-1 bg-[var(--border)] sm:mx-6" />

              <Step
                number={2}
                label="Academic details"
                active={step === 2}
                completed={false}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 sm:p-10">
              {error && (
                <div
                  role="alert"
                  className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm animate-in fade-in duration-300"
                >
                  <p className="text-sm font-semibold leading-relaxed text-red-800">
                    {error}
                  </p>
                </div>
              )}

              {step === 1 ? (
                <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                      Step 1 of 2
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--secondary)]">
                      Create your account
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      Enter your basic account details.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <InputField
                      label="First Name"
                      name="firstName"
                      value={form.firstName}
                      onChange={updateField}
                      placeholder="Enter your first name"
                      required
                      autoComplete="given-name"
                    />

                    <InputField
                      label="Last Name"
                      name="lastName"
                      value={form.lastName}
                      onChange={updateField}
                      placeholder="Enter your last name"
                      autoComplete="family-name"
                    />

                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />

                    <InputField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateField}
                      placeholder="Enter your phone number"
                      required
                      autoComplete="tel"
                    />

                    <div className="space-y-2 sm:col-span-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-bold text-[var(--secondary)]"
                      >
                        Password{" "}
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="group relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={updateField}
                          placeholder="Minimum 8 characters"
                          minLength={8}
                          maxLength={128}
                          autoComplete="new-password"
                          required
                          className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 py-3.5 pl-4 pr-12 text-sm font-medium text-[var(--secondary)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((current) => !current)
                          }
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] transition-colors duration-200 hover:bg-[var(--border)] hover:text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-xs font-medium text-[var(--muted-foreground)]">
                        Use at least 8 characters.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 text-sm font-bold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 active:scale-[0.98]"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </section>
              ) : (
                <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                      Step 2 of 2
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--secondary)]">
                      Academic details
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      Complete your university and IEEE information.
                    </p>
                  </div>

                  <div className="mb-8 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-5 sm:p-6 shadow-sm">
                    <div className="mb-5">
                      <h3 className="text-base font-bold text-[var(--secondary)]">
                        IEEE Membership
                      </h3>

                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        Your official IEEE Membership Number is required to
                        join the student branch.
                      </p>
                    </div>

                    <InputField
                      label="IEEE Membership Number"
                      name="ieeeMembershipNumber"
                      value={form.ieeeMembershipNumber}
                      onChange={updateField}
                      placeholder="Enter your IEEE Membership Number"
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <h3 className="mb-6 text-base font-bold text-[var(--secondary)]">
                      University Information
                    </h3>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <InputField
                        label="Department"
                        name="department"
                        value={form.department}
                        onChange={updateField}
                        placeholder="e.g. Computer Science"
                        required
                      />

                      <InputField
                        label="Course"
                        name="course"
                        value={form.course}
                        onChange={updateField}
                        placeholder="e.g. B.Tech CSE"
                        required
                      />

                      <InputField
                        label="Year"
                        name="year"
                        value={form.year}
                        onChange={updateField}
                        placeholder="e.g. 2nd Year"
                        required
                      />

                      <InputField
                        label="Roll Number"
                        name="rollNumber"
                        value={form.rollNumber}
                        onChange={updateField}
                        placeholder="Enter your roll number"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-sm font-bold text-[var(--secondary)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:order-1"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void createAccount()}
                      disabled={isLoading}
                      className="group flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 text-sm font-bold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-[var(--primary)]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:order-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin !text-white" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <Check className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </form>

          <div className="border-t border-[var(--border)] px-6 py-6 text-center sm:px-10">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-bold text-[var(--primary)] transition-colors duration-200 hover:text-[var(--primary-dark)] hover:underline hover:underline-offset-4"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-lg px-2 text-center text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-300 fill-mode-both">
          Your registration will be reviewed by the IEEE Geeta University
          Student Branch administration.
        </p>
      </div>
    </main>
  );
}

function Step({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <div
        className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
          active || completed
            ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
            : "border-2 border-[var(--border)] bg-white text-[var(--muted-foreground)]"
        }`}
      >
        {completed ? (
          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : (
          number
        )}
      </div>

      <span
        className={`hidden text-sm font-bold sm:block transition-colors duration-300 ${
          active
            ? "text-[var(--secondary)]"
            : completed
              ? "text-[var(--primary)]"
              : "text-[var(--muted-foreground)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
};

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-bold text-[var(--secondary)]"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 py-3.5 px-4 text-sm font-medium text-[var(--secondary)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
      />
    </div>
  );
}