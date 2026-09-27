"use server";

import { getUserToken } from "@/lib/core/session";
import { serverMutation } from "../server";

export const addEvent = async (data) => {
  const token = await getUserToken();

  const resData = await serverMutation(
    "/api/events",
    "POST",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return resData;
};

export const updateEvent = async (data, id) => {
  const token = await getUserToken();

  const resData = await serverMutation(
    `/api/events/${id}`,
    "PATCH",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return resData;
};

export const deleteEvent = async (id) => {
  const token = await getUserToken();

  const resData = await serverMutation(
    `/api/events/${id}`,
    "DELETE",
    undefined,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return resData;
};