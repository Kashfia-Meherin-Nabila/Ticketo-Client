// "use server";

// import { getUserToken } from "@/lib/core/session";
// import { serverFetch } from "../server";

// // Get all events of an organization
// export const myEvents = async (organizationId) => {
//   const token =await getUserToken();
//   console.log(token);
//   const resData = await serverFetch(
//     `/api/events/organization/${organizationId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
    
//   );
//   return resData;
// };

// // Fetch organization details by user email, then load events
// export const getOrganizerEventsByEmail = async (organizerEmail) => {
//   try {
//     const token = await getUserToken();

//     const org = await serverFetch(`/api/organization/${organizerEmail}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!org || !org._id) {
//       console.warn("No organization found for email:", organizerEmail);
//       return [];
//     }

//     const events = await myEvents(org._id);
//     return Array.isArray(events) ? events : [];
//   } catch (error) {
//     console.error("Failed to fetch organizer events:", error);
//     return [];
//   }
// };

// // ==========================================
// // PUBLIC EVENTS
// // ==========================================

// export const publicEvents = async ({
//   page = 1,
//   limit = 8,
//   search = "",
//   category = "",
//   location = "",
// } = {}) => {
//   const params = new URLSearchParams();

//   params.set("page", page);
//   params.set("limit", limit);

//   if (search) {
//     params.set("search", search);
//   }

//   if (category) {
//     params.set("category", category);
//   }

//   if (location) {
//     params.set("location", location);
//   }

//   const resData = await serverFetch(
//     `/api/events?${params.toString()}`
//   );

//   return resData;
// };

// // ==========================================
// // SINGLE EVENT
// // ==========================================

// export const getEventById = async (id) => {
//   const token =await getUserToken();
//   console.log(token);
//   const resData = await serverFetch(
//     `/api/events/${id}`,{
//       headers: {
//     "Authorization": `Bearer ${token}`
//   },
//     }
//   );

//   return resData;
// };

// // ==========================================
// // FILTER OPTIONS
// // ==========================================

// export const eventFilters = async () => {
//   return serverFetch("/api/events-filters");
// };



"use server";

import { getUserToken } from "@/lib/core/session";
import { serverFetch } from "../server";
import { baseURL } from "../baseURL";

// ==========================================
// ORGANIZER EVENTS
// ==========================================

// Get all events of an organization
export const myEvents = async (organizationId) => {
  const token = await getUserToken();

  const resData = await serverFetch(
    `/api/events/organization/${organizationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return resData;
};

// Fetch organization details by user email, then load events
export const getOrganizerEventsByEmail = async (organizerEmail) => {
  try {
    const token = await getUserToken();

    const org = await serverFetch(
      `/api/organization/${organizerEmail}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!org || !org._id) {
      console.warn(
        "No organization found for email:",
        organizerEmail
      );

      return [];
    }

    const events = await myEvents(org._id);

    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.error(
      "Failed to fetch organizer events:",
      error
    );

    return [];
  }
};

// ==========================================
// PUBLIC EVENTS
// ==========================================

// IMPORTANT:
// This function is called from a Client Component.
// Do NOT use serverFetch() or getUserToken() here.

export const publicEvents = async ({
  page = 1,
  limit = 8,
  search = "",
  category = "",
  location = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) {
    params.set("search", search);
  }

  if (category) {
    params.set("category", category);
  }

  if (location) {
    params.set("location", location);
  }

  const res = await fetch(
    `${baseURL}/api/events?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const text = await res.text();

  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    console.error(
      "Invalid JSON response from public events API:",
      text
    );

    throw new Error(
      "The events server returned an invalid response."
    );
  }

  if (!res.ok) {
    throw new Error(
      result?.message ||
        `Failed to load events (${res.status})`
    );
  }

  return result;
};

// ==========================================
// SINGLE EVENT
// ==========================================

export const getEventById = async (id) => {
  const token = await getUserToken();

  const resData = await serverFetch(
    `/api/events/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return resData;
};

// ==========================================
// FILTER OPTIONS
// ==========================================

export const eventFilters = async () => {
  return serverFetch("/api/events-filters");
};








// export async function getEventsByOrganizer(organizerEmail) {
//   try {
//     const res = await fetch(`${baseURL}/events/organizer/${organizerEmail}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include", // Ensures HTTP-only cookies/sessions are sent
//     });

//     if (!res.ok) {
//       throw new Error("Failed to fetch events");
//     }

//     return await res.json();
//   } catch (error) {
//     console.error("Error fetching organizer events:", error);
//     return { success: false, data: [] };
//   }
// }





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