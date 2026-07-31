import { useState, useCallback } from "react";
import api from "../../utils/api";

export function useVerifyAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyAccount = useCallback(async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/verify-email", { email, otp });
      return data;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Verification failed",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyAccount, loading, error };
}
