"use server";

import { serverMutation } from "../server";

export const addEvent = async (data) => {
  const resData = await serverMutation(
    "/api/events",
    "POST",
    data
  );

  return resData;
};

export const updateEvent = async (data, id) => {
  const resData = await serverMutation(
    `/api/events/${id}`,
    "PATCH",
    data
  );

  return resData;
};

export const deleteEvent = async (id) => {
  const resData = await serverMutation(
    `/api/events/${id}`,
    "DELETE"
  );

  return resData;
};