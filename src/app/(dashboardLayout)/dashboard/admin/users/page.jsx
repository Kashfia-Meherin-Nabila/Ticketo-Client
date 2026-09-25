"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { FiSearch, FiUsers, FiUserX, FiUserCheck } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { adminUsers, adminStats } from "@/lib/api/admin/data";
import { blockUser, unblockUser } from "@/lib/api/admin/action";
import Image from "next/image";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
  });

  // =========================
  // Load users
  // =========================
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);

        const data = await adminUsers({
          page,
          limit: 10,
          search,
          status,
        });

        setUsers(data?.users || []);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        toast.error(error?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [page, search, status]);

  // =========================
  // Load stats
  // =========================
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);

        const data = await adminStats();

        setStats({
          totalUsers: data?.totalUsers || 0,
          activeUsers: data?.activeUsers || 0,
          blockedUsers: data?.blockedUsers || 0,
        });
      } catch (error) {
        toast.error(error?.message || "Failed to load statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // =========================
  // Block user
  // =========================
  const handleBlock = async (id) => {
    try {
      const result = await blockUser(id);

      if (result?.success === false) {
        throw new Error(result?.message || "Failed to block user");
      }

      toast.success("User blocked successfully");

      setUsers((current) =>
        current.map((user) =>
          user._id === id
            ? {
                ...user,
                isBlocked: true,
              }
            : user,
        ),
      );

      setStats((current) => ({
        ...current,
        activeUsers: Math.max(0, current.activeUsers - 1),
        blockedUsers: current.blockedUsers + 1,
      }));
    } catch (error) {
      toast.error(error?.message || "Failed to block user");
    }
  };

  // =========================
  // Unblock user
  // =========================
  const handleUnblock = async (id) => {
    try {
      const result = await unblockUser(id);

      if (result?.success === false) {
        throw new Error(result?.message || "Failed to unblock user");
      }

      toast.success("User unblocked successfully");

      setUsers((current) =>
        current.map((user) =>
          user._id === id
            ? {
                ...user,
                isBlocked: false,
              }
            : user,
        ),
      );

      setStats((current) => ({
        ...current,
        activeUsers: current.activeUsers + 1,
        blockedUsers: Math.max(0, current.blockedUsers - 1),
      }));
    } catch (error) {
      toast.error(error?.message || "Failed to unblock user");
    }
  };

  // =========================
  // Search
  // =========================
  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // =========================
  // Status filter
  // =========================
  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
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
          <p className="text-sm font-medium text-violet-400">ADMIN / USERS</p>

          <h1 className="mt-2 text-3xl font-bold">User Management</h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage platform users and account access.
          </p>
        </div>

        {/* =========================
            Stats
        ========================= */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total Users */}
          <Card className="border border-white/10 bg-white/4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>

                <p className="mt-2 text-2xl font-bold">
                  {statsLoading ? "..." : stats.totalUsers}
                </p>
              </div>

              <div className="rounded-xl bg-violet-500/10 p-3">
                <FiUsers className="text-xl text-violet-400" />
              </div>
            </div>
          </Card>

          {/* Active Users */}
          <Card className="border border-white/10 bg-white/4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>

                <p className="mt-2 text-2xl font-bold">
                  {statsLoading ? "..." : stats.activeUsers}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3">
                <FiUserCheck className="text-xl text-emerald-400" />
              </div>
            </div>
          </Card>

          {/* Blocked Users */}
          <Card className="border border-white/10 bg-white/4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Blocked Users</p>

                <p className="mt-2 text-2xl font-bold">
                  {statsLoading ? "..." : stats.blockedUsers}
                </p>
              </div>

              <div className="rounded-xl bg-red-500/10 p-3">
                <FiUserX className="text-xl text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* =========================
            Users Card
        ========================= */}
        <Card className="overflow-hidden border border-white/10 bg-white/4">
          {/* Search + Filters */}
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-500" />

              <Input
                value={search}
                onChange={handleSearch}
                placeholder="Search users..."
                className="w-full"
              />
            </div>

            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("")}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  status === ""
                    ? "bg-violet-600 text-white"
                    : "border border-white/10 bg-white/3 text-gray-400 hover:bg-white/6"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("active")}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  status === "active"
                    ? "bg-emerald-600 text-white"
                    : "border border-white/10 bg-white/3 text-gray-400 hover:bg-white/6"
                }`}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("blocked")}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  status === "blocked"
                    ? "bg-red-600 text-white"
                    : "border border-white/10 bg-white/3 text-gray-400 hover:bg-white/6"
                }`}
              >
                Blocked
              </button>
            </div>
          </div>

          {/* =========================
              Loading
          ========================= */}
          {loading ? (
            <div className="flex min-h-75 items-center justify-center">
              <div className="text-sm text-gray-500">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            /* =========================
                Empty
            ========================= */
            <div className="flex min-h-75 flex-col items-center justify-center px-5 text-center">
              <FiUsers className="text-4xl text-gray-600" />

              <h3 className="mt-4 text-lg font-semibold">No users found</h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <>
              {/* =========================
                  Table
              ========================= */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-212.5 text-left">
                  <thead className="border-b border-white/10 bg-black/20">
                    <tr>
                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-gray-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-gray-500">
                        Role
                      </th>

                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-gray-500">
                        Joined
                      </th>

                      <th className="px-5 py-4 text-xs uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const blocked = user.isBlocked === true;

                      return (
                        <tr
                          key={user._id}
                          className="border-b border-white/5 transition hover:bg-white/3"
                        >
                          {/* User */}
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              {user.image ? (
                                <Image
                                  src={user.image}
                                  alt={user.name || "User"}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-400">
                                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                              )}

                              <div>
                                <p className="font-medium text-white">
                                  {user.name || "Unnamed User"}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-5 py-5">
                            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
                              {user.role || "User"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                blocked
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                              }`}
                            >
                              {blocked ? "Blocked" : "Active"}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="px-5 py-5 text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-5">
                            {blocked ? (
                              <Button
                                size="sm"
                                onPress={() => handleUnblock(user._id)}
                                className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              >
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onPress={() => handleBlock(user._id)}
                                className="border border-red-500/20 bg-red-500/10 text-red-400"
                              >
                                Block
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =========================
                  Pagination
              ========================= */}
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={page <= 1}
                    onPress={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="border border-white/10 bg-white/4 text-gray-300"
                  >
                    Previous
                  </Button>

                  <Button
                    size="sm"
                    variant="flat"
                    isDisabled={page >= totalPages}
                    onPress={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    className="border border-white/10 bg-white/4 text-gray-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminUsersPage;
