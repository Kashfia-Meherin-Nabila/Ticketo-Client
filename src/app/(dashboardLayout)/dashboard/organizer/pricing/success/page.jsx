import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (error) {
    console.error("Stripe session error:", error);
    redirect("/");
  }

  // Checkout session is still open
  if (session.status === "open") {
    redirect("/");
  }

  // Checkout session expired
  if (session.status === "expired") {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
            ❌
          </div>

          <h1 className="mb-3 text-2xl font-bold">
            Payment Session Expired
          </h1>

          <p className="mb-6 text-zinc-400">
            Your Stripe checkout session has expired. Please try booking your
            ticket again.
          </p>

          <Link
            href="/"
            className="inline-flex rounded-lg bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-700"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const customerEmail = session.customer_details?.email;

  // Checkout completed
  if (session.status === "complete") {
    const paymentStatus = session.payment_status;

    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center shadow-xl">
          {paymentStatus === "paid" ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl">
                ✓
              </div>

              <h1 className="mb-3 text-3xl font-bold">
                Payment Successful!
              </h1>

              <p className="mb-4 text-zinc-300">
                Thank you for booking with Ticketo.
              </p>

              {customerEmail && (
                <p className="mb-6 text-sm text-zinc-400">
                  Your payment confirmation will be sent to{" "}
                  <span className="font-medium text-white">
                    {customerEmail}
                  </span>
                  .
                </p>
              )}

              <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-sm text-green-400">
                  Your ticket booking has been successfully completed.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard/my-bookings"
                  className="rounded-lg bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-700"
                >
                  View My Bookings
                </Link>

                <Link
                  href="/"
                  className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium transition hover:bg-white/10"
                >
                  Back to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">
                ⏳
              </div>

              <h1 className="mb-3 text-2xl font-bold">
                Payment Processing
              </h1>

              <p className="mb-6 text-zinc-400">
                Your checkout was completed, but the payment is still being
                processed. Please check your bookings shortly.
              </p>

              <Link
                href="/dashboard/my-bookings"
                className="inline-flex rounded-lg bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-700"
              >
                View My Bookings
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  redirect("/");
}