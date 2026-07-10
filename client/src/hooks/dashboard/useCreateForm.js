import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { ALLOWED_TYPES } from "../../data/fieldTypes";

const INITIAL_FORM_DATA = {
  title: "",
  type: "",
  description: "",
  startDate: "",
  endDate: "",
  maxSubmissions: "",
};

const DEFAULT_FIELDS = [
  { id: "name", label: "Full Name", type: "TextInput", required: true },
  { id: "email", label: "Email", type: "TextInput", required: true },
];

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "_");
}

export function useCreateForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });
  const [fieldsList, setFieldsList] = useState(DEFAULT_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isAuthorized =
    user?.role === "xcom" || user?.role === "board";

  const updateField = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addField = useCallback(() => {
    setFieldsList((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "",
        type: "TextInput",
        required: false,
      },
    ]);
  }, []);

  const updateFieldAt = useCallback((index, patch) => {
    setFieldsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  }, []);

  const removeFieldAt = useCallback((index) => {
    setFieldsList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveField = useCallback((from, to) => {
    setFieldsList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Form title is required";
    }

    if (!formData.type || !formData.type.trim()) {
      newErrors.type = "Form type is required";
    }

    if (formData.maxSubmissions && formData.maxSubmissions !== "") {
      const num = Number(formData.maxSubmissions);
      if (!Number.isInteger(num) || num <= 0) {
        newErrors.maxSubmissions = "Must be a positive number";
      }
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    if (fieldsList.length > 0) {
      const emptyLabel = fieldsList.some(
        (f) => !f.label || !f.label.trim()
      );
      const invalidType = fieldsList.some(
        (f) => !ALLOWED_TYPES.includes(f.type)
      );
      const emptyDropdown = fieldsList.some(
        (f) =>
          f.type === "Dropdown" &&
          (!f.options ||
            f.options.length === 0 ||
            f.options.every((o) => !o.trim()))
      );

      if (emptyLabel) {
        newErrors.fields = "All field labels are required";
        const flagged = fieldsList.filter(
          (f) => !f.label || !f.label.trim()
        );
        console.warn(
          "[useCreateForm] Fields with empty labels:",
          flagged
        );
      } else if (invalidType) {
        newErrors.fields = "Each field must have a valid type";
        const flagged = fieldsList.filter(
          (f) => !ALLOWED_TYPES.includes(f.type)
        );
        console.warn(
          "[useCreateForm] Fields with invalid type:",
          flagged
        );
      } else if (emptyDropdown) {
        newErrors.fields =
          "Each Dropdown field must have at least one option";
        const flagged = fieldsList.filter(
          (f) =>
            f.type === "Dropdown" &&
            (!f.options ||
              f.options.length === 0 ||
              f.options.every((o) => !o.trim()))
        );
        console.warn(
          "[useCreateForm] Dropdown fields with no options:",
          flagged
        );
      }

      const slugs = fieldsList.map((f) =>
        slugify(f.label || "")
      );
      const hasDups = slugs.length !== new Set(slugs).size;
      if (hasDups && !newErrors.fields) {
        newErrors.fields = "Each field label must be unique";
        console.warn(
          "[useCreateForm] Duplicate field slugs detected"
        );
      }
    }

    return newErrors;
  }, [formData, fieldsList]);

  const buildPayload = useCallback(() => {
    const payload = {};

    payload.title = formData.title.trim();
    payload.type = formData.type.trim();

    if (formData.description && formData.description.trim()) {
      payload.description = formData.description.trim();
    }

    if (formData.startDate) {
      payload.startDate = new Date(formData.startDate).toISOString();
    }

    if (formData.endDate) {
      payload.endDate = new Date(formData.endDate).toISOString();
    }

    if (formData.maxSubmissions && formData.maxSubmissions !== "") {
      payload.maxSubmissions = Number(formData.maxSubmissions);
    }

    if (fieldsList.length > 0) {
      const usedSlugs = new Map();
      payload.fields = fieldsList.map((f) => {
        let fieldId = slugify(f.label);
        if (usedSlugs.has(fieldId)) {
          const count = usedSlugs.get(fieldId) + 1;
          usedSlugs.set(fieldId, count);
          fieldId = `${fieldId}_${count}`;
        } else {
          usedSlugs.set(fieldId, 1);
        }

        const fieldObj = {
          id: fieldId,
          label: f.label.trim(),
          type: f.type,
          required: f.required,
        };

        if (
          f.type === "Dropdown" &&
          f.options &&
          f.options.length > 0
        ) {
          const filtered = f.options.filter((o) => o.trim());
          if (filtered.length > 0) {
            fieldObj.options = filtered;
          }
        }

        return fieldObj;
      });
    }

    return payload;
  }, [formData, fieldsList]);

  const handleSubmit = useCallback(async () => {
    setErrors({});

    if (!isAuthorized) {
      setErrors({
        general: "You do not have permission to create forms.",
      });
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      await api.post("/form", payload);

      setFormData({ ...INITIAL_FORM_DATA });
      setFieldsList([]);

      navigate("/dashboard/forms");
    } catch (error) {
      console.error("[useCreateForm] Submit error:", error);

      const status = error.response?.status;
      const data = error.response?.data || {};
      const serverMsg =
        data.message ||
        data.error ||
        data.msg ||
        data.detail ||
        (typeof data === "string" ? data : null);

      if (data.errors && typeof data.errors === "object") {
        const mapped = {};
        for (const [key, msg] of Object.entries(data.errors)) {
          const message = Array.isArray(msg) ? msg[0] : msg;
          if (key in INITIAL_FORM_DATA) {
            mapped[key] = message;
          }
        }

        if (Object.keys(mapped).length > 0) {
          setErrors(mapped);
        } else {
          setErrors({
            general:
              serverMsg ||
              "Validation failed. Please check your inputs.",
          });
        }
      } else if (status === 401 || status === 403) {
        setErrors({
          general:
            serverMsg ||
            "You are not authorized to perform this action.",
        });
      } else if (serverMsg) {
        setErrors({ general: serverMsg });
      } else if (status === 400) {
        setErrors({
          general: "Validation failed. Please check your inputs.",
        });
      } else {
        setErrors({
          general: "Something went wrong, please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthorized, validate, buildPayload, navigate]);

  return {
    formData,
    updateField,
    fieldsList,
    addField,
    updateFieldAt,
    removeFieldAt,
    moveField,
    handleSubmit,
    isSubmitting,
    errors,
    isAuthorized,
  };
}
