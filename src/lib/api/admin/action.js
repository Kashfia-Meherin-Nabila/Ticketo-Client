"use server";

import { serverMutation } from "../server";

// ==========================================
// USER ACTIONS
// ==========================================

export const blockUser = async (id) => {
  return serverMutation(
    `/api/admin/users/${id}/block`,
    "PATCH"
  );
};

export const unblockUser = async (id) => {
  return serverMutation(
    `/api/admin/users/${id}/unblock`,
    "PATCH"
  );
};

// ==========================================
// EVENT ACTIONS
// ==========================================

export const approveEvent = async (id) => {
  return serverMutation(
    `/api/admin/events/${id}/approve`,
    "PATCH"
  );
};

export const rejectEvent = async (id) => {
  return serverMutation(
    `/api/admin/events/${id}/reject`,
    "PATCH"
  );
};

export const deleteAdminEvent = async (id) => {
  return serverMutation(
    `/api/admin/events/${id}`,
    "DELETE"
  );
};