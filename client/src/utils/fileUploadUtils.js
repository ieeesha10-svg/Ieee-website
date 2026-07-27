export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function useFileUpload(setFiles, setErrors) {
  const handleFileSelect = (fieldId, file) => {
    if (!file) return;
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "File type not supported. Accepted: PDF, JPG, PNG, GIF, WEBP, DOC, DOCX",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "File size must be under 10MB",
      }));
      return;
    }
    setFiles((prev) => ({ ...prev, [fieldId]: file }));
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleFileDrop = (fieldId, e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(fieldId, file);
  };

  const handleFileRemove = (fieldId) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  return { handleFileSelect, handleFileDrop, handleFileRemove };
}
