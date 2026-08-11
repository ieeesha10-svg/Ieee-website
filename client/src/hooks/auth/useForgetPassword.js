import { useState, useCallback } from "react";
import api from "../../utils/api";

export function useForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const forgetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/forgot-password", { email });
      return data;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send reset email",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { forgetPassword, loading, error };
}
