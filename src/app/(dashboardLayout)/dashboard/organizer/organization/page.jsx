"use client";

import DashboardHeading from "@/components/DashboardHeading";
import {
  addOrganization,
  updateOrganization,
} from "@/lib/api/organization/action";
import { myOrganization } from "@/lib/api/organization/data";
import { useSession } from "@/lib/auth-client";
import { uploadImage } from "@/utils/uploadImage";
import { Label } from "@heroui/react";

import { Button, Card, CardHeader, Form, Input, TextArea } from "@heroui/react";
import Image from "next/image";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Organization = () => {
  const { data: session } = useSession();

  const [myOrg, setMyOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      organizationName: "",
      website: "",
      description: "",
      logo: "",
    },
  });

  // ==========================================
  // GET ORGANIZATION
  // ==========================================
  useEffect(() => {
    const fetchOrganization = async () => {
      const email = session?.user?.email;

      if (!email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const org = await myOrganization(email);

        if (org) {
          setMyOrg(org);

          // Put existing organization data
          // into React Hook Form
          reset({
            organizationName: org.organizationName || "",
            website: org.website || "",
            description: org.description || "",
            logo: "",
          });
        } else {
          // No organization yet
          setMyOrg(null);

          reset({
            organizationName: "",
            website: "",
            description: "",
            logo: "",
          });
        }
      } catch (error) {
        console.error("Failed to load organization:", error);
        toast.error("Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [session?.user?.email, reset]);

  // ==========================================
  // SUBMIT
  // ==========================================
  const onOrganizationSubmit = async (data) => {
    try {
      setSubmitting(true);

      if (!session?.user?.email) {
        toast.error("User session not found");
        return;
      }

      // --------------------------------------
      // LOGO
      // --------------------------------------

      // If organization already exists,
      // keep the old logo by default.
      let logo = myOrg?.logo || "";

      // If user selects a new logo,
      // upload the new one.
      if (data.logo?.length > 0) {
        logo = await uploadImage(data.logo[0]);
      }

      // Logo is required only when creating
      // a completely new organization.
      if (!logo) {
        toast.error("Please upload a logo");
        return;
      }

      const orgData = {
        organizationName: data.organizationName,
        logo,
        website: data.website,
        description: data.description,
        organizerEmail: session.user.email,
      };

      // ======================================
      // UPDATE EXISTING ORGANIZATION
      // ======================================

      if (myOrg?._id) {
        const result = await updateOrganization(orgData, myOrg._id);

        if (result?.matchedCount > 0) {
          // Update local state immediately
          setMyOrg((previous) => ({
            ...previous,
            ...orgData,
          }));

          toast.success(
            result.modifiedCount > 0
              ? "Organization updated successfully"
              : "No changes made",
          );
        } else {
          toast.error("Organization was not found");
        }

        return;
      }

      // ======================================
      // CREATE NEW ORGANIZATION
      // ======================================

      const result = await addOrganization(orgData);

      if (result?.insertedId) {
        const newOrganization = {
          ...orgData,
          _id: result.insertedId,
        };

        // Store newly created organization
        setMyOrg(newOrganization);

        // Reset form with the newly created data
        reset({
          organizationName: newOrganization.organizationName,
          website: newOrganization.website,
          description: newOrganization.description,
          logo: "",
        });

        toast.success("Organization profile created successfully");
      } else {
        toast.error("Failed to create organization");
      }
    } catch (error) {
      console.error("Organization submit error:", error);

      toast.error(error?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div>
        <DashboardHeading
          title="My Organization Profile"
          description="Update organization logo, profile, website"
        />

        <div className="mt-6 max-w-3xl">
          <Card className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl">
            <div className="p-6">
              <p className="text-slate-400">Loading organization...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div>
      <DashboardHeading
        title="My Organization Profile"
        description="Update organization logo, profile, website"
      />

      <div className="mt-6 space-y-6 max-w-3xl">
        <Card
          className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl"
          radius="lg"
        >
          {/* HEADER */}
          <CardHeader className="flex flex-col items-start gap-1 pb-4 border-b border-white/5 p-6">
            <h3 className="text-xl font-bold text-white">
              Organization Details
            </h3>

            <p className="text-slate-400 text-xs">
              {myOrg
                ? "Update your existing organization information."
                : "Create your organization profile."}
            </p>
          </CardHeader>

          {/* FORM */}
          <div className="p-6">
            <Form
              onSubmit={handleSubmit(onOrganizationSubmit)}
              className="space-y-4 w-full"
            >
              {/* ORGANIZATION NAME */}
              <div className="w-full">
                <Label
                  htmlFor="organizationName"
                  className="text-md font-medium text-white mb-4 block"
                >
                  Organization Name
                </Label>
                <Input
                  {...register("organizationName", {
                    required: "Organization Name is Required",
                  })}
                  id="organizationName"
                  label="Organization Name"
                  placeholder="TechEvents Corp"
                  required
                  className="w-full bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
                />

                {errors.organizationName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

              {/* LOGO */}
              <div className="w-full">
                <Label
                  htmlFor="website"
                  className="text-md font-medium text-white mb-4 block"
                >
                  Organization Logo
                </Label>
                <Input
                  {...register("logo", {
                    required: !myOrg ? "Logo is Required" : false,
                  })}
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="w-full bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
                />

                {myOrg?.logo && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400">
                      Current logo is already uploaded. Choose a new file only
                      if you want to replace it.
                    </p>

                    <Image
                      src={myOrg.logo}
                      alt="Organization logo"
                      height={45}
                      width={45}
                      className="mt-2 w-20 h-20 object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}

                {errors.logo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.logo.message}
                  </p>
                )}
              </div>

              {/* WEBSITE */}
              <div className="w-full">
                <Label
                  htmlFor="website"
                  className="text-md font-medium text-white mb-4 block"
                >
                  Organization Website
                </Label>
                <Input
                  {...register("website", {
                    required: "Organization Website is Required",
                  })}
                  id="website"
                  label="Organization Website"
                  placeholder="techevents.corp"
                  required
                  className="w-full bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
                />

                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.website.message}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="w-full">
                <Label
                  htmlFor="website"
                  className="text-md font-medium text-white mb-4 block"
                >
                  Write Description
                </Label>
                <TextArea
                  {...register("description", {
                    required: "Organization Description is Required",
                  })}
                  id="description"
                  label="Description"
                  placeholder="Hosting global developer conferences and software hacking marathons."
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none min-h-[100px] text-white text-sm"
                />

                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  isDisabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-6 shadow-lg"
                  radius="lg"
                >
                  {submitting
                    ? "Saving..."
                    : myOrg
                      ? "Update Organization"
                      : "Create Organization"}
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Organization;
