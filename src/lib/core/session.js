"use server";
import { headers } from "next/headers";
import { authClient } from "../auth-client";

export const getUserToken = async () => {
  try {
    const incomingHeaders = await headers();

    const { data, error } = await authClient.token({
      fetchOptions: {
        headers: {
          cookie: incomingHeaders.get("cookie") ?? "",
        },
      },
    });

    if (error || !data?.token) {
      console.error("Failed to get Better Auth token:", error);
      return null;
    }

    return data.token;
  } catch (error) {
    console.error("Get user token error:", error);
    return null;
  }
};