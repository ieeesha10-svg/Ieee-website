import toast from "react-hot-toast";
import api from "../../../utils/api";

export function useDeleteForm(refetch) {
  const deleteForm = async (id, title) => {
    try {
      await api.delete(`/form/${id}`);
      toast.success(`"${title || "Form"}" form is now deleted`);
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error deleting form:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete form";
      toast.error(msg);
    }
  };

  return { deleteForm };
}
