"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Card } from "@heroui/react";

import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";

import { getOrganizerBookings } from "@/lib/api/bookings/data";

const statusStyles = {
  confirmed: {
    label: "Confirmed",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    icon: FaCheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
    icon: FaTimesCircle,
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

const StatusBadge = ({ status }) => {
  const config = statusStyles[status] || statusStyles.confirmed;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
};

const AttendeesPage = () => {
  const { data: session, isPending } = useSession();

  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==========================================
  // LOAD BOOKINGS
  // ==========================================

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.email) {
      router.push("/login?callbackUrl=/dashboard/organizer/attendees");

      return;
    }

    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);

        const result = await getOrganizerBookings(session.user.email);

        if (!cancelled) {
          setBookings(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Attendees error:", error);

          toast.error(
            error?.message || "Failed to load attendees."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, isPending, router]);

  // ==========================================
  // FILTERED LIST
  // ==========================================

  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      booking.attendeeEmail?.toLowerCase().includes(query) ||
      booking.eventTitle?.toLowerCase().includes(query) ||
      booking.transactionId?.toLowerCase().includes(query)
    );
  });

  // ==========================================
  // SUMMARY STATS
  // ==========================================

  const totalAttendees = bookings.reduce(
    (sum, b) => sum + (b.quantity || 0),
    0
  );

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.amount || 0),
    0
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (isPending || loading) {
    return (
      <div className="mt-6 space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-14 animate-pulse rounded-xl bg-slate-900/40"
          />
        ))}
      </div>
    );
  }

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (bookings.length === 0) {
    return (
      <Card
        className="mt-6 border-white/5 bg-slate-900/40"
        radius="lg"
      >
        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-violet-400">
            <FaUsers size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              No attendees yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Once people book tickets to your events, they&apos;ll
              show up here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="mt-6 space-y-6">

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          className="border-white/5 bg-slate-900/40"
          radius="lg"
        >
          <div className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Attendees
              </span>

              <h2 className="text-3xl font-extrabold text-white">
                {totalAttendees.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-indigo-400">
              <FaUsers size={24} />
            </div>
          </div>
        </Card>

        <Card
          className="border-white/5 bg-slate-900/40"
          radius="lg"
        >
          <div className="p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Bookings
            </span>

            <h2 className="mt-1 text-3xl font-extrabold text-white">
              {bookings.length.toLocaleString()}
            </h2>
          </div>
        </Card>

        <Card
          className="border-white/5 bg-slate-900/40"
          radius="lg"
        >
          <div className="p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Revenue From Bookings
            </span>

            <h2 className="mt-1 text-3xl font-extrabold text-white">
              {formatCurrency(totalRevenue)}
            </h2>
          </div>
        </Card>
      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="relative">
        <FaSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          size={14}
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by attendee email, event, or transaction ID..."
          className="w-full rounded-xl border border-white/5 bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <Card
        className="border-white/5 bg-slate-900/40"
        radius="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="whitespace-nowrap px-6 py-4">Attendee</th>
                <th className="whitespace-nowrap px-6 py-4">Event</th>
                <th className="whitespace-nowrap px-6 py-4">Tickets</th>
                <th className="whitespace-nowrap px-6 py-4">Amount</th>
                <th className="whitespace-nowrap px-6 py-4">Status</th>
                <th className="whitespace-nowrap px-6 py-4">Booked On</th>
                <th className="whitespace-nowrap px-6 py-4">
                  Transaction ID
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-white/5 text-sm last:border-b-0 hover:bg-white/2"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-white">
                    {booking.attendeeEmail}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-white">
                    {booking.eventTitle || "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                    {booking.quantity}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-white">
                    {formatCurrency(booking.amount)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={booking.paymentStatus} />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                    {formatDate(booking.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                    {booking.transactionId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              No attendees match your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttendeesPage;