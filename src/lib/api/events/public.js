import { baseURL } from "../baseURL";

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

  const url = `${baseURL}/api/events?${params.toString()}`;

  console.log("Fetching public events:", url);

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const text = await res.text();

  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    console.error("Invalid JSON from events API:", text);
    throw new Error("Events server returned an invalid response.");
  }

  if (!res.ok) {
    throw new Error(
      result?.message ||
        `Failed to load events (${res.status})`
    );
  }

  return result;
};