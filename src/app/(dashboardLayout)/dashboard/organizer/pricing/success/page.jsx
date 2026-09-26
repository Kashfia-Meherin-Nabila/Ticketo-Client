import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { getOrganizerPayments } from "@/lib/api/payments/data";

export default async function Success({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Invalid Payment Session
          </h1>

          <p className="mt-3 text-gray-400">
            We could not find your Stripe checkout session.
          </p>

          <Link
            href="/dashboard/organizer/pricing"
            className="inline-block mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500"
          >
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent"],
  });

  const customerEmail = session.customer_details?.email;
  const planId = session.metadata?.planId;

  if (session.status === "open") {
    redirect("/dashboard/organizer/pricing");
  }

  if (session.status !== "complete") {
    redirect("/dashboard/organizer/pricing");
  }

  // const subsInfo ={
  //   customerEmail,
  //   planId
  // }
  const result = await getOrganizerPayments(customerEmail);
  console.log(result);
 

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 text-center shadow-2xl backdrop-blur-xl">

          {/* Success icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-2xl text-white">
              ✓
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Payment Successful!
          </h1>

          <p className="mt-3 text-gray-400">
            Your Ticketo subscription payment has been completed successfully.
          </p>

          {/* Payment information */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-left">

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">
                Plan
              </span>

              <span className="font-semibold capitalize text-white">
                {planId || "Selected Plan"}
              </span>
            </div>

            {customerEmail && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-gray-400">
                  Email
                </span>

                <span className="break-all text-sm text-white">
                  {customerEmail}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-gray-400">
                Payment
              </span>

              <span className="font-medium text-green-400">
                Completed
              </span>
            </div>

          </div>

          <p className="mt-6 text-sm leading-6 text-gray-400">
            Your subscription has been processed. Your organizer plan will be
            updated after the payment is confirmed by Ticketo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link
              href="/dashboard/organizer"
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
            >
              Go to Dashboard
            </Link>

            <Link
              href="/dashboard/organizer/pricing"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View Plans
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}