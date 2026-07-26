import toast from "react-hot-toast";
import api from "../../../utils/api";

export function useUpdateForm(refetch) {
  const updateForm = async (formId, updates) => {
    try {
      const res = await api.put(`/form/${formId}/settings`, updates);
      if (refetch) await refetch();
      return res.data;
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error(error.response?.data?.message || "Failed to update form");
      throw error;
    }
  };

  return { updateForm };
}
