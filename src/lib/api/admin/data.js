import { serverFetch } from "../server";

// ==========================================
// ADMIN STATS
// ==========================================

export const adminStats = async () => {
  return serverFetch("/api/admin/stats");
};

// ==========================================
// ADMIN USERS
// ==========================================

export const adminUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  return serverFetch(`/api/admin/users?${params.toString()}`);
};

// ==========================================
// ADMIN EVENTS
// ==========================================

export const adminEvents = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  return serverFetch(`/api/admin/events?${params.toString()}`);
};

// ==========================================
// ADMIN TRANSACTIONS
// ==========================================

export const adminTransactions = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  return serverFetch(
    `/api/admin/transactions?${params.toString()}`
  );
};

// ==========================================
// ADMIN ANALYTICS
// ==========================================

export const adminAnalytics = async () => {
  return serverFetch("/api/admin/analytics");
};