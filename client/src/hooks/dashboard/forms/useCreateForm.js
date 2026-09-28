import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { ALLOWED_TYPES } from "../../../data/fieldTypes";
import { slugifyFieldLabel } from "../../../utils/fieldId";
import { buildDefaultFields, isIdentityField } from "../../../utils/formIdentity";

const INITIAL_FORM_DATA = {
  title: "",
  type: "",
  description: "",
  startDate: "",
  endDate: "",
  maxSubmissions: "",
  requiresLogin: false,
  sendEmailOnSubmission: false,
  submissionEmailSubject: "",
  submissionEmailBody: "",
};

const hasOptions = (type) => type === "Dropdown" || type === "Checkbox";

export function useCreateForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });
  const [fieldsList, setFieldsList] = useState(() => buildDefaultFields());
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

  // Full Name and Email are part of every form, not part of the layout the
  // dashboard owner arranges: `submitForm` requires both, the ticket QR and the
  // confirmation email are keyed on the email, and the submissions export on the
  // name. So the label and type are pinned — editing either would change the id
  // the answers are stored under and break those lookups — and `required` is
  // forced back on. `moveField` still works: order does not affect any of it.
  const updateFieldAt = useCallback((index, patch) => {
    setFieldsList((prev) => {
      const current = prev[index];
      if (!current) return prev;

      const updated = [...prev];
      // Label, type and `required` are pinned and re-applied after the patch, so
      // nothing that reaches this can rename, retype or make optional the field
      // the answers for a name or an email are stored under. Any other key in the
      // patch still applies.
      updated[index] = isIdentityField(current)
        ? { ...current, ...patch, label: current.label, type: current.type, required: true }
        : { ...current, ...patch };
      return updated;
    });
  }, []);

  const removeFieldAt = useCallback((index) => {
    setFieldsList((prev) => {
      if (isIdentityField(prev[index])) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const moveField = useCallback((from, to) => {
    setFieldsList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  // Returns a flat `errors` object plus `fieldErrors`, keyed by field index, so
  // the builder can put each message under the row that caused it. The server
  // re-checks all of this; this exists to fail fast and point at the row.
  const validate = useCallback(() => {
    const newErrors = {};
    const fieldErrors = {};

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

    // The server refuses to enable the feature with an empty message, so catch
    // it here where the message can be shown next to the textarea.
    if (formData.sendEmailOnSubmission && !formData.submissionEmailBody.trim()) {
      newErrors.submissionEmailBody = "Write the message to send, or turn the email off";
    }

    if (fieldsList.length === 0) {
      newErrors.fields = "Add at least one field to the form";
      return { ...newErrors, fieldErrors };
    }

    const firstIndexForId = new Map();
    const duplicateLabels = [];

    fieldsList.forEach((f, index) => {
      const label = String(f.label ?? "").trim();

      if (!label) {
        fieldErrors[index] = "Field label is required";
        return;
      }

      if (!ALLOWED_TYPES.includes(f.type)) {
        fieldErrors[index] = "Choose a valid field type";
        return;
      }

      if (hasOptions(f.type)) {
        const options = (f.options ?? []).filter((o) => o.trim());
        if (options.length === 0) {
          fieldErrors[index] =
            "Add at least one option, or switch the type";
          return;
        }
      }

      // Ids are derived from labels server-side and are the keys answers are
      // stored under, so a label that yields nothing is unusable, and two labels
      // that yield the same id would silently share one answer.
      const id = slugifyFieldLabel(label);
      if (!id) {
        fieldErrors[index] =
          "This label can't be turned into a field id — use at least one letter or number";
        return;
      }

      if (firstIndexForId.has(id)) {
        fieldErrors[index] = "Duplicates an earlier field label";
        duplicateLabels.push(label);
      } else {
        firstIndexForId.set(id, index);
      }
    });

    if (duplicateLabels.length > 0) {
      newErrors.fields = `Every field label must be unique. These are repeated: ${duplicateLabels.join(", ")}`;
    }

    return { ...newErrors, fieldErrors };
  }, [formData, fieldsList]);

  // Note: field `id`s are deliberately not sent. The server derives them from the
  // labels (see server/utils/fieldId.js) because that id is the key every answer
  // is stored under. The builder previously sent its own slug and a `_2` suffix for
  // collisions, but the server overwrote both with a different algorithm, so two
  // labels could still end up sharing one answer key.
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
      payload.endDate = new Date(formData.endDate + "T23:59:59.999Z").toISOString();
    }

    if (formData.maxSubmissions && formData.maxSubmissions !== "") {
      payload.maxSubmissions = Number(formData.maxSubmissions);
    }

    // Always sent as a real boolean. The server rejects anything else, and a
    // truthy string such as "false" would otherwise make a public form
    // login-only.
    payload.requiresLogin = Boolean(formData.requiresLogin);

    payload.sendEmailOnSubmission = Boolean(formData.sendEmailOnSubmission);

    // The server rejects an enabled flag with an empty body, so only send the
    // wording when the feature is on. The subject is optional: the server falls
    // back to "We received your submission for <title>".
    if (formData.sendEmailOnSubmission) {
      payload.submissionEmailSubject = formData.submissionEmailSubject.trim();
      payload.submissionEmailBody = formData.submissionEmailBody.trim();
    }

    payload.fields = fieldsList.map((f) => {
      const fieldObj = {
        label: f.label.trim(),
        type: f.type,
        // Belt and braces: the row controls are already locked, and the server
        // rejects an optional name or email, so never emit one.
        required: isIdentityField(f) ? true : Boolean(f.required),
      };

      if (hasOptions(f.type) && f.options) {
        const filled = f.options
          .map((o) => o.trim())
          .filter((o) => o.length > 0);
        if (filled.length > 0) fieldObj.options = filled;
      }

      return fieldObj;
    });

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

    // `fieldErrors` is always present (possibly empty), so it has to be split out
    // before testing whether anything actually failed.
    const { fieldErrors, ...formErrors } = validate();
    if (
      Object.keys(formErrors).length > 0 ||
      Object.keys(fieldErrors).length > 0
    ) {
      setErrors({ ...formErrors, fieldErrors });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      await api.post("/form", payload);

      setFormData({ ...INITIAL_FORM_DATA });
      setFieldsList(buildDefaultFields());

      navigate("/dashboard/forms");
    } catch (error) {
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
