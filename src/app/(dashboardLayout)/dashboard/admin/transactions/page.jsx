"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Input } from "@heroui/react";
import {
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiCopy,
} from "react-icons/fi";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AdminTransactionsPage = () => {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completed: 0,
    pending: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Fetch transactions
  // =====================================================
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/transactions`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load transactions");
        }

        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : [],
        );

        setStats(
          data.stats || {
            totalRevenue: 0,
            completed: 0,
            pending: 0,
          },
        );
      } catch (error) {
        console.error("Failed to fetch transactions:", error);

        setError(error.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // =====================================================
  // Search
  // =====================================================
  const filteredTransactions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      return (
        String(transaction.id || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.user || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.event || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.status || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.type || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.paymentType || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [transactions, search]);

  // =====================================================
  // Format currency
  // =====================================================
  const formatAmount = (amount, currency = "usd") => {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency).toUpperCase(),
    }).format(numericAmount);
  };

  // =====================================================
  // Format date
  // =====================================================
  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}
        <div>
          <p className="text-sm font-medium text-violet-400">
            ADMIN / TRANSACTIONS
          </p>

          <h1 className="mt-2 text-3xl font-bold">Transaction History</h1>

          <p className="mt-2 text-sm text-gray-500">
            Review organizer payments and attendee booking transactions.
          </p>
        </div>

        {/* ================================================= */}
        {/* Stats */}
        {/* ================================================= */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total Revenue */}
          <Card className="border border-white/10 bg-white/4 p-5">
            <FiDollarSign className="text-xl text-violet-400" />

            <p className="mt-4 text-sm text-gray-500">Total Revenue</p>

            <p className="mt-1 text-2xl font-bold">
              {formatAmount(stats.totalRevenue)}
            </p>
          </Card>

          {/* Completed */}
          <Card className="border border-white/10 bg-white/4 p-5">
            <FiCheckCircle className="text-xl text-emerald-400" />

            <p className="mt-4 text-sm text-gray-500">Completed</p>

            <p className="mt-1 text-2xl font-bold">
              {stats.completed.toLocaleString()}
            </p>
          </Card>

          {/* Pending */}
          <Card className="border border-white/10 bg-white/4 p-5">
            <FiClock className="text-xl text-amber-400" />

            <p className="mt-4 text-sm text-gray-500">Pending</p>

            <p className="mt-1 text-2xl font-bold">
              {stats.pending.toLocaleString()}
            </p>
          </Card>
        </div>

        {/* ================================================= */}
        {/* Table Card */}
        {/* ================================================= */}
        <Card className="overflow-x-auto scrollbar-hide overflow-hidden border border-white/10 bg-white/4">
          {/* Search */}
          <div className="border-b border-white/10 p-5">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-500" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* Loading */}
          {/* ================================================= */}
          {loading && (
            <div className="flex min-h-60 items-center justify-center">
              <div className="text-sm text-gray-500">
                Loading transactions...
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Error */}
          {/* ================================================= */}
          {!loading && error && (
            <div className="flex min-h-60 items-center justify-center px-5">
              <div className="text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Table */}
          {/* ================================================= */}
          {!loading && !error && (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full table-auto text-sm">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr className="text-left">
                    <th className="px-5 py-4 text-xs uppercase text-gray-500">
                      Transaction
                    </th>

                    <th className="px-5 py-4 text-xs uppercase text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-xs uppercase text-gray-500">
                      Event / Payment
                    </th>

                    <th className="px-5 py-4 text-xs uppercase text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs uppercase text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs uppercase text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-16 text-center text-sm text-gray-500"
                      >
                        {search
                          ? "No transactions found for your search."
                          : "No transactions available."}
                      </td>
                    </tr>
                  )}

                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={`${transaction.type}-${transaction.id}`}
                      className="border-b border-white/5 hover:bg-white/3"
                    >
                      {/* Transaction */}
                      <td className="px-3 py-3 max-w-35">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-mono text-xs text-violet-400">
                            {transaction.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(transaction.id);
                              toast.success("Transaction ID copied");
                            }}
                            className="shrink-0 text-gray-500 hover:text-violet-400"
                            title="Copy full ID"
                          >
                            <FiCopy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-5 py-5">
                        <p className="text-sm font-medium">
                          {transaction.user || "Unknown User"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {transaction.email || "No email"}
                        </p>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-5">
                        <p className="text-sm text-gray-300">
                          {transaction.event || "Unknown"}
                        </p>

                        {transaction.paymentType === "event_ticket" &&
                          transaction.quantity && (
                            <p className="mt-1 text-xs text-gray-500">
                              {transaction.quantity} ticket
                              {transaction.quantity > 1 ? "s" : ""}
                            </p>
                          )}

                        {transaction.paymentType === "subscription" &&
                          transaction.billingPeriod && (
                            <p className="mt-1 text-xs text-gray-500">
                              {transaction.billingPeriod} billing
                            </p>
                          )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-5 font-semibold">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            transaction.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : transaction.status === "Pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-5 text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Result count */}
        {!loading && !error && filteredTransactions.length > 0 && (
          <p className="text-right text-xs text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
