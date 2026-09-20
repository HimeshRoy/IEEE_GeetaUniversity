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
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]">
            <Check className="h-7 w-7 !text-white" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
            Registration Successful
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Your account has been created and your IEEE Geeta University
            Student Branch application is now pending review.
          </p>

          <p className="mt-5 text-xs text-[var(--muted)]">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-7 text-center sm:mb-8">
          <Link
            href="/"
            className="text-xs font-bold tracking-[0.2em] text-[var(--primary)] sm:text-sm"
          >
            IEEE GEETA UNIVERSITY
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Join the Student Branch
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
            Register your account with your official IEEE Membership Number.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center">
              <Step
                number={1}
                label="Account"
                active={step === 1}
                completed={step === 2}
              />

              <div className="mx-3 h-px flex-1 bg-[var(--border)] sm:mx-5" />

              <Step
                number={2}
                label="Academic details"
                active={step === 2}
                completed={false}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-5 sm:p-8">
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {step === 1 ? (
                <section>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
                      Step 1 of 2
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
                      Create your account
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Enter your basic account details.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
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

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                      >
                        Password{" "}
                        <span className="text-[var(--primary)]">*</span>
                      </label>

                      <div className="relative">
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
                          className="!h-12 !min-h-12 !max-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 pr-12 text-sm !leading-normal text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((current) => !current)
                          }
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

                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Use at least 8 characters.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="!mt-8 !flex !h-12 !min-h-12 !max-h-12 !w-full !items-center !justify-center !rounded-xl !border-0 !bg-[var(--primary)] !px-5 !py-0 !text-sm !font-semibold !leading-none !text-white transition hover:opacity-90 active:scale-[0.99]"
                  >
                    <span className="!text-white">Continue</span>
                    <ArrowRight className="ml-2 h-4 w-4 !text-white" />
                  </button>
                </section>
              ) : (
                <section>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
                      Step 2 of 2
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
                      Academic details
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Complete your university and IEEE information.
                    </p>
                  </div>

                  <div className="mb-7 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4 sm:p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        IEEE Membership
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
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
                    <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
                      University Information
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2">
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

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="!order-2 !flex !h-12 !min-h-12 !max-h-12 !w-full !items-center !justify-center !rounded-xl !border !border-[var(--border)] !bg-transparent !px-5 !py-0 !text-sm !font-semibold !leading-none !text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:!order-1 sm:!w-auto sm:!flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void createAccount()}
                      disabled={isLoading}
                      className="!order-1 !flex !h-12 !min-h-12 !max-h-12 !w-full !items-center !justify-center !rounded-xl !border-0 !bg-[var(--primary)] !px-5 !py-0 !text-sm !font-semibold !leading-none !text-white transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:!order-2 sm:!flex-[2]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin !text-white" />
                          <span className="ml-2 !text-white">
                            Creating Account
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="!text-white">Create Account</span>
                          <Check className="ml-2 h-4 w-4 !text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </form>

          <div className="border-t border-[var(--border)] px-5 py-5 text-center">
            <p className="text-sm text-[var(--muted)]">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-lg px-2 text-center text-xs leading-5 text-[var(--muted)]">
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
    <div className="flex shrink-0 items-center gap-2.5">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          active || completed
            ? "bg-[var(--primary)] !text-white"
            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
        }`}
      >
        {completed ? (
          <Check className="h-4 w-4 !text-white" />
        ) : (
          number
        )}
      </div>

      <span
        className={`hidden text-sm font-semibold sm:block ${
          active
            ? "text-[var(--foreground)]"
            : "text-[var(--muted)]"
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
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
        {required && (
          <span className="text-[var(--primary)]"> *</span>
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
        className="!h-12 !min-h-12 !max-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm !leading-normal text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
      />
    </div>
  );
}