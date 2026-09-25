"use client";

import React, { useState } from "react";
import { Card, Input } from "@heroui/react";
import {
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const AdminTransactionsPage = () => {
  const [search, setSearch] = useState("");

  const transactions = [
    {
      id: "TXN-10021",
      user: "Jhon Doe",
      email: "jhon@gmail.com",
      event: "Concert Night",
      amount: "$45.00",
      method: "Card",
      status: "Completed",
      date: "Sep 24, 2026",
    },
    {
      id: "TXN-10020",
      user: "Sarah Khan",
      email: "sarah@gmail.com",
      event: "Tech Conference",
      amount: "$80.00",
      method: "Card",
      status: "Completed",
      date: "Sep 23, 2026",
    },
    {
      id: "TXN-10019",
      user: "Michael Lee",
      email: "michael@gmail.com",
      event: "Startup Meetup",
      amount: "$30.00",
      method: "Mobile Banking",
      status: "Pending",
      date: "Sep 22, 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

        <div>
          <p className="text-sm font-medium text-violet-400">
            ADMIN / TRANSACTIONS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Transaction History
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review payments and booking transactions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-white/10 bg-white/4 p-5">
            <FiDollarSign className="text-xl text-violet-400" />
            <p className="mt-4 text-sm text-gray-500">
              Total Revenue
            </p>
            <p className="mt-1 text-2xl font-bold">
              $48,920
            </p>
          </Card>

          <Card className="border border-white/10 bg-white/4 p-5">
            <FiCheckCircle className="text-xl text-emerald-400" />
            <p className="mt-4 text-sm text-gray-500">
              Completed
            </p>
            <p className="mt-1 text-2xl font-bold">
              8,210
            </p>
          </Card>

          <Card className="border border-white/10 bg-white/4 p-5">
            <FiClock className="text-xl text-amber-400" />
            <p className="mt-4 text-sm text-gray-500">
              Pending
            </p>
            <p className="mt-1 text-2xl font-bold">
              432
            </p>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden border border-white/10 bg-white/4">

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

          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead className="border-b border-white/10 bg-black/20">
                <tr className="text-left">
                  <th className="px-5 py-4 text-xs uppercase text-gray-500">
                    Transaction
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-gray-500">
                    User
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-gray-500">
                    Event
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-gray-500">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-xs uppercase text-gray-500">
                    Method
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
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/5 hover:bg-white/3"
                  >
                    <td className="px-5 py-5">
                      <span className="font-mono text-sm text-violet-400">
                        {transaction.id}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-medium">
                        {transaction.user}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {transaction.email}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-300">
                      {transaction.event}
                    </td>

                    <td className="px-5 py-5 font-semibold">
                      {transaction.amount}
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-400">
                      {transaction.method}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          transaction.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-500">
                      {transaction.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;