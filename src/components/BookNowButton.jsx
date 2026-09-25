"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { createBooking } from "@/lib/api/bookings/action";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function BookNowButton({ event }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

 const handleBookNow = async () => {
  if (!session?.user?.email) {
    toast.error("Please login to book tickets");
    return;
  }

  const payload = {
    eventId: event._id,
    eventTitle: event.title,
    attendeeEmail: session.user.email,
    quantity: 1,
    amount: event.ticketPrice || 0,
    paymentStatus: "confirmed",
    transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  const result = await createBooking(payload);

  if (result?.insertedId || result?.acknowledged || result?.success) {
    toast.success("Ticket booked!");
    setIsModalOpen(true); // Only show modal when DB insert succeeds
  } else {
    toast.error(result?.message || "Failed to create booking");
  }
};

  return (
    <button
      onClick={handleBookNow}
      disabled={loading}
      className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
    >
      {loading ? "Processing..." : "Book Now"}
    </button>
  );
}