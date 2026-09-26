"use client";

import DashboardHeading from "@/components/DashboardHeading";
import { useSession } from "@/lib/auth-client";
import { uploadImage } from "@/utils/uploadImage";

import { myOrganization } from "@/lib/api/organization/data";

import {
  Button,
  Card,
  CardHeader,
  Form,
  Input,
  ListBox,
  Select,
} from "@heroui/react";

import React, { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  addEvent,
  deleteEvent,
  updateEvent,
} from "@/lib/api/events/action";
import { myEvents } from "@/lib/api/events/data";
import Image from "next/image";
import { Label } from "@heroui/react";

const EventManagement = () => {
  const { data: session } = useSession();

  const [myOrg, setMyOrg] = useState(null);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);

  const categories = [
    "Technology",
    "Music",
    "Business",
    "Education",
    "Sports",
    "Health",
    "Art & Culture",
    "Workshop",
    "Conference",
    "Entertainment",
    "Other",
  ];

  const {
  register,
  handleSubmit,
  reset,
  control,
  formState: { errors },
} = useForm({
  defaultValues: {
    title: "",
    category: "",
    location: "",
    date: "",
    ticketPrice: "",
    seats: "",
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
        const org = await myOrganization(email);

        setMyOrg(org);
      } catch (error) {
        console.error(error);

        toast.error("Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [session?.user?.email]);

  // ==========================================
  // GET EVENTS
  // ==========================================

  useEffect(() => {
    const fetchEvents = async () => {
      if (!myOrg?._id) return;

      try {
        setEventLoading(true);

        const data = await myEvents(myOrg._id);

        setEvents(data || []);
      } catch (error) {
        console.error(error);

        toast.error("Failed to load events");
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvents();
  }, [myOrg?._id]);

  // ==========================================
  // CREATE / UPDATE EVENT
  // ==========================================

  const onSubmit = async (data) => {
    try {
      if (!session?.user?.email) {
        toast.error("User session not found");
        return;
      }

      if (!myOrg?._id) {
        toast.error("Please create an organization first");
        return;
      }

      setSubmitting(true);

      // ======================================
      // UPLOAD BANNER
      // ======================================

      let banner = editingEvent?.banner || "";

      if (data.banner?.length > 0) {
        banner = await uploadImage(data.banner[0]);
      }

      if (!banner) {
        toast.error("Please upload a banner image");
        return;
      }

      // ======================================
      // EVENT DATA
      // ======================================

      const eventData = {
        title: data.title,
        category: data.category,
        location: data.location,
        date: data.date,
        ticketPrice: Number(data.ticketPrice),
        seats: Number(data.seats),
        banner,

        organizerEmail: session.user.email,

        organizationId: myOrg._id,

        status: "pending",
      };

      // ======================================
      // UPDATE EXISTING EVENT
      // ======================================

      if (editingEvent?._id) {
        const result = await updateEvent(
          eventData,
          editingEvent._id
        );

        if (result?.matchedCount > 0) {
          setEvents((previousEvents) =>
            previousEvents.map((event) =>
              event._id === editingEvent._id
                ? {
                    ...event,
                    ...eventData,
                  }
                : event
            )
          );

          toast.success(
            "Event updated and sent for approval"
          );

          setEditingEvent(null);

          reset({
            title: "",
            category: "",
            location: "",
            date: "",
            ticketPrice: "",
            seats: "",
          });
        }

        return;
      }

      // ======================================
      // CREATE NEW EVENT
      // ======================================

      const result = await addEvent(eventData);

      if (result?.insertedId) {
        const newEvent = {
          ...eventData,
          _id: result.insertedId,
        };

        setEvents((previousEvents) => [
          newEvent,
          ...previousEvents,
        ]);

        toast.success(
          "Event created and sent for approval"
        );

        reset({
          title: "",
          category: "",
          location: "",
          date: "",
          ticketPrice: "",
          seats: "",
        });
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // EDIT EVENT
  // ==========================================

  const handleEdit = (event) => {
    setEditingEvent(event);

    reset({
      title: event.title || "",
      category: event.category || "",
      location: event.location || "",
      date: event.date || "",
      ticketPrice: event.ticketPrice ?? "",
      seats: event.seats ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingEvent(null);

    reset({
      title: "",
      category: "",
      location: "",
      date: "",
      ticketPrice: "",
      seats: "",
    });
  };

  // ==========================================
  // DELETE EVENT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      const result = await deleteEvent(id);

      if (result?.deletedCount > 0) {
        setEvents((previousEvents) =>
          previousEvents.filter(
            (event) => event._id !== id
          )
        );

        toast.success(
          "Event deleted successfully"
        );

        if (editingEvent?._id === id) {
          handleCancelEdit();
        }
      } else {
        toast.error("Event was not deleted");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message ||
          "Failed to delete event"
      );
    }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-green-500/10 text-green-400 border-green-500/20";
    }

    if (status === "rejected") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div>
        <DashboardHeading
          title="Event Management"
          description="Create, update and manage your events"
        />

        <div className="mt-6">
          <Card className="border border-white/5 bg-slate-900/40">
            <div className="p-6 text-slate-400">
              Loading organization...
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO ORGANIZATION
  // ==========================================

  if (!myOrg) {
    return (
      <div>
        <DashboardHeading
          title="Event Management"
          description="Create, update and manage your events"
        />

        <Card className="mt-6 border border-white/5 bg-slate-900/40">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white">
              Organization Required
            </h3>

            <p className="mt-2 text-slate-400">
              Please create your organization profile
              before creating an event.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div>
      <DashboardHeading
        title="Event Management"
        description="Create, update and manage your events"
      />

      {/* ======================================
          FORM
      ====================================== */}

      <div className="mt-6 max-w-3xl">
        <Card
          className="rounded-2xl border border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl"
          radius="lg"
        >
          <CardHeader className="flex flex-col items-start gap-1 border-b border-white/5 p-6 pb-4">
            <h3 className="text-xl font-bold text-white">
              {editingEvent
                ? "Update Event"
                : "Create Event"}
            </h3>

            <p className="text-xs text-slate-400">
              {editingEvent
                ? "Updating an event will send it back for approval."
                : "Create a new event and submit it for approval."}
            </p>
          </CardHeader>

          <div className="p-6">
            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-5"
            >

              {/* TITLE */}

              <div className="w-full">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Event Title
                </label>

                <Input
                  {...register("title", {
                    required:
                      "Event title is required",
                  })}
                  id="title"
                  placeholder="Tech Conference 2026"
                  className="w-full bg-slate-900/50"
                />

                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              
{/* CATEGORY */}

<div className="w-full">
  <Controller
    name="category"
    control={control}
    rules={{
      required: "Category is required",
    }}
    render={({ field }) => (
      <Select
        className="w-full"
        placeholder="Select category"
        selectedKeys={
          field.value
            ? new Set([field.value])
            : new Set()
        }
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];

          field.onChange(
            selectedKey
              ? String(selectedKey)
              : ""
          );
        }}
      >
        <Label>Category</Label>

        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox>
            {categories.map((category) => (
              <ListBox.Item
                key={category}
                id={category}
                textValue={category}
              >
                {category}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    )}
  />

  {errors.category && (
    <p className="mt-1 text-sm text-red-500">
      {errors.category.message}
    </p>
  )}
</div>
              {/* LOCATION */}

              <div className="w-full">
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Location
                </label>

                <Input
                  {...register("location", {
                    required:
                      "Location is required",
                  })}
                  id="location"
                  placeholder="Dhaka, Bangladesh"
                  className="w-full bg-slate-900/50"
                />

                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* DATE */}

              <div className="w-full">
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Event Date
                </label>

                <Input
                  {...register("date", {
                    required:
                      "Event date is required",
                  })}
                  id="date"
                  type="date"
                  className="w-full bg-slate-900/50"
                />

                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* TICKET PRICE */}

              <div className="w-full">
                <label
                  htmlFor="ticketPrice"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Ticket Price (USD)
                </label>

                <Input
                  {...register("ticketPrice", {
                    required:
                      "Ticket price is required",
                    min: {
                      value: 0,
                      message:
                        "Ticket price cannot be negative",
                    },
                  })}
                  id="ticketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.00"
                  className="w-full bg-slate-900/50"
                />

                {errors.ticketPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ticketPrice.message}
                  </p>
                )}
              </div>

              {/* SEATS */}

              <div className="w-full">
                <label
                  htmlFor="seats"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Number of Seats
                </label>

                <Input
                  {...register("seats", {
                    required:
                      "Number of seats is required",
                    min: {
                      value: 1,
                      message:
                        "Seats must be at least 1",
                    },
                  })}
                  id="seats"
                  type="number"
                  min="1"
                  placeholder="100"
                  className="w-full bg-slate-900/50"
                />

                {errors.seats && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.seats.message}
                  </p>
                )}
              </div>

              {/* BANNER */}

              <div className="w-full">
                <label
                  htmlFor="banner"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Banner Image
                </label>

                <Input
                  {...register("banner", {
                    required: !editingEvent
                      ? "Banner image is required"
                      : false,
                  })}
                  id="banner"
                  type="file"
                  accept="image/*"
                  className="w-full bg-slate-900/50"
                />

                {editingEvent?.banner && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-slate-400">
                      Current banner:
                    </p>

                    <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                      <Image
                        src={editingEvent.banner}
                        alt={
                          editingEvent.title
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Select a new image only if
                      you want to replace the
                      current banner.
                    </p>
                  </div>
                )}

                {errors.banner && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.banner.message}
                  </p>
                )}
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  isDisabled={submitting}
                  className="h-11 bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-500"
                  radius="lg"
                >
                  {submitting
                    ? "Saving..."
                    : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                </Button>

                {editingEvent && (
                  <Button
                    type="button"
                    onPress={handleCancelEdit}
                    className="h-11 bg-slate-700 px-6 font-semibold text-white hover:bg-slate-600"
                    radius="lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>

            </Form>
          </div>
        </Card>
      </div>

      {/* ======================================
          EVENTS
      ====================================== */}

      <div className="mt-8">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="text-xl font-bold text-white">
              My Events
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Manage your events and approval status.
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {events.length}{" "}
            {events.length === 1
              ? "Event"
              : "Events"}
          </span>

        </div>

        {eventLoading ? (

          <Card className="border border-white/5 bg-slate-900/40">
            <div className="p-6 text-slate-400">
              Loading events...
            </div>
          </Card>

        ) : events.length === 0 ? (

          <Card className="border border-white/5 bg-slate-900/40">

            <div className="p-10 text-center">

              <h4 className="text-lg font-semibold text-white">
                No events yet
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Create your first event using the
                form above.
              </p>

            </div>

          </Card>

        ) : (

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {events.map((event) => (

              <Card
                key={event._id}
                className="overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl"
              >

                {/* BANNER */}

                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">

                  <Image
                    src={event.banner}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />

                </div>

                <div className="p-5">

                  {/* TITLE + STATUS */}

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h4 className="text-lg font-bold text-white">
                        {event.title}
                      </h4>

                      <p className="mt-1 text-sm text-slate-400">
                        {event.category}
                      </p>

                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                        event.status
                      )}`}
                    >
                      {event.status ||
                        "pending"}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 space-y-2 text-sm">

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Location
                      </span>

                      <span className="text-right text-slate-300">
                        {event.location}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Date
                      </span>

                      <span className="text-slate-300">
                        {event.date}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Ticket
                      </span>

                      <span className="text-slate-300">
                        {Number(
                          event.ticketPrice
                        ) === 0
                          ? "Free"
                          : `$${Number(
                              event.ticketPrice
                            ).toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Seats
                      </span>

                      <span className="text-slate-300">
                        {event.seats}
                      </span>
                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex gap-3 border-t border-white/5 pt-4">

                    <Button
                      onPress={() =>
                        handleEdit(event)
                      }
                      className="flex-1 bg-indigo-600 text-white hover:bg-indigo-500"
                      radius="lg"
                    >
                      Edit
                    </Button>

                    <Button
                      onPress={() =>
                        handleDelete(
                          event._id
                        )
                      }
                      className="flex-1 border border-red-500/20 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                      radius="lg"
                    >
                      Delete
                    </Button>

                  </div>

                </div>

              </Card>

            ))}

          </div>

        )}

      </div>
    </div>
  );
};

export default EventManagement;