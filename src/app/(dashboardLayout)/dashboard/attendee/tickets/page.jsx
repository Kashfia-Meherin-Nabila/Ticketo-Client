"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import {
  HiOutlineTicket,
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

export default function AttendeeTicketsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect unauthenticated users
  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login?callbackUrl=/dashboard/attendee/tickets");
    }
  }, [session, isPending, router]);

  // Fetch bookings for current user
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/bookings/user/${session.user.email}`
        );
        if (!res.ok) throw new Error("Failed to load tickets");
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error("Fetch tickets error:", error);
        toast.error("Could not fetch your booked tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [session]);

  // Print single ticket handler
  const handlePrint = (booking) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${booking.eventTitle}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; }
            .ticket-box { max-width: 600px; margin: 0 auto; border: 2px dashed #6366f1; padding: 30px; border-radius: 20px; background: #ffffff; }
            h1 { font-size: 24px; margin-bottom: 10px; color: #4f46e5; }
            .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
            .label { font-weight: 600; color: #475569; }
            .val { font-weight: 700; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: bold; }
            .txn { font-family: monospace; font-size: 12px; color: #64748b; background: #f1f5f9; padding: 6px 10px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            <span class="badge">CONFIRMED TICKET</span>
            <h1>${booking.eventTitle}</h1>
            <p class="meta">Attendee: ${booking.attendeeEmail}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <div class="row">
              <span class="label">Quantity:</span>
              <span class="val">${booking.quantity} Ticket(s)</span>
            </div>
            <div class="row">
              <span class="label">Total Paid:</span>
              <span class="val">${booking.amount === 0 ? "Free" : `৳${booking.amount}`}</span>
            </div>
            <div class="row">
              <span class="label">Booking Date:</span>
              <span class="val">${new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="row" style="margin-top: 20px;">
              <span class="label">Transaction ID:</span>
              <span class="txn">${booking.transactionId}</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Search filter
  const filteredBookings = bookings.filter((item) =>
    item.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-300">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              My Wallet
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">
            Event Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Access and manage all your upcoming event passes and confirmations.
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
            className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Bookings
          </p>
          <p className="mt-2 text-3xl font-black text-white">{bookings.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Tickets
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-400">
            {bookings.filter((b) => b.paymentStatus !== "cancelled").length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Spent
          </p>
          <p className="mt-2 text-3xl font-black text-indigo-400">
            ৳{bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)}
          </p>
        </div>
      </div>

      {/* TICKETS GRID */}
      {filteredBookings.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <HiOutlineTicket className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">No Tickets Found</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            {searchQuery
              ? "No tickets matched your search query."
              : "You haven't booked any event tickets yet. Browse available events and reserve your spot!"}
          </p>
          <button
            onClick={() => router.push("/events")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            Explore Events
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {filteredBookings.map((ticket) => (
            <div
              key={ticket._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl backdrop-blur-xl transition hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              {/* TOP HEADER */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <HiOutlineCheckCircle className="h-4 w-4" />
                      {ticket.paymentStatus || "Confirmed"}
                    </span>
                    <h2 className="mt-3 text-xl font-bold text-white transition group-hover:text-indigo-300">
                      {ticket.eventTitle}
                    </h2>
                  </div>

                  {/* QR CODE DISPLAY */}
                  <div className="shrink-0 rounded-2xl bg-white p-2.5 shadow-md">
                    <QRCodeSVG
                      value={JSON.stringify({
                        bookingId: ticket._id,
                        txn: ticket.transactionId,
                        email: ticket.attendeeEmail,
                      })}
                      size={72}
                    />
                  </div>
                </div>

                {/* TICKET DETAILS GRID */}
                <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-white/2 p-4 text-xs">
                  <div>
                    <p className="text-slate-500">Pass Quantity</p>
                    <p className="mt-1 font-semibold text-white">
                      {ticket.quantity || 1} Ticket(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Amount Paid</p>
                    <p className="mt-1 font-semibold text-indigo-400">
                      {Number(ticket.amount) === 0 ? "Free" : `৳${ticket.amount}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Booking Date</p>
                    <p className="mt-1 font-medium text-slate-300">
                      {new Date(
                        ticket.bookingDate || ticket.createdAt
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Transaction Ref</p>
                    <p className="mt-1 truncate font-mono text-slate-300">
                      {ticket.transactionId}
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD FOOTER ACTIONS */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  onClick={() => router.push(`/events/${ticket.eventId}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 transition hover:text-indigo-300"
                >
                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                  View Event Details
                </button>

                <button
                  onClick={() => handlePrint(ticket)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  <HiOutlineArrowDownTray className="h-4 w-4" />
                  Print Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}