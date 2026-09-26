"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input, Spinner } from "@heroui/react";
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaSave,
  FaArrowLeft,
  FaUserTie,
} from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState(null);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saving, setSaving] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />

          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-white/10 bg-[#111111] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
            <FaUser size={26} />
          </div>

          <h1 className="text-2xl font-bold text-white">Sign in required</h1>

          <p className="mt-3 text-gray-400">
            Please sign in to view your profile.
          </p>

          <Button
            as={Link}
            href="/login"
            className="mt-6 w-full bg-violet-600 text-white hover:bg-violet-700"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  /*
   * Use session values until the user changes them.
   * This avoids copying session data into state with useEffect.
   */
  const currentName = name !== null ? name : session.user.name || "";

  const currentImage = image !== null ? image : session.user.image || "";

  const currentPreview =
    previewImage !== null ? previewImage : session.user.image || "";

  const userRole = session.user.role || session.user.userType || "attendee";

  const roleLabel = userRole === "organizer" ? "Organizer" : "Attendee";

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setSelectedImage(file);

    const preview = URL.createObjectURL(file);

    setPreviewImage(preview);
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      return currentImage;
    }

    const formData = new FormData();

    formData.append("image", selectedImage);

    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error("Failed to upload profile image.");
    }

    return data.data.url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentName.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!session.user.email) {
      toast.error("Please sign in again.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = currentImage;

      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          name: currentName.trim(),
          image: imageUrl || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update profile.");
      }

      setName(currentName.trim());
      setImage(imageUrl || "");
      setPreviewImage(imageUrl || "");
      setSelectedImage(null);

      toast.success("Profile updated successfully.");

      await authClient.getSession();
    } catch (error) {
      console.error("Update profile error:", error);

      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-violet-400"
        >
          <FaArrowLeft />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <FaUser size={20} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>

              <p className="mt-1 text-sm text-gray-400">
                Manage your Ticketo account information.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border border-white/10 bg-[#111111] p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-violet-500/20 bg-[#1a1a1a]">
                  {currentPreview ? (
                    <Image
  src={currentPreview}
  alt="Profile"
  width={200}
  height={200}
  className="h-full w-full object-cover"
/>
                  ) : (
                    <FaUser size={45} className="text-gray-500" />
                  )}
                </div>

                <label
                  htmlFor="profile-image"
                  className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-[#111111] bg-violet-600 text-white transition hover:bg-violet-700"
                >
                  <FaCamera size={15} />

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                JPG, PNG or WEBP · Maximum 5MB
              </p>
            </div>

            {/* Account Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Account Type
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#181818] px-4 py-3">
                <FaUserTie className="text-violet-400" />

                <span className="text-sm font-medium text-gray-200">
                  {roleLabel}
                </span>

                <span className="ml-auto rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"
              >
                <FaUser className="text-violet-400" />
                Full Name
              </label>

              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" />

                <Input
                  id="name"
                  value={currentName}
                  onChange={(event) => setName(event.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300"
              >
                <FaEnvelope className="text-violet-400" />
                Email Address
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-500" />

                <Input
                  id="email"
                  value={session.user.email || ""}
                  readOnly
                  onChange={() => {}}
                  className="pl-10 w-full"
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Email address cannot be changed.
              </p>
            </div>

            {/* Save */}
            <div className="flex justify-end border-t border-white/10 pt-6">
              <Button
                type="submit"
                isDisabled={saving}
                className="min-w-40 bg-violet-600 text-white hover:bg-violet-700"
                startContent={!saving && <FaSave />}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
