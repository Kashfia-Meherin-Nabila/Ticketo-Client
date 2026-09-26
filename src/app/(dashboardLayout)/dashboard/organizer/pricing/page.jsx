"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiCheck,
  FiShield,
  FiStar,
  FiZap,
} from "react-icons/fi";

const plans = [
  {
    id: "free",
    name: "Free",
    description:
      "Perfect for getting started with your first events.",
    price: 0,
    period: "forever",
    eventLimit: "3",
    icon: FiShield,
    popular: false,
    features: [
      "Up to 3 events",
      "Basic event management",
      "Attendee management",
      "Booking management",
      "Basic dashboard",
    ],
    buttonText: "Current Plan",
  },
  {
    id: "starter",
    name: "Starter",
    description:
      "For organizers running multiple small events.",
    price: 9,
    period: "month",
    eventLimit: "10",
    icon: FiZap,
    popular: false,
    features: [
      "Up to 10 events",
      "Everything in Free",
      "Event analytics",
      "Transaction history",
      "Priority support",
    ],
    buttonText: "Upgrade to Starter",
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "For organizers who regularly host events.",
    price: 19,
    period: "month",
    eventLimit: "30",
    icon: FiStar,
    popular: true,
    features: [
      "Up to 30 events",
      "Everything in Starter",
      "Advanced analytics",
      "Featured events",
      "Export reports",
      "Priority support",
    ],
    buttonText: "Upgrade to Professional",
  },
  {
    id: "business",
    name: "Business",
    description:
      "For organizations with high-volume event needs.",
    price: 39,
    period: "month",
    eventLimit: "Unlimited",
    icon: FiZap,
    popular: false,
    features: [
      "Unlimited events",
      "Everything in Professional",
      "Advanced organizer analytics",
      "Premium features",
      "Priority support",
      "Early access to new features",
    ],
    buttonText: "Upgrade to Business",
  },
];

export default function OrganizerPricingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (plan) => {
    if (plan.id === "free") return;

    try {
      setLoadingPlan(plan.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(
          data?.message || "Could not start checkout."
        );
      }

      // React Compiler-safe Stripe redirect
      window.open(data.url, "_self");
    } catch (error) {
      console.error("Checkout error:", error);

      toast.error(
        error?.message || "Could not start payment."
      );

      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#07070a] px-4 py-8 text-white sm:px-6 lg:px-8 xl:py-10 ">
      <div className="mx-auto w-full max-w-375">

        {/* =========================================
            HEADER
        ========================================== */}
        <section className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
            <FiZap size={14} />

            Organizer Plans
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Choose the right plan
            <br className="hidden sm:block" />
            for your events
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Start for free and upgrade whenever you need to
            create more events. Choose a plan that matches
            your organization and grow without limits.
          </p>
        </section>

        {/* =========================================
            PRICING
        ========================================== */}
        <section className="mt-10 sm:mt-12">
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            {plans.map((plan) => {
              const Icon = plan.icon;

              const isLoading = loadingPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`
                    relative flex min-w-0 flex-col overflow-visible
                    rounded-3xl border p-5
                    transition-all duration-300
                    sm:p-6
                    ${
                      plan.popular
                        ? `
                          border-violet-500/50
                          bg-linear-to-b
                          from-violet-500/10
                          to-white/2.5
                          shadow-[0_0_50px_rgba(139,92,246,0.10)]
                        `
                        : `
                          border-white/10
                          bg-white/2.5
                          hover:border-white/20
                          hover:bg-white/4
                        `
                    }
                  `}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <div className="whitespace-nowrap rounded-full bg-violet-600 px-4 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-lg shadow-violet-900/30">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Plan icon */}
                  <div
                    className={`
                      mb-5 flex h-11 w-11 items-center justify-center
                      rounded-xl
                      ${
                        plan.popular
                          ? "bg-violet-500/15 text-violet-300"
                          : "bg-white/5 text-white/60"
                      }
                    `}
                  >
                    <Icon size={21} />
                  </div>

                  {/* Plan title */}
                  <h2 className="text-xl font-bold">
                    {plan.name}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 min-h-12 text-sm leading-6 text-white/40">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold tracking-tight">
                        ${plan.price}
                      </span>

                      <span className="mb-1 text-xs text-white/35">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Event limit */}
                  <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                      Event limit
                    </p>

                    <p className="mt-1 text-base font-bold text-white">
                      {plan.eventLimit}
                      {plan.eventLimit !== "Unlimited"
                        ? " events"
                        : ""}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mt-6 flex-1">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">
                      What&apos;s included
                    </p>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-5 text-white/55"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                            <FiCheck size={11} />
                          </span>

                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  {/* <button
                    type="button"
                    disabled={
                      plan.id === "free" ||
                      loadingPlan !== null
                    }
                    onClick={() => handleCheckout(plan)}
                    className={`
                      mt-8 flex w-full items-center justify-center
                      gap-2 rounded-xl px-4 py-3
                      text-sm font-semibold
                      transition-all duration-200
                      ${
                        plan.id === "free"
                          ? `
                            cursor-default
                            border border-white/5
                            bg-white/[0.03]
                            text-white/30
                          `
                          : plan.popular
                            ? `
                              bg-violet-600
                              text-white
                              shadow-lg
                              shadow-violet-900/20
                              hover:bg-violet-500
                            `
                            : `
                              border border-white/10
                              bg-white/5
                              text-white/80
                              hover:border-violet-500/30
                              hover:bg-violet-500/10
                              hover:text-white
                            `
                      }
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    `}
                  >
                    {isLoading
                      ? "Redirecting..."
                      : plan.buttonText}

                    {plan.id !== "free" && !isLoading && (
                      <FiArrowRight size={16} />
                    )}
                  </button> */}
                   {/* <form action="/api/checkout_sessions" method="POST">
                   <input type="hidden" name="plan_id" value={plan.id}/>
      <section>
        <button type="submit" role="link" className={`
                      mt-8 flex w-full items-center justify-center
                      gap-2 rounded-xl px-4 py-3
                      text-sm font-semibold
                      transition-all duration-200
                      ${
                        plan.id === "free"
                          ? `
                            cursor-default
                            border border-white/5
                            bg-white/3
                            text-white/30
                          `
                          : plan.popular
                            ? `
                              bg-violet-600
                              text-white
                              shadow-lg
                              shadow-violet-900/20
                              hover:bg-violet-500
                            `
                            : `
                              border border-white/10
                              bg-white/5
                              text-white/80
                              hover:border-violet-500/30
                              hover:bg-violet-500/10
                              hover:text-white
                            `
                      } `}>
          Checkout
        </button>
      </section>
    </form> */}
    <form action="/api/checkout_sessions" method="POST">
  <input
    type="hidden"
    name="plan_id"
    value={plan.id}
  />

  <button
    type="submit"
    disabled={plan.id === "free"}
    className={`
      mt-8 flex w-full items-center justify-center
      gap-2 rounded-xl px-4 py-3
      text-sm font-semibold
      transition-all duration-200

      ${
        plan.id === "free"
          ? `
            cursor-default
            border border-white/5
            bg-white/[0.03]
            text-white/30
          `
          : plan.popular
            ? `
              bg-violet-600
              text-white
              shadow-lg
              shadow-violet-900/20
              hover:bg-violet-500
            `
            : `
              border border-white/10
              bg-white/5
              text-white/80
              hover:border-violet-500/30
              hover:bg-violet-500/10
              hover:text-white
            `
      }

      disabled:cursor-not-allowed
      disabled:opacity-50
    `}
  >
    {plan.id === "free"
      ? "Current Plan"
      : plan.buttonText}

    {plan.id !== "free" && (
      <FiArrowRight size={16} />
    )}
  </button>
</form>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            TRUST / INFORMATION
        ========================================== */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {/* Secure */}
          <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FiShield size={17} />
            </div>

            <h3 className="text-sm font-semibold text-white">
              Secure payments
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-white/35">
              Payments are securely processed through Stripe.
            </p>
          </div>

          {/* Upgrade */}
          <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <FiZap size={17} />
            </div>

            <h3 className="text-sm font-semibold text-white">
              Upgrade anytime
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-white/35">
              Upgrade your plan whenever you need more event
              capacity.
            </p>
          </div>

          {/* Free */}
          <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <FiStar size={17} />
            </div>

            <h3 className="text-sm font-semibold text-white">
              Start for free
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-white/35">
              Create your first 3 events without a subscription.
            </p>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </main>
  );
}