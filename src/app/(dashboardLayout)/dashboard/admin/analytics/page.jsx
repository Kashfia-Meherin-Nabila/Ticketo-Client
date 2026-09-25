"use client";

import React from "react";
import { Card } from "@heroui/react";
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiActivity,
} from "react-icons/fi";

const AdminAnalyticsPage = () => {
  const monthlyData = [
    { month: "Jan", users: 120, bookings: 340 },
    { month: "Feb", users: 180, bookings: 420 },
    { month: "Mar", users: 250, bookings: 510 },
    { month: "Apr", users: 310, bookings: 620 },
    { month: "May", users: 390, bookings: 740 },
    { month: "Jun", users: 480, bookings: 890 },
  ];

  const categories = [
    { name: "Music", percentage: 32 },
    { name: "Technology", percentage: 24 },
    { name: "Business", percentage: 18 },
    { name: "Sports", percentage: 14 },
    { name: "Other", percentage: 12 },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

        <div>
          <p className="text-sm font-medium text-violet-400">
            ADMIN / ANALYTICS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            System Analytics
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor platform growth and performance.
          </p>
        </div>

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Users",
              value: "1,248",
              icon: <FiUsers />,
            },
            {
              title: "Events",
              value: "324",
              icon: <FiCalendar />,
            },
            {
              title: "Bookings",
              value: "8,642",
              icon: <FiActivity />,
            },
            {
              title: "Revenue",
              value: "$48,920",
              icon: <FiDollarSign />,
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="border border-white/10 bg-white/4 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {item.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {item.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  {item.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Growth */}
        <Card className="border border-white/10 bg-white/4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Platform Growth
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Users and bookings over the last 6 months
              </p>
            </div>

            <FiTrendingUp className="text-xl text-emerald-400" />
          </div>

          <div className="mt-8 flex h-72 items-end gap-3 sm:gap-6">
            {monthlyData.map((item) => (
              <div
                key={item.month}
                className="flex h-full flex-1 flex-col justify-end"
              >
                <div className="flex items-end justify-center gap-1 sm:gap-2">
                  <div
                    className="w-full max-w-8 rounded-t-lg bg-violet-500/70"
                    style={{
                      height: `${item.users / 2}px`,
                    }}
                    title={`Users: ${item.users}`}
                  />

                  <div
                    className="w-full max-w-8 rounded-t-lg bg-indigo-500/40"
                    style={{
                      height: `${item.bookings / 3}px`,
                    }}
                    title={`Bookings: ${item.bookings}`}
                  />
                </div>

                <p className="mt-3 text-center text-xs text-gray-500">
                  {item.month}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Users
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Bookings
            </span>
          </div>
        </Card>

        {/* Categories */}
        <Card className="border border-white/10 bg-white/4 p-6">
          <h2 className="text-lg font-semibold">
            Event Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Distribution of events by category
          </p>

          <div className="mt-6 space-y-5">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-300">
                    {category.name}
                  </span>

                  <span className="text-gray-500">
                    {category.percentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{
                      width: `${category.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;