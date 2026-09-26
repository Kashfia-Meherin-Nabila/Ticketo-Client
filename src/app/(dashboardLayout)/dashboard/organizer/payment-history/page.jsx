"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Card } from "@heroui/react";

import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

import { getOrganizerPayments } from "@/lib/api/payments/data";

const statusStyles = {
  completed: {
    label: "Completed",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    icon: FaCheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
    icon: FaTimesCircle,
  },
  expired: {
    label: "Expired",
    className: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    icon: FaClock,
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

const formatCurrency = (amount, currency = "usd") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount || 0);
};

const StatusBadge = ({ status }) => {
  const config = statusStyles[status] || statusStyles.completed;
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

const PaymentHistoryPage = () => {
  const { data: session, isPending } = useSession();

  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD PAYMENTS
  // ==========================================

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.email) {
      router.push("/login?callbackUrl=/dashboard/organizer/payments");

      return;
    }

    let cancelled = false;

    const loadPayments = async () => {
      try {
        setLoading(true);

        const result = await getOrganizerPayments(session.user.email);

        if (!cancelled) {
          setPayments(result?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Payment history error:", error);

          toast.error(
            error?.message || "Failed to load payment history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, isPending, router]);

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

  if (payments.length === 0) {
    return (
      <Card
        className="mt-6 border-white/5 bg-slate-900/40"
        radius="lg"
      >
        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-violet-400">
            <FaFileInvoiceDollar size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              No payments yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Your payment history will show up here once you upgrade
              your plan.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // ==========================================
  // MAIN TABLE
  // ==========================================

  return (
    <div className="mt-6">
      <Card
        className="border-white/5 bg-slate-900/40"
        radius="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="whitespace-nowrap px-6 py-4">Plan</th>
                <th className="whitespace-nowrap px-6 py-4">Amount</th>
                <th className="whitespace-nowrap px-6 py-4">Billing</th>
                <th className="whitespace-nowrap px-6 py-4">Status</th>
                <th className="whitespace-nowrap px-6 py-4">Date</th>
                <th className="whitespace-nowrap px-6 py-4">
                  Transaction ID
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="border-b border-white/5 text-sm last:border-b-0 hover:bg-white/2"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-white">
                    {payment.planName || payment.planId}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-white">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 capitalize text-slate-400">
                    {payment.billingPeriod || "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={payment.paymentStatus} />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                    {formatDate(payment.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                    {payment.stripeSessionId
                      ? `${payment.stripeSessionId.slice(0, 20)}...`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PaymentHistoryPage;