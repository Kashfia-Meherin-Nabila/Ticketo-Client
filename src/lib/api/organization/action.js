"use server"

import { getUserToken } from "@/lib/core/session";
import { serverMutation } from "../server"

export const addOrganization = async (data) => {
  const token = await getUserToken();

  const resData = await serverMutation(
    "/api/organization",
    "POST",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return resData;
}

export const updateOrganization = async (data, id) => {
  const token = await getUserToken();

  const resData = await serverMutation(
    `/api/organization/${id}`,
    "PATCH",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return resData;
}