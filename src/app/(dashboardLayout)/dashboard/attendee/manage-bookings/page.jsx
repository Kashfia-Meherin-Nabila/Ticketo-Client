"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineTicket,
  HiOutlineCheckCircle,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  getUserBookings,
  updateBookingQuantity,
  cancelBooking,
} from "@/lib/api/bookings/data";

export default function ManageBookingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for editing quantity
  const [editingBooking, setEditingBooking] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [updating, setUpdating] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login?callbackUrl=/dashboard/attendee/my-bookings");
    }
  }, [session, isPending, router]);

  // Load user bookings cleanly without synchronous setState warnings
  const loadBookings = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      const data = await getUserBookings(session.user.email);
      setBookings(data);
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      queueMicrotask(() => {
        loadBookings();
      });
    }
  }, [session?.user?.email]);

  // Handle quantity edit submission
  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      setUpdating(true);
      const res = await updateBookingQuantity(editingBooking._id, newQuantity);

      if (res?.message && !res?.success) {
        throw new Error(res.message);
      }

      toast.success("Ticket quantity updated!");
      setEditingBooking(null);
      await loadBookings();
    } catch (error) {
      toast.error(error.message || "Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  // Handle booking cancellation with SweetAlert2
  const handleCancelBooking = (bookingId, eventTitle) => {
    Swal.fire({
      title: "Cancel Booking?",
      text: `Are you sure you want to cancel your reservation for "${eventTitle}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "Keep booking",
      background: "#0f172a",
      color: "#f8fafc",
      customClass: {
        popup: "rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl",
        title: "text-xl font-extrabold text-white",
        htmlContainer: "text-sm text-slate-300",
        confirmButton: "rounded-xl px-5 py-2.5 text-xs font-semibold shadow-lg",
        cancelButton: "rounded-xl px-5 py-2.5 text-xs font-semibold",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await cancelBooking(bookingId);

          if (res?.message && !res?.success) {
            throw new Error(res.message);
          }

          Swal.fire({
            title: "Cancelled!",
            text: "Your booking has been successfully cancelled.",
            icon: "success",
            background: "#0f172a",
            color: "#f8fafc",
            confirmButtonColor: "#4f46e5",
            customClass: {
              popup: "rounded-2xl border border-white/10 shadow-2xl",
              confirmButton: "rounded-xl px-5 py-2.5 text-xs font-semibold",
            },
          });

          await loadBookings();
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to cancel booking.",
            icon: "error",
            background: "#0f172a",
            color: "#f8fafc",
            confirmButtonColor: "#e11d48",
          });
        }
      }
    });
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter(
    (b) =>
      b.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-300">
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Manage Orders
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View, edit ticket quantities, or cancel active reservations.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-72">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by event or TXN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      {filteredBookings.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <HiOutlineTicket className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">
            No Bookings Found
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            {searchQuery
              ? "No bookings matched your search query."
              : "You haven't reserved any tickets yet."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Transaction Ref</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((item) => (
                  <tr key={item._id} className="transition hover:bg-white/2">
                    <td className="px-6 py-4 font-semibold text-white">
                      {item.eventTitle}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {item.transactionId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-400">
                        {item.quantity} Pass(es)
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {Number(item.amount) === 0 ? "Free" : `$${item.amount}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                        {item.paymentStatus || "Confirmed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(
                        item.bookingDate || item.createdAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => {
                            setEditingBooking(item);
                            setNewQuantity(item.quantity || 1);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
                          title="Edit Quantity"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4" />
                          Edit
                        </button>

                        {/* CANCEL BUTTON */}
                        <button
                          onClick={() =>
                            handleCancelBooking(item._id, item.eventTitle)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-600 hover:text-white"
                          title="Cancel Booking"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT QUANTITY MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                Update Ticket Quantity
              </h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuantity} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-400">Event</p>
                <p className="font-semibold text-white">
                  {editingBooking.eventTitle}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
