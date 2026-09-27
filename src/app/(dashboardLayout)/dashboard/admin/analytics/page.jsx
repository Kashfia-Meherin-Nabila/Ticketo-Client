"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@heroui/react";
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiBarChart2,
  FiPieChart,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    users: 0,
    events: 0,
    bookings: 0,
    revenue: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/analytics`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load analytics");
        }

        setAnalytics(
          data.stats || {
            users: 0,
            events: 0,
            bookings: 0,
            revenue: 0,
          },
        );

        setMonthlyData(Array.isArray(data.monthlyData) ? data.monthlyData : []);

        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);

        setError(error.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString();
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  // =====================================================
  // MAX VALUES FOR CHART
  // =====================================================

  const chartMax = useMemo(() => {
    if (!monthlyData.length) {
      return 1;
    }

    const maxUsers = Math.max(
      ...monthlyData.map((item) => Number(item.users) || 0),
    );

    const maxBookings = Math.max(
      ...monthlyData.map((item) => Number(item.bookings) || 0),
    );

    return Math.max(maxUsers, maxBookings, 1);
  }, [monthlyData]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

            <p className="mt-4 text-sm text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <Card className="border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-400">
            ADMIN / ANALYTICS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            System Analytics
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor platform growth, bookings, events, and revenue.
          </p>
        </div>

        {/* ================================================= */}
        {/* KPI CARDS */}
        {/* ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* USERS */}

          <Card className="group border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {formatNumber(analytics.users)}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Registered accounts
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/10 bg-violet-500/10 text-xl text-violet-400 transition-transform duration-300 group-hover:scale-105">
                <FiUsers />
              </div>
            </div>
          </Card>

          {/* EVENTS */}

          <Card className="group border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Events</p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {formatNumber(analytics.events)}
                </p>

                <p className="mt-2 text-xs text-gray-600">Events on platform</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10 text-xl text-blue-400 transition-transform duration-300 group-hover:scale-105">
                <FiCalendar />
              </div>
            </div>
          </Card>

          {/* BOOKINGS */}

          <Card className="group border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {formatNumber(analytics.bookings)}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Ticket reservations
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10 text-xl text-emerald-400 transition-transform duration-300 group-hover:scale-105">
                <FiActivity />
              </div>
            </div>
          </Card>

          {/* REVENUE */}

          <Card className="group border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:border-amber-500/30 hover:bg-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {formatCurrency(analytics.revenue)}
                </p>

                <p className="mt-2 text-xs text-gray-600">Completed payments</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10 text-xl text-amber-400 transition-transform duration-300 group-hover:scale-105">
                <FiDollarSign />
              </div>
            </div>
          </Card>
        </div>

        {/* ================================================= */}
        {/* PLATFORM GROWTH */}
        {/* ================================================= */}

        <Card className="overflow-hidden border border-white/10 bg-white/[0.035]">
          {/* Header */}

          <div className="flex items-start justify-between border-b border-white/10 p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <FiBarChart2 />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Platform Growth</h2>

                  <p className="mt-1 text-xs text-gray-600">
                    Monthly users and bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-5 text-xs sm:flex">
              <span className="flex items-center gap-2 text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                Users
              </span>

              <span className="flex items-center gap-2 text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Bookings
              </span>
            </div>
          </div>

          {/* Chart */}

          {monthlyData.length === 0 ? (
            <div className="flex h-80 items-center justify-center">
              <div className="text-center">
                <FiBarChart2 className="mx-auto text-3xl text-gray-700" />

                <p className="mt-3 text-sm text-gray-500">
                  No growth data available.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex h-80 gap-3">
                {/* Y AXIS */}

                <div className="flex w-10 flex-col justify-between pb-8 text-right text-[10px] text-gray-700">
                  <span>{formatNumber(chartMax)}</span>

                  <span>{formatNumber(Math.round(chartMax * 0.75))}</span>

                  <span>{formatNumber(Math.round(chartMax * 0.5))}</span>

                  <span>{formatNumber(Math.round(chartMax * 0.25))}</span>

                  <span>0</span>
                </div>

                {/* GRAPH */}

                <div className="relative flex flex-1 flex-col">
                  {/* GRID */}

                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8">
                    <div className="border-t border-white/5" />
                    <div className="border-t border-white/5" />
                    <div className="border-t border-white/5" />
                    <div className="border-t border-white/5" />
                    <div className="border-t border-white/5" />
                  </div>

                  {/* BARS */}

                  <div className="relative flex flex-1 items-end justify-around gap-2 sm:gap-5">
                    {monthlyData.map((item) => {
                      const users = Number(item.users) || 0;

                      const bookings = Number(item.bookings) || 0;

                      const userHeight = (users / chartMax) * 100;

                      const bookingHeight = (bookings / chartMax) * 100;

                      return (
                        <div
                          key={`${item.year}-${item.month}`}
                          className="flex h-full flex-1 flex-col justify-end"
                        >
                          {/* BAR AREA */}

                          <div className="flex h-full items-end justify-center gap-1 sm:gap-2">
                            {/* USER BAR */}

                            <div className="group relative flex h-full w-1/2 max-w-10 items-end justify-center">
                              {users > 0 && (
                                <span className="absolute bottom-full mb-2 hidden rounded-md border border-white/10 bg-[#111827] px-2 py-1 text-[10px] text-gray-300 shadow-xl group-hover:block">
                                  {formatNumber(users)} users
                                </span>
                              )}

                              <div
                                className="w-full min-w-2 rounded-t-md bg-violet-500/70 transition-all duration-500 hover:bg-violet-500"
                                style={{
                                  height:
                                    users > 0
                                      ? `${Math.max(userHeight, 3)}%`
                                      : "0%",
                                }}
                              />
                            </div>

                            {/* BOOKING BAR */}

                            <div className="group relative flex h-full w-1/2 max-w-10 items-end justify-center">
                              {bookings > 0 && (
                                <span className="absolute bottom-full mb-2 hidden rounded-md border border-white/10 bg-[#111827] px-2 py-1 text-[10px] text-gray-300 shadow-xl group-hover:block">
                                  {formatNumber(bookings)} bookings
                                </span>
                              )}

                              <div
                                className="w-full min-w-2 rounded-t-md bg-indigo-500/50 transition-all duration-500 hover:bg-indigo-500/80"
                                style={{
                                  height:
                                    bookings > 0
                                      ? `${Math.max(bookingHeight, 3)}%`
                                      : "0%",
                                }}
                              />
                            </div>
                          </div>

                          {/* MONTH */}

                          <p className="mt-4 text-center text-[11px] font-medium text-gray-600">
                            {item.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Legend */}

              <div className="mt-5 flex justify-center gap-5 text-xs sm:hidden">
                <span className="flex items-center gap-2 text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  Users
                </span>

                <span className="flex items-center gap-2 text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Bookings
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* ================================================= */}
        {/* EVENT CATEGORIES */}
        {/* ================================================= */}

        <Card className="border border-white/10 bg-white/[0.035] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <FiPieChart />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Event Categories</h2>

                <p className="mt-1 text-xs text-gray-600">
                  Distribution of events by category
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[10px] text-gray-500 sm:block">
              {categories.length} categories
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <FiPieChart className="mx-auto text-3xl text-gray-700" />

                <p className="mt-3 text-sm text-gray-500">
                  No event category data available.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              {categories.map((category, index) => (
                <div key={`${category.name}-${index}`}>
                  {/* LABEL */}

                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-medium text-gray-400">
                        {index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-medium text-gray-300">
                          {category.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-600">
                          {formatNumber(category.count)}{" "}
                          {category.count === 1 ? "event" : "events"}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-gray-400">
                      {category.percentage}%
                    </span>
                  </div>

                  {/* PROGRESS */}

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          Number(category.percentage) || 0,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
