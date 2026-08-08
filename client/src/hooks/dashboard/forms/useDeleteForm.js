import React from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import api from "../../../utils/api";

export function useDeleteForm(refetch) {
  const deleteForm = async (id, title) => {
    try {
      await api.delete(`/form/${id}`);
      toast(`"${title || "Form"}" form is now deleted`, {
        icon: React.createElement(Trash2, { size: 16, className: "text-red-500" }),
      });
      if (refetch) await refetch();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete form";
      toast.error(msg);
    }
  };

  return { deleteForm };
}
