"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { adminStats } from "@/lib/api/admin/data";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const data = await adminStats();

        setStats(data);
      } catch (error) {
        console.error(error);

        toast.error(
          error?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <FiUsers />,
    },
    {
      title: "Total Events",
      value: stats?.totalEvents || 0,
      icon: <FiCalendar />,
    },
    {
      title: "Total Revenue",
      value: `$${Number(
        stats?.totalRevenue || 0
      ).toLocaleString()}`,
      icon: <FiDollarSign />,
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: <FiActivity />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div>
          <p className="text-sm font-medium text-violet-400">
            ADMIN PANEL
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor your event platform.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="border border-white/10 bg-white/4 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    {stat.value}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-400">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Moderation summary */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Card className="border border-amber-500/10 bg-amber-500/4 p-5">
            <p className="text-sm text-gray-500">
              Pending Events
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {stats?.pendingEvents || 0}
            </p>
          </Card>

          <Card className="border border-emerald-500/10 bg-emerald-500/4 p-5">
            <p className="text-sm text-gray-500">
              Approved Events
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {stats?.approvedEvents || 0}
            </p>
          </Card>

          <Card className="border border-red-500/10 bg-red-500/4 p-5">
            <p className="text-sm text-gray-500">
              Rejected Events
            </p>

            <p className="mt-2 text-2xl font-bold text-red-400">
              {stats?.rejectedEvents || 0}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;