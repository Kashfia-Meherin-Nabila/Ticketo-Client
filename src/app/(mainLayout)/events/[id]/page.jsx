"use client";

import { getEventById } from "@/lib/api/events/data";
import { createBooking } from "@/lib/api/bookings/action";
import { useSession } from "@/lib/auth-client";
import { Button, Card } from "@heroui/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { BiMapPin, BiArrowBack } from "react-icons/bi";
import { BsPeople } from "react-icons/bs";
import { FaCalendarDays } from "react-icons/fa6";
import { LuBuilding2, LuTicket, LuClock3, LuShieldCheck } from "react-icons/lu";

const EventDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push(`/login?callbackUrl=/events/${params.id}`);
    }
  }, [session, isPending, router, params.id]);

  // ==========================================
  // GET EVENT
  // ==========================================

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) return;
    if (!params.id) return;

    const loadEvent = async () => {
      try {
        setLoading(true);
        const data = await getEventById(params.id);
        setEvent(data);
      } catch (error) {
        console.error(error);
        toast.error(error?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [params.id, session, isPending]);

 
  const handleBookEvent = async () => {
    // 1. Verify User Authentication
    if (!session?.user) {
      toast.error("Please sign in to book events.");

      return router.push(`/login?callbackUrl=/events/${params.id}`);
    }

    // 2. Strict Role Check: Only attendee can book
    if (session.user.role !== "attendee") {
      Swal.fire({
        title: "Access Restricted",
        text: `Only attendees can book events. You are currently signed in as an ${
          session.user.role || "user"
        }.`,
        icon: "warning",
        background: "#090d16",
        color: "#f8fafc",
        confirmButtonColor: "#4f46e5",
      });

      return;
    }

    // 3. Event information
    const quantity = 1;

    const numericPrice = Number(event?.ticketPrice) || 0;

    const totalAmount = numericPrice * quantity;

    const availableSeats = Number(event?.seats) || 0;

    if (availableSeats <= 0) {
      toast.error("Sorry, this event is sold out.");
      return;
    }

    // 4. Confirmation Modal
    const confirm = await Swal.fire({
      title: "Confirm Your Booking",

      html: `
      <div class="text-left text-sm text-slate-300 space-y-2 mt-2">
        <p>
          <strong>Event:</strong> ${event.title}
        </p>

        <p>
          <strong>Quantity:</strong> ${quantity} ticket
        </p>

        <p>
          <strong>Total Price:</strong>
          ${numericPrice === 0 ? "Free" : `৳${totalAmount}`}
        </p>
      </div>
    `,

      icon: "info",

      showCancelButton: true,

      confirmButtonText:
        numericPrice === 0 ? "Confirm & Book" : "Continue to Payment",

      cancelButtonText: "Cancel",

      confirmButtonColor: "#4f46e5",

      cancelButtonColor: "#1e293b",

      background: "#090d16",

      color: "#f8fafc",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsBookingLoading(true);

      // ==========================================
      // FREE EVENT
      // ==========================================

      if (numericPrice === 0) {
  const bookingPayload = {
    eventId: event._id || params.id,
    eventTitle: event.title,
    attendeeEmail: session.user.email,
    quantity,
    amount: 0,
    paymentStatus: "paid",
    transactionId: `TXN-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`,
    bookingDate: new Date().toISOString(),
  };

  const result = await createBooking(bookingPayload);

  if (!result?.success) {
    throw new Error(
      result?.message || "Failed to create booking.",
    );
  }

  await Swal.fire({
    title: "Booking Confirmed!",
    text: "Your ticket has been booked successfully.",
    icon: "success",
    background: "#090d16",
    color: "#f8fafc",
    confirmButtonColor: "#4f46e5",
  });

  router.push("/dashboard/attendee/my-bookings");
  return;
}

      // ==========================================
      // PAID EVENT → STRIPE CHECKOUT
      // ==========================================
      const eventId = event._id || params.id;
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "booking",
          eventId,
          eventTitle: event.title,
          ticketPrice: numericPrice,
          quantity,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to initialize payment.");
      }

      if (!result?.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = result.url;
    } catch (error) {
      console.error("Booking/payment error:", error);

      toast.error(
        error?.message || "Failed to process booking. Please try again.",
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  // ==========================================
  // SESSION LOADING
  // ==========================================

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="rounded-2xl border border-white/10 bg-slate-950/80 px-8 py-7">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-slate-400">Checking authentication...</p>
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================
  // EVENT LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl pb-16">
        <div className="mb-6 h-10 w-36 animate-pulse rounded-xl bg-white/5" />
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70">
          <div className="h-75 animate-pulse bg-white/4 md:h-125" />
          <div className="space-y-6 p-6 md:p-10">
            <div className="h-5 w-24 animate-pulse rounded-full bg-white/6" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-white/6" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-white/4"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EVENT NOT FOUND
  // ==========================================

  if (!event) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <LuTicket size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This event may have been removed or is not approved yet.
          </p>
          <Button
            onPress={() => router.push("/events")}
            radius="lg"
            className="mt-7 bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-500"
          >
            <BiArrowBack size={18} />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* BACK BUTTON */}
      <Button
        onPress={() => router.push("/events")}
        radius="lg"
        className="mb-6 border border-white/10 bg-white/4 text-slate-300 hover:bg-white/8"
      >
        <BiArrowBack size={18} />
        Back to Events
      </Button>

      {/* MAIN EVENT CARD */}
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/30">
        {/* IMAGE */}
        <div className="group relative h-80 overflow-hidden md:h-125">
          <Image
            src={event.banner}
            alt={event.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-indigo-950/30 to-transparent" />

          {/* Category */}
          <div className="absolute left-5 top-5 md:left-8 md:top-8">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xl">
              {event.category}
            </span>
          </div>

          {/* Status */}
          <div className="absolute right-5 top-5 md:right-8 md:top-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold capitalize text-emerald-300 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {event.status}
            </span>
          </div>

          {/* Title over image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-300">
              <LuShieldCheck size={16} />
              Verified Event
            </p>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              {event.title}
            </h1>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-10">
          {/* INFO GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-indigo-500/30 hover:bg-indigo-500/4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <FaCalendarDays size={19} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Event Date
              </p>
              <p className="mt-2 font-semibold text-white">{event.date}</p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-indigo-500/30 hover:bg-indigo-500/4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <BiMapPin size={22} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Location
              </p>
              <p className="mt-2 font-semibold text-white">{event.location}</p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-indigo-500/30 hover:bg-indigo-500/4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <LuTicket size={21} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ticket Price
              </p>
              <p className="mt-2 text-xl font-bold text-white">
                {Number(event.ticketPrice) === 0
                  ? "Free"
                  : `$${event.ticketPrice}`}
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-indigo-500/30 hover:bg-indigo-500/4">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <BsPeople size={21} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Available Seats
              </p>
              <p className="mt-2 text-xl font-bold text-white">{event.seats}</p>
            </div>
          </div>

          {/* LOWER CONTENT */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* LEFT */}
            <div>
              <div className="mb-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                  About this event
                </p>
                <h2 className="text-2xl font-bold text-white">
                  Everything you need to know
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/2 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <LuClock3 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      Event Information
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Join us for this exciting {event.category?.toLowerCase()}{" "}
                      event and enjoy an unforgettable experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* ORGANIZER */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/2 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <LuBuilding2 size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Organized by
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {event.organizerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT / BOOKING CARD */}
            <div>
              <div className="sticky top-6 rounded-2xl border border-indigo-500/20 bg-linear-to-b from-indigo-500/8 to-transparent p-6">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tickets
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black text-white">
                        {Number(event.ticketPrice) === 0
                          ? "Free"
                          : `$${event.ticketPrice}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">per person</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        {event.seats}
                      </p>
                      <p className="text-xs text-slate-500">seats left</p>
                    </div>
                  </div>
                </div>

                <Button
                  onPress={handleBookEvent}
                  isLoading={isBookingLoading}
                  isDisabled={isBookingLoading || Number(event.seats) <= 0}
                  radius="lg"
                  className="h-12 w-full bg-indigo-600 font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30"
                >
                  <LuTicket size={19} />
                  {isBookingLoading ? "Booking..." : "Book This Event"}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <LuShieldCheck size={14} />
                  Secure event booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
