import toast from "react-hot-toast";
import api from "../../../utils/api";

export function useToggleForm(refetch) {
  const toggleFormStatus = async (id, title, becomingOpen) => {
    try {
      await api.put(`/form/${id}/toggle`);
      toast.success(
        `"${title || "Form"}" is now ${becomingOpen ? "open" : "closed"}`
      );
      if (refetch) await refetch();
    } catch {
      toast.error("Failed to toggle form status");
    }
  };

  return { toggleFormStatus };
}
