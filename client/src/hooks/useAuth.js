import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * useAuth hook — convenience wrapper around AuthContext.
 */
export function useAuth() {
  return useContext(AuthContext);
}
