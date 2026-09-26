import Link from "next/link";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createBooking } from "@/lib/api/bookings/action";

export default async function PaymentSuccessPage({ searchParams }) {
  const params = await searchParams;

  const sessionId = params?.session_id;

  if (!sessionId) {
    redirect("/events");
  }

  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(
      sessionId,
      {
        expand: ["line_items", "payment_intent"],
      }
    );
  } catch (error) {
    console.error(
      "Failed to retrieve Stripe session:",
      error
    );

    return (
      <main className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#0b1020] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400">
            Payment Verification Failed
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            We could not verify your Stripe payment.
            Please contact support if money was deducted.
          </p>

          <Link
            href="/events"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  // -----------------------------------
  // Check payment status
  // -----------------------------------

  if (session.payment_status !== "paid") {
    return (
      <main className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-yellow-500/20 bg-[#0b1020] p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-400">
            Payment Not Completed
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Your payment has not been completed yet.
          </p>

          <Link
            href="/events"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  // -----------------------------------
  // Read Stripe metadata
  // -----------------------------------

  const metadata = session.metadata || {};

  const paymentType = metadata.paymentType;

  // This page is specifically for event ticket payments.
  if (paymentType !== "event_ticket") {
    return (
      <main className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-yellow-500/20 bg-[#0b1020] p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-400">
            Invalid Payment
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            This payment session is not associated with an
            event ticket.
          </p>

          <Link
            href="/events"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  // -----------------------------------
  // Extract booking information
  // -----------------------------------

  const eventId = metadata.eventId;
  const eventTitle = metadata.eventTitle;
  const attendeeEmail = metadata.attendeeEmail;

  const quantity = Number(metadata.quantity) || 1;

  const totalAmount =
    Number(metadata.totalAmount) ||
    Number(session.amount_total || 0) / 100;

  // -----------------------------------
  // Create booking
  // -----------------------------------

  let bookingResult = null;

  try {
    const bookingPayload = {
      eventId,
      eventTitle,
      attendeeEmail,
      quantity,
      amount: totalAmount,
      paymentStatus: "paid",
    };

    bookingResult = await createBooking(
      bookingPayload
    );

    if (!bookingResult?.success) {
      throw new Error(
        bookingResult?.message ||
          "Failed to create booking."
      );
    }
  } catch (error) {
    console.error(
      "Booking creation failed:",
      error
    );

    return (
      <main className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#0b1020] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400">
            Payment Successful
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your payment was successful, but we could
            not create your booking record.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Payment Session: {session.id}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Please contact support with this session ID.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/events"
              className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Events
            </Link>

            <Link
              href="/dashboard/attendee/my-bookings"
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------------
  // Booking successfully created
  // -----------------------------------

  const booking =
    bookingResult?.booking || {};

  const transactionId =
    booking.transactionId || "N/A";

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-[#0b1020] p-6 shadow-2xl sm:p-10">
          {/* Success icon */}

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-3xl font-bold text-white">
              ✓
            </div>
          </div>

          {/* Heading */}

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-white">
              Payment Successful!
            </h1>

            <p className="mt-2 text-slate-400">
              Your event booking has been confirmed.
            </p>
          </div>

          {/* Booking details */}

          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">
                Event
              </span>

              <span className="text-right text-sm font-semibold text-white">
                {eventTitle}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">
                Attendee
              </span>

              <span className="text-right text-sm text-white">
                {attendeeEmail}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">
                Quantity
              </span>

              <span className="text-sm font-semibold text-white">
                {quantity}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">
                Total Amount
              </span>

              <span className="text-lg font-bold text-indigo-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">
                Payment Status
              </span>

              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                Paid
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Transaction ID
              </span>

              <span className="max-w-[60%] break-all text-right text-xs font-medium text-slate-300">
                {transactionId}
              </span>
            </div>
          </div>

          {/* Stripe session */}

          <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
            <p className="text-xs text-slate-500">
              Stripe Payment Session
            </p>

            <p className="mt-1 break-all text-xs text-slate-400">
              {session.id}
            </p>
          </div>

          {/* Buttons */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/attendee/my-bookings"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              View My Bookings
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}