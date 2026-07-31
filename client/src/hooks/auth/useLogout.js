import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useLogout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setLoading(true);
      try {
        await api.post("/users/logout");
        toast.success("Logged out successfully!");
        setTimeout(() => navigate("/"), 1000);
      } catch (error) {
        toast.error(error.response?.data?.message || "Logout failed");
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  return { logout, loading };
}
