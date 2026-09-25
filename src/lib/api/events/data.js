"use server";

import { serverFetch } from "../server";

// Get all events of an organization
export const myEvents = async (organizationId) => {
  const resData = await serverFetch(
    `/api/events/organization/${organizationId}`
  );

  return resData;
};

// ==========================================
// PUBLIC EVENTS
// ==========================================

export const publicEvents = async ({
  page = 1,
  limit = 8,
  search = "",
  category = "",
  location = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (search) {
    params.set("search", search);
  }

  if (category) {
    params.set("category", category);
  }

  if (location) {
    params.set("location", location);
  }

  const resData = await serverFetch(
    `/api/events?${params.toString()}`
  );

  return resData;
};

// ==========================================
// SINGLE EVENT
// ==========================================

export const getEventById = async (id) => {
  const resData = await serverFetch(
    `/api/events/${id}`
  );

  return resData;
};

// ==========================================
// FILTER OPTIONS
// ==========================================

export const eventFilters = async () => {
  return serverFetch("/api/events-filters");
};

// // Get single event
// export const getEvent = async (id) => {
//   const resData = await serverFetch(
//     `/api/events/${id}`
//   );

//   return resData;
// };

// export const getEvents =async (params) => {
//   const qs = new URLSearchParams();
//   Object.entries(params).forEach(([k, v]) => {
//     if (v !== "" && v != null) qs.set(k, v);
//   });
//   return serverFetch(`/api/events?${qs.toString()}`);
// };

// export const getEventFilters = async() => serverFetch("/api/events-filters");