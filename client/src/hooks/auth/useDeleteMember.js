import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useDeleteMember() {
  const [deleting, setDeleting] = useState(false);

  const deleteMember = useCallback(async (member) => {
    if (!member) return null;
    setDeleting(true);
    try {
      await api.delete(`/users/members/${member.id}`);
      toast.success("User deleted successfully");
      return member.id;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
      return null;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteMember, deleting };
}
