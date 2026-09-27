"use server";

import { getUserToken } from "@/lib/core/session";
import { serverFetch } from "../server";

export const getOrganizerPayments = async (email) => {
  const token = await getUserToken();
  const encodedEmail = encodeURIComponent(email);

  return serverFetch(
    `/api/payments/organizer/${encodedEmail}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};