"use server";

import { serverFetch } from "../server";

// Get all events of an organization
export const myEvents = async (organizationId) => {
  const resData = await serverFetch(
    `/api/events/organization/${organizationId}`
  );

  return resData;
};

// Get single event
export const getEvent = async (id) => {
  const resData = await serverFetch(
    `/api/events/${id}`
  );

  return resData;
};

export const getEvents =async (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v != null) qs.set(k, v);
  });
  return serverFetch(`/api/events?${qs.toString()}`);
};

export const getEventFilters = async() => serverFetch("/api/events-filters");