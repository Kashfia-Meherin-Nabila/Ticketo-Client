"use server";
import { getUserToken } from "@/lib/core/session";
import { serverFetch, serverMutation } from "../server";

export const getAttendeeOverview = async (email) => {
  if (!email)
    return {
      stats: { totalTickets: 0, upcomingEvents: 0, totalSpent: 0 },
      recentTickets: [],
    };
  try {
    const token = await getUserToken();

    return await serverFetch(
      `/api/bookings/overview/${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Failed to fetch attendee overview:", error);
    return {
      stats: { totalTickets: 0, upcomingEvents: 0, totalSpent: 0 },
      recentTickets: [],
    };
  }
};

export const getUserBookings = async (email) => {
  if (!email) return [];
  try {
    const token = await getUserToken();

    const resData = await serverFetch(
      `/api/bookings/user/${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return Array.isArray(resData) ? resData : [];
  } catch (error) {
    console.error("Failed to fetch user bookings:", error);
    return [];
  }
};

export const getOrganizerBookings = async (email) => {
  if (!email) return [];
  try {
    const token = await getUserToken();

    const resData = await serverFetch(
      `/api/bookings/organizer/${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return Array.isArray(resData) ? resData : [];
  } catch (error) {
    console.error("Failed to fetch organizer bookings:", error);
    return [];
  }
};

export const createBooking = async (bookingData) => {
  try {
    const token = await getUserToken();

    const resData = await serverMutation(
      "/api/bookings",
      "POST",
      bookingData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, ...resData };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      message: error.message || "Failed to create booking",
    };
  }
};

export const updateBookingQuantity = async (bookingId, newQuantity) => {
  try {
    const token = await getUserToken();

    const resData = await serverMutation(
      `/api/bookings/${bookingId}`,
      "PATCH",
      { newQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, ...resData };
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to update quantity",
    };
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const token = await getUserToken();

    const resData = await serverMutation(
      `/api/bookings/${bookingId}`,
      "DELETE",
      undefined,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, ...resData };
  } catch (error) {
    console.error(`Error cancelling booking ${bookingId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to cancel booking",
    };
  }
};