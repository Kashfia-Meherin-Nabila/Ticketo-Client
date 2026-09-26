import { serverFetch } from "../server";

export const getOrganizerOverview = async (
  email
) => {
  const encodedEmail = encodeURIComponent(email);

  return serverFetch(
    `/api/organizer/overview/${encodedEmail}`
  );
};