"use server"

import { getUserToken } from "@/lib/core/session";
import { serverFetch } from "../server"

export const myOrganization = async (email) => {
  const token = await getUserToken();

  const result = await serverFetch(`/api/organization/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return result;
}