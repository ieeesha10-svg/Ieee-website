import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useUpdateRole() {
  const [updatingRole, setUpdatingRole] = useState(null);

  const updateRole = useCallback(async (memberId, newRole, previousRole, setMemberRoles, successToast) => {
    setMemberRoles((prev) => ({ ...prev, [memberId]: newRole }));
    setUpdatingRole(memberId);

    try {
      await api.patch(`/users/members/${memberId}`, { role: newRole });
      if (successToast) {
        toast(successToast.message, successToast.options);
      } else {
        toast.success("Role updated successfully");
      }
    } catch (err) {
      setMemberRoles((prev) => ({ ...prev, [memberId]: previousRole }));
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  }, []);

  return { updatingRole, updateRole };
}