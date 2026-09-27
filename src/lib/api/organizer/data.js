"use server"

import { getUserToken } from "@/lib/core/session";
import { serverFetch } from "../server";

export const getOrganizerOverview = async (email) => {
  const token = await getUserToken();
  const encodedEmail = encodeURIComponent(email);

  return serverFetch(
    `/api/organizer/overview/${encodedEmail}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};