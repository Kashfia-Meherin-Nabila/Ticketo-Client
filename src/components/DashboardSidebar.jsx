"use client";

import React from "react";
import Logo from "@/components/Logo";
import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  FaBuilding,
  FaCalendarAlt,
  FaHistory,
  FaHome,
  FaPlus,
  FaSignOutAlt,
  FaTicketAlt,
  FaUserCircle,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";
import { BiBookAdd, BiChart, BiDollarCircle, BiUser } from "react-icons/bi";

const DashboardSidebar = () => {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Navigation Menus per Role
  const organizerMenu = [
    {
      key: "overview",
      label: "Overview",
      icon: FaUsers,
      href: "/dashboard/organizer",
    },
    {
      key: "organization",
      label: "Organization",
      icon: FaBuilding,
      href: "/dashboard/organizer/organization",
    },
    {
      key: "add-event",
      label: "Add Event",
      icon: FaPlus,
      href: "/dashboard/organizer/add-event",
    },
    {
      key: "manage-events",
      label: "Manage Events",
      icon: FaCalendarAlt,
      href: "/dashboard/organizer/manage-events",
    },
    {
      key: "pricing",
      label: "Pricing",
      icon: FaCalendarAlt,
      href: "/dashboard/organizer/pricing",
    },
    {
      key: "payment-history",
      label: "Payment-history",
      icon: BiDollarCircle,
      href: "/dashboard/organizer/payment-history",
    },
    {
      key: "attendees",
      label: "Attendees",
      icon: FaUsers,
      href: "/dashboard/organizer/attendees",
    },
  ];

  const attendeeMenu = [
    {
      key: "overview",
      label: "Overview",
      icon: FaUserCircle,
      href: "/dashboard/attendee",
    },
    {
      key: "tickets",
      label: "My Tickets",
      icon: FaTicketAlt,
      href: "/dashboard/attendee/tickets",
    },
    {
      key: "manage-bookings",
      label: "Manage Bookings",
      icon: BiBookAdd,
      href: "/dashboard/attendee/manage-bookings",
    },
    {
      key: "payments",
      label: "Payments",
      icon: FaHistory,
      href: "/dashboard/attendee/payments",
    },
    {
      key: "profile",
      label: "Profile",
      icon: BiUser,
      href: "/dashboard/attendee/profile",
    },
  ];

  const adminMenu = [
    {
      key: "overview",
      label: "Overview",
      icon: FaUserCircle,
      href: "/dashboard/admin",
    },
    {
      key: "users",
      label: "Users",
      icon: FaUserShield,
      href: "/dashboard/admin/users",
    },
    {
      key: "events",
      label: "Approve Events",
      icon: FaCalendarAlt,
      href: "/dashboard/admin/events",
    },
    {
      key: "transactions",
      label: "Transaction Logs",
      icon: FaHistory,
      href: "/dashboard/admin/transactions",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: BiChart,
      href: "/dashboard/admin/analytics",
    },
  ];

  // Derive active menu based on role
  const role = session?.user?.role;
  const menuItems =
    role === "organizer"
      ? organizerMenu
      : role === "attendee"
      ? attendeeMenu
      : role === "admin"
      ? adminMenu
      : [];

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="w-64 h-screen border-r border-white/5 sticky top-0">
      <div className="h-full flex flex-col bg-slate-950/80 backdrop-blur-xl">
        {/* Brand / Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <Logo />
        </div>

        {/* User Profile */}
        <div className="px-6 py-5 border-b border-white/5">
          {isPending ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-2 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500/60 shrink-0">
                <Image
                  width={40}
                  height={40}
                  src={
                    session?.user?.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      session?.user?.name || "User"
                    )}&background=7c3aed&color=fff&bold=true`
                  }
                  unoptimized
                  alt="Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate leading-tight">
                  {session?.user?.name || "User"}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    role === "admin"
                      ? "text-yellow-400"
                      : role === "organizer"
                      ? "text-indigo-400"
                      : "text-pink-400"
                  }`}
                >
                  {role || "Guest"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="grow overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 pb-2">
            Navigation
          </p>

          {isPending ? (
            <div className="space-y-2 px-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-900/50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            menuItems.map(({ key, label, icon: Icon, href }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={key}
                  href={href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-linear-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-400 shadow-sm shadow-pink-400" />
                  )}
                </Link>
              );
            })
          )}
        </nav>

        {/* Bottom Links */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <FaHome size={13} />
            </span>
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <FaSignOutAlt size={13} />
            </span>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;