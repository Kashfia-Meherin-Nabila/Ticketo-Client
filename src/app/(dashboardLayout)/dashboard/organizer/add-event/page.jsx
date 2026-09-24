"use client";

import DashboardHeading from "@/components/DashboardHeading";
import { useSession } from "@/lib/auth-client";
import { uploadImage } from "@/utils/uploadImage";

import { myOrganization } from "@/lib/api/organization/data";

import { Button, Card, CardHeader, Form, Input } from "@heroui/react";

import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { addEvent, deleteEvent, updateEvent } from "@/lib/api/events/action";
import { myEvents } from "@/lib/api/events/data";

const EventManagement = () => {
  const { data: session } = useSession();

  const [myOrg, setMyOrg] = useState(null);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
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

      // Upload only if user selected a new image
      if (data.banner?.length > 0) {
        banner = await uploadImage(data.banner[0]);
      }

      // New event requires banner
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

        // Important:
        // Create = pending
        // Update = pending
        status: "pending",
      };

      // ======================================
      // UPDATE EXISTING EVENT
      // ======================================

      if (editingEvent?._id) {
        const result = await updateEvent(eventData, editingEvent._id);

        if (result?.matchedCount > 0) {
          setEvents((previousEvents) =>
            previousEvents.map((event) =>
              event._id === editingEvent._id
                ? {
                    ...event,
                    ...eventData,
                  }
                : event,
            ),
          );

          toast.success("Event updated and sent for approval");

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

        setEvents((previousEvents) => [newEvent, ...previousEvents]);

        toast.success("Event created and sent for approval");

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

      toast.error(error?.message || "Something went wrong");
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
      "Are you sure you want to delete this event?",
    );

    if (!confirmed) return;

    try {
      const result = await deleteEvent(id);

      if (result?.deletedCount > 0) {
        setEvents((previousEvents) =>
          previousEvents.filter((event) => event._id !== id),
        );

        toast.success("Event deleted successfully");

        // If deleting currently edited event
        if (editingEvent?._id === id) {
          handleCancelEdit();
        }
      } else {
        toast.error("Event was not deleted");
      }
    } catch (error) {
      console.error(error);

      toast.error(error?.message || "Failed to delete event");
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
          <Card className="bg-slate-900/40 border border-white/5">
            <div className="p-6 text-slate-400">Loading organization...</div>
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

        <Card className="mt-6 bg-slate-900/40 border border-white/5">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white">
              Organization Required
            </h3>

            <p className="text-slate-400 mt-2">
              Please create your organization profile before creating an event.
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
          className="border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl"
          radius="lg"
        >
          <CardHeader className="flex flex-col items-start gap-1 pb-4 border-b border-white/5 p-6">
            <h3 className="text-xl font-bold text-white">
              {editingEvent ? "Update Event" : "Create Event"}
            </h3>

            <p className="text-slate-400 text-xs">
              {editingEvent
                ? "Updating an event will send it back for approval."
                : "Create a new event and submit it for approval."}
            </p>
          </CardHeader>

          <div className="p-6">
            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 w-full"
            >
              {/* TITLE */}

              <div className="w-full">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Event Title
                </label>

                <Input
                  {...register("title", {
                    required: "Event title is required",
                  })}
                  id="title"
                  placeholder="Tech Conference 2026"
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* CATEGORY */}

              <div className="w-full">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Category
                </label>

                <Input
                  {...register("category", {
                    required: "Category is required",
                  })}
                  id="category"
                  placeholder="Technology"
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* LOCATION */}

              <div className="w-full">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Location
                </label>

                <Input
                  {...register("location", {
                    required: "Location is required",
                  })}
                  id="location"
                  placeholder="Dhaka, Bangladesh"
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* DATE */}

              <div className="w-full">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Event Date
                </label>

                <Input
                  {...register("date", {
                    required: "Event date is required",
                  })}
                  id="date"
                  type="date"
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* TICKET PRICE */}

              <div className="w-full">
                <label
                  htmlFor="ticketPrice"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Ticket Price
                </label>

                <Input
                  {...register("ticketPrice", {
                    required: "Ticket price is required",
                    min: {
                      value: 0,
                      message: "Ticket price cannot be negative",
                    },
                  })}
                  id="ticketPrice"
                  type="number"
                  min="0"
                  placeholder="500"
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {errors.ticketPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ticketPrice.message}
                  </p>
                )}
              </div>

              {/* SEATS */}

              <div className="w-full">
                <label
                  htmlFor="seats"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Number of Seats
                </label>

                <Input
                  {...register("seats", {
                    required: "Number of seats is required",
                    min: {
                      value: 1,
                      message: "Seats must be at least 1",
                    },
                  })}
                  id="seats"
                  type="number"
                  min="1"
                  placeholder="100"
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {errors.seats && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.seats.message}
                  </p>
                )}
              </div>

              {/* BANNER */}

              <div className="w-full">
                <label
                  htmlFor="banner"
                  className="block text-sm font-medium text-white mb-2"
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
                  className="w-full bg-slate-900/50 border-white/10"
                />

                {editingEvent?.banner && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2">
                      Current banner:
                    </p>

                    <img
                      src={editingEvent.banner}
                      alt={editingEvent.title}
                      className="w-full max-w-sm h-40 object-cover rounded-xl border border-white/10"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      Select a new image only if you want to replace the current
                      banner.
                    </p>
                  </div>
                )}

                {errors.banner && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.banner.message}
                  </p>
                )}
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  isDisabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-6"
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
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold h-11 px-6"
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">My Events</h3>

            <p className="text-sm text-slate-400 mt-1">
              Manage your events and approval status.
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {events.length} {events.length === 1 ? "Event" : "Events"}
          </span>
        </div>

        {eventLoading ? (
          <Card className="bg-slate-900/40 border border-white/5">
            <div className="p-6 text-slate-400">Loading events...</div>
          </Card>
        ) : events.length === 0 ? (
          <Card className="bg-slate-900/40 border border-white/5">
            <div className="p-10 text-center">
              <h4 className="text-lg font-semibold text-white">
                No events yet
              </h4>

              <p className="text-slate-400 text-sm mt-2">
                Create your first event using the form above.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {events.map((event) => (
              <Card
                key={event._id}
                className="overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl"
              >
                {/* BANNER */}

                <img
                  src={event.banner}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">
                  {/* TITLE + STATUS */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {event.title}
                      </h4>

                      <p className="text-sm text-slate-400 mt-1">
                        {event.category}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusClass(
                        event.status,
                      )}`}
                    >
                      {event.status || "pending"}
                    </span>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Location</span>

                      <span className="text-slate-300 text-right">
                        {event.location}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>

                      <span className="text-slate-300">{event.date}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Ticket</span>

                      <span className="text-slate-300">
                        ৳{event.ticketPrice}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Seats</span>

                      <span className="text-slate-300">{event.seats}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
                    <Button
                      onPress={() => handleEdit(event)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                      radius="lg"
                    >
                      Edit
                    </Button>

                    <Button
                      onPress={() => handleDelete(event._id)}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20"
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
