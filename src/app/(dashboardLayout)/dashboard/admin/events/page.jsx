"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiTrash2,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { adminEvents } from "@/lib/api/admin/data";
import {
  approveEvent,
  rejectEvent,
  deleteAdminEvent,
} from "@/lib/api/admin/action";

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");

  // =========================
  // Load events
  // =========================
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        const data = await adminEvents({
          page,
          limit: 10,
          search,
          status,
        });

        setEvents(data?.events || []);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        toast.error(
          error?.message || "Failed to load events"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [page, search, status]);

  // =========================
  // Change status tab
  // =========================
  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  // =========================
  // Search
  // =========================
  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // =========================
  // Approve
  // =========================
  const handleApprove = async (id) => {
    try {
      const result = await approveEvent(id);

      if (result?.success === false) {
        throw new Error(
          result?.message || "Failed to approve event"
        );
      }

      toast.success("Event approved successfully");

      setEvents((current) =>
        current.filter((event) => event._id !== id)
      );
    } catch (error) {
      toast.error(
        error?.message || "Failed to approve event"
      );
    }
  };

  // =========================
  // Reject
  // =========================
  const handleReject = async (id) => {
    try {
      const result = await rejectEvent(id);

      if (result?.success === false) {
        throw new Error(
          result?.message || "Failed to reject event"
        );
      }

      toast.success("Event rejected successfully");

      setEvents((current) =>
        current.filter((event) => event._id !== id)
      );
    } catch (error) {
      toast.error(
        error?.message || "Failed to reject event"
      );
    }
  };

  // =========================
  // Delete
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      const result = await deleteAdminEvent(id);

      if (result?.success === false) {
        throw new Error(
          result?.message || "Failed to delete event"
        );
      }

      toast.success("Event deleted successfully");

      setEvents((current) =>
        current.filter((event) => event._id !== id)
      );
    } catch (error) {
      toast.error(
        error?.message || "Failed to delete event"
      );
    }
  };

  // =========================
  // Format date
  // =========================
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================
            Header
        ========================= */}
        <div>
          <p className="text-sm font-medium text-violet-400">
            ADMIN / EVENTS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Event Moderation
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review, approve, reject and manage platform events.
          </p>
        </div>

        {/* =========================
            Search
        ========================= */}
        <Card className="border border-white/10 bg-white/4 p-5">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-500" />

            <Input
              value={search}
              onChange={handleSearch}
              placeholder="Search events..."
              className="w-full"
            />
          </div>
        </Card>

        {/* =========================
            Status Tabs
        ========================= */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/3 p-2">

          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleStatusChange(tab)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium capitalize transition ${
                status === tab
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* =========================
            Loading
        ========================= */}
        {loading ? (
          <Card className="flex min-h-75 items-center justify-center border border-white/10 bg-white/4">
            <p className="text-sm text-gray-500">
              Loading events...
            </p>
          </Card>
        ) : events.length === 0 ? (
          /* =========================
              Empty
          ========================= */
          <Card className="flex min-h-75 flex-col items-center justify-center border border-white/10 bg-white/4 px-5 text-center">

            <FiCalendar className="text-4xl text-gray-600" />

            <h3 className="mt-4 text-lg font-semibold">
              No {status} events found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try another status or search term.
            </p>

          </Card>
        ) : (
          <>
            {/* =========================
                Events
            ========================= */}
            <div className="grid gap-5">

              {events.map((event) => (
                <Card
                  key={event._id}
                  className="border border-white/10 bg-white/4 p-5 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Event Information */}
                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-semibold">
                          {event.title}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs capitalize ${
                            event.status === "pending"
                              ? "bg-amber-500/10 text-amber-400"
                              : event.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {event.status}
                        </span>

                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Organized by{" "}
                        {event.organizerEmail || "Unknown organizer"}
                      </p>

                      {/* Event Details */}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">

                        <span className="flex items-center gap-2">
                          <FiCalendar />
                          {formatDate(event.date)}
                        </span>

                        <span className="flex items-center gap-2">
                          <FiMapPin />
                          {event.location || "No location"}
                        </span>

                        {event.category && (
                          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-violet-400">
                            {event.category}
                          </span>
                        )}

                        <span>
                          Ticket: ৳
                          {Number(event.ticketPrice || 0).toLocaleString()}
                        </span>

                        <span>
                          Seats: {event.seats ?? 0}
                        </span>

                      </div>
                    </div>

                    {/* =========================
                        Actions
                    ========================= */}
                    <div className="flex flex-wrap gap-2">

                      {event.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onPress={() =>
                              handleApprove(event._id)
                            }
                            className="bg-emerald-600 text-white"
                          >
                            <FiCheck />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            onPress={() =>
                              handleReject(event._id)
                            }
                            className="bg-amber-500/10 text-amber-400"
                          >
                            <FiX />
                            Reject
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        onPress={() =>
                          handleDelete(event._id)
                        }
                        className="bg-red-500/10 text-red-400"
                      >
                        <FiTrash2 />
                        Delete
                      </Button>

                    </div>

                  </div>
                </Card>
              ))}

            </div>

            {/* =========================
                Pagination
            ========================= */}
            <div className="flex items-center justify-between border-t border-white/10 pt-5">

              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">

                <Button
                  size="sm"
                  isDisabled={page <= 1}
                  onPress={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="border border-white/10 bg-white/4 text-gray-300"
                >
                  Previous
                </Button>

                <Button
                  size="sm"
                  isDisabled={page >= totalPages}
                  onPress={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                  className="border border-white/10 bg-white/4 text-gray-300"
                >
                  Next
                </Button>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminEventsPage;