"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Card } from "@heroui/react";

import {
  FaCalendarAlt,
  FaCrown,
  FaDollarSign,
  FaUsers,
  FaTicketAlt,
  FaArrowRight,
} from "react-icons/fa";

import { getOrganizerOverview } from "@/lib/api/organizer/data";

const OrganizerOverviewPage = () => {
  const { data: session, isPending } = useSession();

  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  // ==========================================
  // LOAD OVERVIEW
  // ==========================================

  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.email) {
      router.push("/login?callbackUrl=/dashboard/organizer");

      return;
    }

    let cancelled = false;

    const loadOverview = async () => {
      try {
        setLoading(true);
        setNeedsSetup(false);

        const result = await getOrganizerOverview(session.user.email);

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          // New organizers won't have an organization yet —
          // treat that as a setup step, not an error.
          if (error?.message === "Organization not found") {
            setNeedsSetup(true);
          } else {
            console.error("Organizer overview error:", error);

            toast.error(
              error?.message || "Failed to load organizer overview."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, isPending, router]);

  // ==========================================
  // LOADING
  // ==========================================

  if (isPending || loading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            className="border-white/5 bg-slate-900/40"
            radius="lg"
          >
            <div className="animate-pulse p-6">
              <div className="h-3 w-32 rounded bg-white/10" />

              <div className="mt-4 h-9 w-20 rounded bg-white/10" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // ==========================================
  // NEEDS ORGANIZATION SETUP
  // ==========================================

  if (needsSetup) {
    return (
      <Card
        className="mt-6 border-violet-500/20 bg-slate-900/40"
        radius="lg"
      >
        <div className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-violet-400">
            <FaCrown size={28} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Set up your organization
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Create your organization to start hosting events and
              tracking your dashboard.
            </p>
          </div>

          <Button
            onPress={() =>
              router.push("/dashboard/organizer/organization")
            }
            className="bg-violet-600 font-bold text-white hover:bg-violet-500"
            radius="lg"
            endContent={<FaArrowRight size={13} />}
          >
            Create Organization
          </Button>
        </div>
      </Card>
    );
  }

  // ==========================================
  // NO DATA
  // ==========================================

  if (!data) {
    return (
      <Card
        className="mt-6 border-white/5 bg-slate-900/40"
        radius="lg"
      >
        <div className="p-6 text-sm text-slate-400">
          Unable to load organizer information.
        </div>
      </Card>
    );
  }

  const {
    stats,
    plan,
    usage,
  } = data;

  const isFree = plan.planId === "free";

  const isUnlimited = plan.unlimitedEvents;

  const isLimitReached =
    !isUnlimited &&
    usage.totalEvents >= plan.maxEvents;

  const progress = isUnlimited
    ? 100
    : Math.min(
        (usage.totalEvents / plan.maxEvents) * 100,
        100
      );

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="mt-6 space-y-6">

      {/* ======================================
          STAT CARDS
      ====================================== */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* Total Events */}
        <Card
          className="border-white/5 bg-slate-900/40"
          radius="lg"
        >
          <div className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Hosted Events
              </span>

              <h2 className="text-3xl font-extrabold text-white">
                {stats.totalEvents}
              </h2>
            </div>

            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-3.5 text-pink-400">
              <FaCalendarAlt size={24} />
            </div>
          </div>
        </Card>

        {/* Tickets */}
        <Card
          className="border-white/5 bg-slate-900/40"
          radius="lg"
        >
          <div className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Ticket Sales
              </span>

              <h2 className="text-3xl font-extrabold text-white">
                {stats.totalSoldTickets.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-indigo-400">
              <FaTicketAlt size={24} />
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card
          className="border-white/5 bg-slate-900/40"
          radius="lg"
        >
          <div className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accumulated Revenue
              </span>

              <h2 className="text-3xl font-extrabold text-white">
                $
                {Number(
                  stats.totalRevenue || 0
                ).toFixed(2)}
              </h2>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3.5 text-green-400">
              <FaDollarSign size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* ======================================
          PLAN + USAGE
      ====================================== */}

      <Card
        className={`relative overflow-hidden border ${
          isFree
            ? "border-yellow-500/20"
            : "border-violet-500/20"
        } bg-gradient-to-r ${
          isFree
            ? "from-yellow-500/[0.06] via-amber-600/[0.04] to-transparent"
            : "from-violet-500/[0.08] via-purple-600/[0.04] to-transparent"
        }`}
        radius="lg"
      >
        <div className="p-6 sm:p-8">

          {/* Top */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

            {/* Plan info */}
            <div>
              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isFree
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-violet-500/10 text-violet-400"
                  }`}
                >
                  <FaCrown size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {plan.planName} Plan
                    </h3>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {plan.planStatus}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {isUnlimited
                      ? "Unlimited event creation"
                      : `Up to ${plan.maxEvents} events`}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan price */}
            <div className="lg:text-right">
              <p className="text-2xl font-extrabold text-white">
                ${plan.price}
              </p>

              {plan.price > 0 && (
                <p className="text-xs text-slate-500">
                  / {plan.billingPeriod}
                </p>
              )}
            </div>
          </div>

          {/* Usage */}
          <div className="mt-7">

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Event Usage
              </span>

              <span className="text-xs font-semibold text-white">
                {usage.totalEvents} /{" "}
                {isUnlimited
                  ? "∞"
                  : plan.maxEvents}
              </span>
            </div>

            {/* Progress */}
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all ${
                  isFree
                    ? "bg-yellow-500"
                    : "bg-violet-500"
                }`}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* Remaining */}
            <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-400">
                {isUnlimited
                  ? "You can create unlimited events."
                  : usage.eventsRemaining > 0
                    ? `${usage.eventsRemaining} event${
                        usage.eventsRemaining === 1
                          ? ""
                          : "s"
                      } remaining`
                    : "You've reached your event limit."}
              </span>

              <span className="text-slate-500">
                {usage.usagePercentage}% used
              </span>
            </div>
          </div>

          {/* Upgrade */}
          {!isUnlimited && (
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-semibold text-white">
                  {isLimitReached
                    ? "You've reached your event limit"
                    : "Need more events?"}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Upgrade your plan to create more
                  events and unlock additional features.
                </p>
              </div>

              <Button
                onPress={() =>
                  router.push(
                    "/dashboard/organizer/pricing"
                  )
                }
                className={`shrink-0 font-bold ${
                  isFree
                    ? "bg-yellow-500 text-slate-950 hover:bg-yellow-400"
                    : "bg-violet-600 text-white hover:bg-violet-500"
                }`}
                radius="lg"
                endContent={<FaArrowRight size={13} />}
              >
                {isLimitReached
                  ? "Upgrade Now"
                  : "View Plans"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OrganizerOverviewPage;