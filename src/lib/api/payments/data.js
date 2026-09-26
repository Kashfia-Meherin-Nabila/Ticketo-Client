import { serverFetch } from "../server";

export const getOrganizerPayments = async (email) => {
  const encodedEmail = encodeURIComponent(email);

  return serverFetch(
    `/api/payments/organizer/${encodedEmail}`,
  );
};