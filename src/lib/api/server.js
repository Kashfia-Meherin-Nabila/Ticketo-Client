// import { baseURL } from "./baseURL";

// export const serverMutation = async (path,method,data) => {
//   const res = await fetch(`${baseURL}${path}`,{
//     method:method,
//     headers:{
//         "Content-Type": "application/json"
//     },
//     body:JSON.stringify(data),
//     cache: "no-store",
//   });
//   console.log("URL:", `${baseURL}/api/organization`);
//   return res.json();
  
// };

// export const serverFetch = async (path) => {
//   const res = await fetch(`${baseURL}${path}`,{
//      cache: "no-store",
//   });
//   return res.json();
// };


// import { baseURL } from "./baseURL";

// export const serverMutation = async (path, method, data) => {
//   const res = await fetch(`${baseURL}${path}`, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//     cache: "no-store",
//   });

//   const text = await res.text();

//   if (!text) {
//     return null;
//   }

//   let result;

//   try {
//     result = JSON.parse(text);
//   } catch (error) {
//     console.error("Invalid JSON response:", text);
//     throw new Error("Server returned an invalid response");
//   }

//   if (!res.ok) {
//     throw new Error(
//       result?.message || `Request failed with status ${res.status}`
//     );
//   }

//   return result;
// };


// export const serverFetch = async (path) => {
//   const res = await fetch(`${baseURL}${path}`, {
//     cache: "no-store",
//   });

//   const text = await res.text();

//   let result = {};

//   try {
//     result = text ? JSON.parse(text) : {};
//   } catch {
//     throw new Error(`Invalid JSON response from ${path}`);
//   }

//   if (!res.ok) {
//     throw new Error(
//       result?.message || `Request failed with status ${res.status}`
//     );
//   }

//   return result;
// };

import { getUserToken } from "../core/session";
import { baseURL } from "./baseURL";
// import { getUserToken } from "./actions/getUserToken"; // adjust path to wherever this file lives

const getAuthHeader = async () => {
  const token = await getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const serverMutation = async (path, method, data, options = {}) => {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const text = await res.text();

  if (!text) {
    return null;
  }

  let result;

  try {
    result = JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", text);
    throw new Error("Server returned an invalid response");
  }

  if (!res.ok) {
    throw new Error(
      result?.message || `Request failed with status ${res.status}`
    );
  }

  return result;
};

export const serverFetch = async (path, options = {}) => {
  const authHeader = await getAuthHeader();

  const url = `${baseURL}${path}`;

  console.log("=================================");
  console.log("SERVER FETCH URL:", url);
  console.log("BASE URL:", baseURL);
  console.log("PATH:", path);
  console.log("=================================");

  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        ...authHeader,
        ...options.headers,
      },
    });

    const text = await res.text();

    console.log("API STATUS:", res.status);
    console.log("API RESPONSE:", text);

    let result = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("INVALID JSON:", text);
      throw new Error(`Invalid JSON response from ${path}`);
    }

    if (!res.ok) {
      console.error("API ERROR:", {
        url,
        status: res.status,
        response: result,
      });

      throw new Error(
        result?.message || `Request failed with status ${res.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("SERVER FETCH FAILED:", {
      url,
      message: error.message,
      error,
    });

    throw error;
  }
};

// export const serverFetch = async (path, options = {}) => {
//   const authHeader = await getAuthHeader();

//   const res = await fetch(`${baseURL}${path}`, {
//     cache: "no-store",
//     ...options,
//     headers: {
//       ...authHeader,
//       ...options.headers,
//     },
//   });

//   const text = await res.text();

//   let result = {};

//   try {
//     result = text ? JSON.parse(text) : {};
//   } catch {
//     throw new Error(`Invalid JSON response from ${path}`);
//   }

//   if (!res.ok) {
//     throw new Error(
//       result?.message || `Request failed with status ${res.status}`
//     );
//   }

//   return result;
// };