import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export function useLogout() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setLoading(true);
      try {
        await api.post("/users/logout");
        navigate("/");
        setUser(null);
        toast.success("Logged out successfully!");
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Logout failed");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setUser],
  );

  return { logout, loading };
}
