import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export function useChangeCommittee() {
  const [updatingCommittee, setUpdatingCommittee] = useState(null);

  const updateCommittee = useCallback(
    async (memberId, memberName, newCommittee, previousCommittee, setMemberCommittees) => {
      setMemberCommittees((prev) => ({ ...prev, [memberId]: newCommittee }));
      setUpdatingCommittee(memberId);

      try {
        await api.put(`/committee-requests/${memberId}/position`, {
          userId: memberId,
          committee_position: newCommittee,
        });
        toast.success(
          memberName
            ? `${memberName}'s committee updated successfully`
            : "Committee updated successfully",
        );
      } catch (err) {
        setMemberCommittees((prev) => ({ ...prev, [memberId]: previousCommittee }));
        toast.error(err.response?.data?.message || "Failed to update committee");
      } finally {
        setUpdatingCommittee(null);
      }
    },
    [],
  );

  return { updatingCommittee, updateCommittee };
}
