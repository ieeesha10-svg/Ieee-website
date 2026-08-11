import { useState, useCallback } from "react";
import api from "../../utils/api";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetPassword = useCallback(async (token, email, newPassword, confirmNewPassword) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users/reset-password", {
        email,
        newPassword,
        confirmNewPassword,
      }, {
        params: { token },
      });
      return data;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to reset password",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPassword, loading, error };
}
