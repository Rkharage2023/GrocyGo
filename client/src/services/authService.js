import API from "./api";

/**
 * Auth service — centralised API calls for authentication.
 * Uses the shared Axios instance (with auth token interceptor).
 */


/** Get the currently authenticated user's profile. */
export const getProfile = () =>
  API.get("/auth/profile").then((r) => r.data);

/** Update the currently authenticated user's profile. */
export const updateProfile = (name, mobile) =>
  API.put("/auth/profile", { name, mobile }).then((r) => r.data);

/** Send OTP to mobile. */
export const sendOtp = (mobile) =>
  API.post("/auth/send-otp", { mobile }).then((r) => r.data);

/** Verify OTP. */
export const verifyOtp = (mobile, otp, name = null, password = null) => {
  const payload = { mobile, otp };
  if (name) payload.name = name;
  if (password) payload.password = password;
  return API.post("/auth/verify-otp", payload).then((r) => r.data);
};

