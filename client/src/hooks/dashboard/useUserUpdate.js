import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export function useUserUpdate(userId) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchUser = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .get(`/users/members/${userId}`)
      .then((res) => {
        setUserData(res.data?.data || res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load user data");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateProfile = async (payload) => {
    setSavingProfile(true);
    try {
      const res = await api.put(`/users/profile/${userId}`, payload);
      if (res.data?.user) setUserData(res.data.user);
      return { success: true, message: "Profile updated successfully!" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile.",
      };
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async (payload) => {
    setSavingPassword(true);
    try {
      await api.put(`/users/update-password/${userId}`, payload);
      return { success: true, message: "Password updated successfully!" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update password.",
      };
    } finally {
      setSavingPassword(false);
    }
  };

  return {
    userData,
    loading,
    error,
    savingProfile,
    savingPassword,
    updateProfile,
    updatePassword,
    refetch: fetchUser,
  };
}