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


import { baseURL } from "./baseURL";

export const serverMutation = async (path, method, data) => {
  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
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

export const serverFetch = async (path) => {
  const res = await fetch(`${baseURL}${path}`, {
    cache: "no-store",
  });

  const text = await res.text();

  // Empty response
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