"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";
import { BsFillTicketFill } from "react-icons/bs";
import { getAttendeeOverview } from "@/lib/api/bookings/data";
import Image from "next/image";

export default function AttendeeOverviewPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const [stats, setStats] = useState({
  totalTickets: 0,
  upcomingEvents: 0,
  totalSpent: 0,
});
const [recentTickets, setRecentTickets] = useState([]);
const [loadedEmail, setLoadedEmail] = useState(null);

const isLoading = Boolean(session?.user?.email) && loadedEmail !== session?.user?.email;

  useEffect(() => {
  const email = session?.user?.email;
  if (!email) return; // no setState here — isLoading is derived below

  let cancelled = false;

  getAttendeeOverview(email).then((data) => {
    if (cancelled) return;
    setStats(data.stats);
    setRecentTickets(data.recentTickets);
    setLoadedEmail(email);
  });

  return () => {
    cancelled = true;
  };
}, [session?.user?.email]);

  const userName = session?.user?.name || "Attendee";

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Date TBA";

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 p-6 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-gray-800/80 p-8 rounded-3xl shadow-2xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
            Attendee Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Ready for your next experience? Track your upcoming registered events, download tickets, and review transaction receipts in one place.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
            <BsFillTicketFill className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tickets</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {isLoading ? "..." : stats.totalTickets}
            </h3>
          </div>
        </div>

        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <FiCalendar className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Events</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {isLoading ? "..." : stats.upcomingEvents}
            </h3>
          </div>
        </div>

        <div className="bg-[#131927] border border-gray-800/80 rounded-2xl p-6 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FiCreditCard className="text-2xl" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {isLoading ? "..." : `৳${stats.totalSpent}`}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HiOutlineTicket className="text-pink-500 text-xl" /> My Upcoming Events
            </h2>
            <Link
              href="/dashboard/attendee/tickets"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1"
            >
              View All Tickets <FiArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-[#131927] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 space-y-3">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm">Fetching your event passes...</p>
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="bg-[#131927] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 space-y-4">
              <HiOutlineTicket className="text-4xl text-gray-600 mx-auto" />
              <div>
                <p className="text-base font-semibold text-white">No Upcoming Tickets</p>
                <p className="text-xs text-gray-400 mt-1">
                  You haven&apos;t registered for any events yet. Browse our active listings!
                </p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold transition"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-[#131927] border border-gray-800/80 rounded-2xl p-5 shadow-xl hover:border-gray-700/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4">
                    <Image
  src={ticket.banner}
  alt={ticket.eventTitle}
  width={64}
  height={64}
  className="w-16 h-16 rounded-xl object-cover border border-gray-800 shrink-0 bg-gray-900"
/>
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        <FiCheckCircle size={10} /> {ticket.status}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {ticket.eventTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-pink-400" /> {formatDate(ticket.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin className="text-pink-400" /> {ticket.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-800/60 gap-2">
                    <span className="text-sm font-bold text-white">৳{ticket.amount}</span>
                    <Link
                      href={`/dashboard/attendee/tickets?id=${ticket.bookingId}`}
                      className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold transition border border-gray-700/60"
                    >
                      View Pass
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <div className="bg-[#131927] border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-3">
            <Link
              href="/events"
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-semibold text-white group"
            >
              <span>Explore New Events</span>
              <FiArrowRight className="text-gray-400 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard/attendee/tickets"
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-semibold text-white group"
            >
              <span>My Event Passes & QR</span>
              <FiArrowRight className="text-gray-400 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard/attendee/payments"
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-semibold text-white group"
            >
              <span>Payment History</span>
              <FiArrowRight className="text-gray-400 group-hover:text-pink-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}