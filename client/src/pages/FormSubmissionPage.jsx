import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Upload, CheckCircle, X } from "lucide-react";
import { usePublicForm } from "../hooks/usePublicFormById";
import { useSubmitForm } from "../hooks/useSubmitForm";
import FormSubmissionSuccessModal from "../components/guest/forms/FormSubmissionSuccessModal";
import RequiredAsterisk from "../components/ui/RequiredAsterisk";
import FooterAlt from "../components/layout/FooterAlt";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { ACCEPTED_FILE_EXTENSIONS, useFileUpload } from "../utils/fileUploadUtils";
import { FORM_TYPE_BADGE } from "../data/formTypes";

function getBadgeInfo(formType) {
  return FORM_TYPE_BADGE[formType] || FORM_TYPE_BADGE.custom;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FormSubmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { form, isLoading, error: fetchError } = usePublicForm(id);
  const { submit, loading: submitting, error: submitError, alreadySubmitted: alreadySubmittedViaSubmit } = useSubmitForm();

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({});
  const fileInputRefs = React.useRef({});
  const submittingRef = React.useRef(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  useEffect(() => {
    if (!user?._id || !id) {
      setCheckingSubmission(false);
      return;
    }
    api
      .get(`/submissions/${user._id}/${id}`)
      .then(() => setAlreadySubmitted(true))
      .catch(() => {})
      .finally(() => setCheckingSubmission(false));
  }, [user?._id, id]);

  const badgeInfo = useMemo(
    () => (form ? getBadgeInfo(form.type) : null),
    [form]
  );

  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const { handleFileSelect, handleFileDrop, handleFileRemove } = useFileUpload(setFiles, setErrors);

  const validate = () => {
    if (!form?.fields) return {};
    const errs = {};
    for (const field of form.fields) {
      if (!field.required) continue;
      if (field.type === "FileUpload") {
        if (!files[field.id]) errs[field.id] = `${field.label} is required`;
        continue;
      }
      const val = answers[field.id];
      if (field.type === "Checkbox") {
        if (!val || val.length === 0) errs[field.id] = `${field.label} is required`;
      } else if (!val || (typeof val === "string" && !val.trim())) {
        errs[field.id] = `${field.label} is required`;
      } else if (
        field.id.toLowerCase().includes("email") &&
        !EMAIL_RE.test(val)
      ) {
        errs[field.id] = "Please enter a valid email address";
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    submittingRef.current = true;
    const result = await submit(id, answers, files);
    submittingRef.current = false;
    if (result) {
      setShowSuccess(true);
    }
  };

  const renderField = (field) => {
    const showError = errors[field.id];

    switch (field.type) {
      case "TextArea":
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {field.label}
              {field.required && (
                <RequiredAsterisk color="text-primary" />
              )}
            </label>
            <textarea
              value={answers[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Your answer"}
              rows={4}
              className={`w-full rounded-lg border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none ${
                showError
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-border"
              }`}
            />
            {showError && (
              <span className="text-xs text-red-500">{showError}</span>
            )}
          </div>
        );

      case "Dropdown":
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {field.label}
              {field.required && (
                <RequiredAsterisk color="text-primary" />
              )}
            </label>
            <div className="relative">
              <select
                value={answers[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={`w-full appearance-none rounded-lg border bg-input px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  showError
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-border"
                }`}
              >
                <option value="" disabled>
                  Select {field.label.toLowerCase()}
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
            </div>
            {showError && (
              <span className="text-xs text-red-500">{showError}</span>
            )}
          </div>
        );

      case "Checkbox":
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {field.label}
              {field.required && (
                <RequiredAsterisk color="text-primary" />
              )}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {field.options?.map((opt) => {
                const checked = (answers[field.id] || []).includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border bg-input hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? "bg-primary border-primary"
                          : "border-muted"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      value={opt}
                      checked={checked}
                      onChange={(e) => {
                        const current = answers[field.id] || [];
                        const next = e.target.checked
                          ? [...current, opt]
                          : current.filter((v) => v !== opt);
                        handleChange(field.id, next);
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm text-foreground font-medium">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
            {showError && (
              <span className="text-xs text-red-500">{showError}</span>
            )}
          </div>
        );

      case "FileUpload": {
        const selectedFile = files[field.id];
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {field.label}
              {field.required && (
                <RequiredAsterisk color="text-primary" />
              )}
            </label>
            {selectedFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-4 py-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Upload size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFileRemove(field.id)}
                  className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-red-500 transition-colors"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(field.id, e)}
                onClick={() => fileInputRefs.current[field.id]?.click()}
                className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-border bg-input hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <Upload size={18} className="text-muted" />
                <span className="text-sm text-muted font-medium">
                  Drop your file here
                </span>
                <span className="text-[11px] text-muted/60">
                  PDF, Images, Docs · Max 10 MB
                </span>
              </div>
            )}
            <input
              ref={(el) => { fileInputRefs.current[field.id] = el; }}
              type="file"
              accept={ACCEPTED_FILE_EXTENSIONS}
              className="hidden"
              onChange={(e) => handleFileSelect(field.id, e.target.files[0])}
            />
            {showError && (
              <span className="text-xs text-red-500">{showError}</span>
            )}
          </div>
        );
      }

      default:
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {field.label}
              {field.required && (
                <RequiredAsterisk color="text-primary" />
              )}
            </label>
            <input
              type="text"
              value={answers[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Your answer"}
              className={`w-full rounded-lg border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                showError
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-border"
              }`}
            />
            {showError && (
              <span className="text-xs text-red-500">{showError}</span>
            )}
          </div>
        );
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto animate-pulse space-y-5">
          <div className="h-5 w-24 rounded-md bg-card-alt" />
          <div className="h-8 w-3/4 rounded bg-card-alt" />
          <div className="h-4 w-full rounded bg-card-alt" />
          <div className="border-t border-border my-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 rounded bg-card-alt" />
              <div className="h-11 w-full rounded-lg bg-card-alt" />
            </div>
          ))}
          <div className="h-11 w-full rounded-lg bg-card-alt" />
        </div>
      </section>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Form Not Found
          </h2>
          <p className="text-muted text-sm">{fetchError}</p>
          <button
            type="button"
            onClick={() => navigate("/applications")}
            className="mt-6 px-5 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
          >
            ← Back to Forms
          </button>
        </div>
      </section>
    );
  }

  if (!form) return null;

  const hasSubmitted = alreadySubmitted || alreadySubmittedViaSubmit;

  return (
    <section className="py-20 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-card-alt border border-border rounded-xl p-8">
          {checkingSubmission ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : hasSubmitted ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Already Submitted</h2>
              <p className="text-sm text-muted max-w-sm">
                You have already submitted <strong>{form.title}</strong>. If you need to make changes, please contact the branch committee.
              </p>
              <button
                type="button"
                onClick={() => navigate("/applications")}
                className="mt-6 px-5 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
              >
                ← Back to Forms
              </button>
            </div>
          ) : (
            <>
              {/* Badge */}
          {badgeInfo && (
            <span
              className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${badgeInfo.badge}`}
              style={badgeInfo.badgeStyle}
						>
							<span className="inline-block w-1.5 h-1.5 rounded-full shrink-0 mr-2" style={{ backgroundColor: badgeInfo.dotColor }} />
              {badgeInfo.label}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {form.title}
          </h1>

          {/* Description */}
          {form.description && (
            <p className="text-sm text-muted leading-relaxed mb-4">
              {form.description}
            </p>
          )}

          {/* Required fields note */}
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-input text-xs text-muted mb-6">
            Fields marked with <RequiredAsterisk color="text-primary" /> are required
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-6" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {form.fields?.map((field) => renderField(field))}

            {/* Submit error */}
            {submitError && (
              <div className="rounded-lg border border-red-400/30 bg-red-50 dark:bg-red-900/20 p-3">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-primary-linear"
            >
              {submitting ? "Submitting..." : "Submit Application →"}
            </button>

          </form>
            </>
					)}
          
          {/* Expiration notice */}
          {form.endDate && (
            <p className="mt-3 text-xs md:text-sm text-muted mb-4">
              This form will not accept responses after {new Date(form.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            </p>
					)}
          
        </div>
        {/* Footer microcopy */}
        <p className="text-[11px] mt-3 text-muted/60 text-center leading-relaxed">
          Your data is handled in accordance with IEEE privacy policy.
				</p>
			</div>
      
      <FooterAlt tagline="Keep an eye on your email for responses" />

      {/* Success Modal */}
      <FormSubmissionSuccessModal
        isOpen={showSuccess}
        formTitle={form.title}
        onBackToHome={() => navigate("/applications")}
      />
    </section>
  );
}
