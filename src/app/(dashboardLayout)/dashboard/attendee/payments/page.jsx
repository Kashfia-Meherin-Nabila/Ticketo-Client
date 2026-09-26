"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Spinner } from "@heroui/react";
import {
  FaCreditCard,
  FaCalendarAlt,
  FaTicketAlt,
  FaReceipt,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AttendeePaymentsPage() {
  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !session?.user?.email) {
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/bookings/user/${encodeURIComponent(
            session.user.email
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load payment history."
          );
        }

        setPayments(data?.bookings || data || []);
      } catch (err) {
        console.error("Fetch attendee payments error:", err);

        setError(
          err.message || "Failed to load payment history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [session, sessionLoading]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = String(
      status || ""
    ).toLowerCase();

    if (
      normalizedStatus === "paid" ||
      normalizedStatus === "completed"
    ) {
      return <FaCheckCircle />;
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return <FaClock />;
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled" ||
      normalizedStatus === "failed"
    ) {
      return <FaTimesCircle />;
    }

    return <FaReceipt />;
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(
      status || ""
    ).toLowerCase();

    if (
      normalizedStatus === "paid" ||
      normalizedStatus === "completed"
    ) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled" ||
      normalizedStatus === "failed"
    ) {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const getAmount = (amount) => {
    const numericAmount = Number(amount) || 0;

    if (numericAmount === 0) {
      return "Free";
    }

    return `$${numericAmount.toFixed(2)}`;
  };

  const paidPayments = payments.filter(
    (payment) =>
      String(payment.paymentStatus || "").toLowerCase() ===
      "paid"
  );

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + (Number(payment.amount) || 0),
    0
  );

  /* --------------------------------
     Session Loading
  -------------------------------- */
  if (sessionLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />

          <p className="text-gray-400">
            Loading payment history...
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------
     Not Logged In
  -------------------------------- */
  if (!session?.user?.email) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-white/10 bg-[#111111] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
            <FaCreditCard size={26} />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Sign in required
          </h1>

          <p className="mt-3 text-gray-400">
            Please sign in to view your payment history.
          </p>

          <Button
            as={Link}
            href="/login"
            className="mt-6 w-full bg-violet-600 text-white hover:bg-violet-700"
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  /* --------------------------------
     Payment Data Loading
  -------------------------------- */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />

          <p className="text-gray-400">
            Loading payment history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/attendee"
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-violet-400"
          >
            <FaArrowLeft />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <FaCreditCard size={21} />
                </div>

                <div>
                  <h1 className="text-3xl font-bold">
                    Payment History
                  </h1>

                  <p className="mt-1 text-sm text-gray-400">
                    View all your Ticketo ticket payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border border-white/10 bg-[#111111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Total Payments
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {payments.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <FaReceipt />
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-[#111111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Paid Payments
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {paidPayments.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <FaCheckCircle />
              </div>
            </div>
          </Card>

          <Card className="border border-white/10 bg-[#111111] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Total Amount
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  ${totalPaid.toFixed(2)}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FaCreditCard />
              </div>
            </div>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </Card>
        )}

        {/* Payments */}
        {payments.length === 0 ? (
          <Card className="border border-white/10 bg-[#111111] p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
              <FaCreditCard size={25} />
            </div>

            <h2 className="text-xl font-semibold text-white">
              No payments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
              Your ticket payment history will appear here
              after you book an event.
            </p>

            <Button
              as={Link}
              href="/events"
              className="mt-6 bg-violet-600 text-white hover:bg-violet-700"
            >
              Browse Events
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const status =
                payment.paymentStatus || "paid";

              return (
                <Card
                  key={
                    payment._id ||
                    payment.stripeSessionId ||
                    payment.transactionId
                  }
                  className="overflow-hidden border border-white/10 bg-[#111111] transition hover:border-violet-500/30"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Event */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                          <FaTicketAlt size={20} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-white">
                            {payment.eventTitle ||
                              "Event Ticket"}
                          </h2>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
                            <span className="flex items-center gap-2">
                              <FaCalendarAlt className="text-violet-400" />
                              {formatDate(
                                payment.bookingDate ||
                                  payment.createdAt
                              )}
                            </span>

                            <span className="flex items-center gap-2">
                              <FaTicketAlt className="text-violet-400" />
                              {payment.quantity || 1}{" "}
                              {Number(payment.quantity) === 1
                                ? "Ticket"
                                : "Tickets"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount + Status */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-gray-500">
                            Amount
                          </p>

                          <p className="text-xl font-bold text-white">
                            {getAmount(payment.amount)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}

                          {String(status)
                            .charAt(0)
                            .toUpperCase() +
                            String(status).slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Transaction ID
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-gray-300">
                          {payment.transactionId ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Payment Status
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-300">
                          {String(status)
                            .charAt(0)
                            .toUpperCase() +
                            String(status).slice(1)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Payment Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-300">
                          {formatDateTime(
                            payment.bookingDate ||
                              payment.createdAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Payment Method
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-300">
                          {payment.stripeSessionId
                            ? "Stripe"
                            : Number(payment.amount) === 0
                            ? "Free"
                            : "Online Payment"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}