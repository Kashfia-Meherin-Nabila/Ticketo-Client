"use client";
import React, { useEffect, useState } from "react";
import { getOrganizerEventsByEmail } from "@/lib/api/events/data";
import { deleteEvent } from "@/lib/api/events/action";
import { authClient } from "@/lib/auth-client";
// import EditEventModal from "@/components/organizer/EditEventModal"; // Adjust import path
import Swal from "sweetalert2";
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiPlus,
} from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";
import Link from "next/link";
import EditEventModal from "@/components/EditEventModal";
import Image from "next/image";

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Retrieve session from BetterAuth
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const userEmail = session?.user?.email;

  useEffect(() => {
    const loadEvents = async () => {
      if (!userEmail) return;
      setIsFetching(true);

      try {
        const data = await getOrganizerEventsByEmail(userEmail);
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsFetching(false);
      }
    };

    loadEvents();
  }, [userEmail]);

  // SweetAlert2 Delete Confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this event deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#1f2937",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#131927",
      color: "#f3f4f6",
      customClass: {
        popup: "border border-gray-800 rounded-2xl shadow-2xl",
        confirmButton: "px-4 py-2 rounded-xl text-sm font-medium",
        cancelButton:
          "px-4 py-2 rounded-xl text-sm font-medium border border-gray-700",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeletingId(id);
        try {
          const res = await deleteEvent(id);
          if (res?.deletedCount > 0 || res?.acknowledged) {
            setEvents((prev) => prev.filter((e) => e._id !== id));
            Swal.fire({
              title: "Deleted!",
              text: "Your event has been removed.",
              icon: "success",
              background: "#131927",
              color: "#f3f4f6",
              confirmButtonColor: "#ec4899",
            });
          } else {
            throw new Error("Deletion failed");
          }
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the event.",
            icon: "error",
            background: "#131927",
            color: "#f3f4f6",
            confirmButtonColor: "#f43f5e",
          });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleUpdateSuccess = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((item) => (item._id === updatedEvent._id ? updatedEvent : item)),
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  const isLoading = isAuthPending || isFetching;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131927] p-6 rounded-2xl border border-gray-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Manage Events
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track approval status, edit listings, and manage capacity for all
            your events.
          </p>
        </div>
        <Link
          href="/dashboard/organizer/add-event"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition shadow-lg shadow-pink-500/20 text-sm"
        >
          <FiPlus className="text-lg" />
          Create Event
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-[#131927] rounded-2xl border border-gray-800/80 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm">
              Loading your organization&apos;s events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center text-gray-400 space-y-4">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto text-gray-500 border border-gray-700/50">
              <HiOutlineTicket className="text-3xl" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                No Events Found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                No events registered under your organization yet.
              </p>
            </div>
            <Link
              href="/dashboard/organizer/add-event"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition border border-gray-700"
            >
              <FiPlus className="text-base" /> Create First Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#182032] border-b border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Date & Location</th>
                  <th className="py-4 px-6">Price & Capacity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm">
                {events.map((event) => (
                  <tr
                    key={event._id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Banner & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <Image
                          src={event.banner || "/placeholder-event.jpg"}
                          alt={event.title}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-700/60 bg-gray-900 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <p className="font-medium text-white line-clamp-1">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            ID: {event._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700/50">
                        <FiTag className="text-pink-400 text-xs" />
                        {event.category}
                      </span>
                    </td>

                    {/* Date & Location */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="space-y-1 text-gray-300">
                        <div className="flex items-center gap-2 text-xs">
                          <FiCalendar className="text-gray-400 text-sm" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FiMapPin className="text-gray-400 text-sm" />
                          <span className="capitalize">{event.location}</span>
                        </div>
                      </div>
                    </td>

                    {/* Ticket Price & Seats */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-white font-semibold">
                        ${event.ticketPrice}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {event.seats} seats available
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(event.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition border border-transparent hover:border-gray-700"
                          title="Edit Event"
                        >
                          <FiEdit className="text-base" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          disabled={deletingId === event._id}
                          className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-500/20 disabled:opacity-50"
                          title="Delete Event"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Render Edit Modal Component */}
      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
