"use server";

export async function createBooking(bookingPayload) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    console.log("Sending booking payload:", bookingPayload);

    const res = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...bookingPayload,

        transactionId:
          bookingPayload.transactionId ||
          `TXN-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000,
          )}`,

        bookingDate:
          bookingPayload.bookingDate ||
          new Date().toISOString(),
      }),
    });

    const data = await res.json();

    console.log("Booking API response:", data);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        message:
          data?.message || "Failed to create booking.",
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error("createBooking error:", error);

    return {
      success: false,
      message:
        error?.message || "Network error.",
    };
  }
}