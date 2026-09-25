"use server";

export async function createBooking(bookingPayload) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    console.log("Sending payload to backend:", bookingPayload);

    const res = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...bookingPayload,
        transactionId:
          bookingPayload.transactionId ||
          `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingDate: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    console.log("Backend response:", data);

    if (!res.ok) {
      return { success: false, message: data.message || "Failed to create booking" };
    }

    return { success: true, ...data };
  } catch (error) {
    console.error("Error in createBooking Server Action:", error);
    return { success: false, message: error.message || "Network error" };
  }
}