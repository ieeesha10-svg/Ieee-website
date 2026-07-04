import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useUserUpdate(userId) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(`/users/members/${userId}`)
      .then((res) => {
        if (!cancelled) setUserData(res.data?.data || res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || "Failed to load user data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const updateProfile = async (payload) => {
    setSavingProfile(true);
    try {
      const res = await api.put(`/users/profile/${userId}`, payload);
      if (res.data?.user) setUserData(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async (payload) => {
    setSavingPassword(true);
    try {
      await api.put(`/users/update-password/${userId}`, payload);
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
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
  };
}
