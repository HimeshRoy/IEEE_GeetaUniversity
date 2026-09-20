"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  KeyRound,
  Save,
  UserRound,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

type MemberProfile = {
  department: string | null;
  course: string | null;
  year: string | null;
  rollNumber: string | null;
};

type User = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  profileImage: string | null;
  ieeeMembershipNumber: string | null;
  role: string;
  memberProfile: MemberProfile | null;
};

const PROFILE_IMAGE_ROLES = [
  "WEBMASTER",
  "IEEE_COUNSELOR",
  "FACULTY_ADVISOR",
  "FACULTY",
  "FACULTY_MEMBER",
  "CHAIRMAN",
  "VICE_CHAIRMAN",
  "JOINT_SECRETARY",
  "PHOTOGRAPHER",
  "TREASURER",
];

const FACULTY_PROFILE_ROLES = [
  "FACULTY",
  "FACULTY_ADVISOR",
  "FACULTY_MEMBER",
  "IEEE_COUNSELOR",
];

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [ieeeMembershipNumber, setIeeeMembershipNumber] =
    useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await getCurrentUser();

        if (!mounted) return;

        const currentUser =
          response?.data ?? response;

        setUser(currentUser);
        setFirstName(currentUser.firstName || "");
        setLastName(currentUser.lastName || "");
        setPhone(currentUser.phone || "");
        setBio(currentUser.bio || "");
        setIeeeMembershipNumber(
          currentUser.ieeeMembershipNumber || "",
        );
        setDepartment(
          currentUser.memberProfile?.department || "",
        );
        setCourse(
          currentUser.memberProfile?.course || "",
        );
        setYear(
          currentUser.memberProfile?.year || "",
        );
        setRollNumber(
          currentUser.memberProfile?.rollNumber || "",
        );
      } catch (requestError: any) {
        if (!mounted) return;

        setError(
          requestError?.response?.data?.message ||
            "Unable to load your profile.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const canUploadProfileImage =
    user !== null &&
    PROFILE_IMAGE_ROLES.includes(user.role);

  const showAcademicInformation =
    user !== null &&
    !FACULTY_PROFILE_ROLES.includes(user.role);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.patch("/users/me", {
        firstName,
        lastName,
        phone,
        bio,
        ieeeMembershipNumber,
        ...(showAcademicInformation
          ? {
              department,
              course,
              year,
              rollNumber,
            }
          : {}),
      });

      const updatedUser =
        response?.data?.data ?? response?.data;

      setUser(updatedUser);

      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setPhone(updatedUser.phone || "");
      setBio(updatedUser.bio || "");
      setIeeeMembershipNumber(
        updatedUser.ieeeMembershipNumber || "",
      );
      setDepartment(
        updatedUser.memberProfile?.department || "",
      );
      setCourse(
        updatedUser.memberProfile?.course || "",
      );
      setYear(
        updatedUser.memberProfile?.year || "",
      );
      setRollNumber(
        updatedUser.memberProfile?.rollNumber || "",
      );

      setMessage(
        "Your profile has been updated successfully.",
      );
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.patch(
        "/users/profile-image",
        formData,
      );

      const updatedUser =
        response?.data?.data ?? response?.data;

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              ...updatedUser,
            }
          : updatedUser,
      );

      setMessage(
        "Profile photo updated successfully.",
      );
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to update your profile photo.",
      );
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handlePasswordChange(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setChangingPassword(true);
      setPasswordMessage("");
      setPasswordError("");

      if (!currentPassword) {
        throw new Error(
          "Current password is required",
        );
      }

      if (!newPassword) {
        throw new Error(
          "New password is required",
        );
      }

      if (!confirmPassword) {
        throw new Error(
          "Please confirm your new password",
        );
      }

      if (newPassword !== confirmPassword) {
        throw new Error(
          "New passwords do not match",
        );
      }

      if (newPassword.length < 8) {
        throw new Error(
          "New password must contain at least 8 characters",
        );
      }

      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Your password has been changed successfully.",
      );
    } catch (requestError: any) {
      setPasswordError(
        requestError?.response?.data?.message ||
          (requestError instanceof Error
            ? requestError.message
            : "Unable to change your password."),
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl animate-pulse">
        <div className="mb-7">
          <div className="h-4 w-20 rounded bg-[var(--background)]" />
          <div className="mt-3 h-8 w-48 rounded bg-[var(--background)]" />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="h-20 w-20 rounded-full bg-[var(--background)]" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="h-12 rounded-lg bg-[var(--background)]" />
            <div className="h-12 rounded-lg bg-[var(--background)]" />
            <div className="h-12 rounded-lg bg-[var(--background)]" />
            <div className="h-12 rounded-lg bg-[var(--background)]" />
            <div className="h-28 rounded-lg bg-[var(--background)] sm:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-base font-semibold text-red-800">
            Unable to load profile
          </h1>

          <p className="mt-1.5 text-sm text-red-700">
            {error ||
              "Profile information is not available."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-7">
        <Link
          href="/dashboard/profile"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Profile
        </Link>

        <p className="mb-1.5 text-sm font-semibold text-[var(--primary)]">
          Account
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Edit Profile
        </h1>

        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Update your personal profile information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="border-b border-[var(--border)] p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--background)]">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName || ""}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-7 w-7 text-[var(--muted)]" />
                )}
              </div>

              {canUploadProfileImage && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploadingImage}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] !text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Change profile photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Personal Information
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Keep your contact and profile information up to date.
              </p>

              {canUploadProfileImage && (
                <p className="mt-1.5 text-[10px] text-[var(--muted)]">
                  {uploadingImage
                    ? "Uploading photo..."
                    : "Click the camera icon to change your photo."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                First Name
              </label>

              <input
                id="firstName"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                required
                maxLength={50}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                Last Name
              </label>

              <input
                id="lastName"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                maxLength={50}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                Email
              </label>

              <input
                id="email"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--muted)] outline-none"
              />

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Email cannot be changed here.
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                Phone
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                maxLength={15}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="bio"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                Bio
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                maxLength={1000}
                rows={5}
                placeholder="Tell others a little about yourself..."
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)]"
              />

              <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
                {bio.length}/1000
              </p>
            </div>

            <div className="sm:col-span-2">
              <div className="border-t border-[var(--border)] pt-5">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  IEEE Information
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Manage your official IEEE profile information.
                </p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="ieeeMembershipNumber"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                IEEE Membership Number
              </label>

              <input
                id="ieeeMembershipNumber"
                value={ieeeMembershipNumber}
                onChange={(event) =>
                  setIeeeMembershipNumber(
                    event.target.value,
                  )
                }
                maxLength={50}
                placeholder="Enter IEEE membership number"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            {showAcademicInformation && (
              <>
                <div className="sm:col-span-2">
                  <div className="border-t border-[var(--border)] pt-5">
                    <h2 className="text-base font-bold text-[var(--foreground)]">
                      Academic Information
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Keep your academic information up to date.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
                  >
                    Department
                  </label>

                  <input
                    id="department"
                    value={department}
                    onChange={(event) =>
                      setDepartment(event.target.value)
                    }
                    maxLength={150}
                    placeholder="Enter department"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="course"
                    className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
                  >
                    Course
                  </label>

                  <input
                    id="course"
                    value={course}
                    onChange={(event) =>
                      setCourse(event.target.value)
                    }
                    maxLength={150}
                    placeholder="Enter course"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
                  >
                    Year
                  </label>

                  <input
                    id="year"
                    value={year}
                    onChange={(event) =>
                      setYear(event.target.value)
                    }
                    maxLength={50}
                    placeholder="Enter academic year"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rollNumber"
                    className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
                  >
                    Roll Number
                  </label>

                  <input
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(event) =>
                      setRollNumber(event.target.value)
                    }
                    maxLength={50}
                    placeholder="Enter roll number"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      <form
        onSubmit={handlePasswordChange}
        className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="border-b border-[var(--border)] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background)]">
              <KeyRound className="h-5 w-5 text-[var(--primary)]" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Change Password
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Update your account password securely.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
              >
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                />

                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  Minimum 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
              {passwordMessage}
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-5">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}