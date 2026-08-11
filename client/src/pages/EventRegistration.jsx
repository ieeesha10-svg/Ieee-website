import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useSubmitForm } from "../hooks/useSubmitForm";
import {
  ACCEPTED_FILE_EXTENSIONS,
  useFileUpload,
} from "../utils/fileUploadUtils";
import { ChevronDown, Upload, X } from "lucide-react";

import Button from "../components/Button";
import Input from "../components/Input";
import HtmlContent from "../components/HtmlContent";

export default function EventRegistration() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const eventImage = location.state?.image || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({});
  const fileInputRefs = React.useRef({});
  const submittingRef = React.useRef(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    submit,
    loading: submitLoading,
    error: submitError,
    alreadySubmitted,
    ticketCode,
    setAlreadySubmitted,
  } = useSubmitForm();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const { data } = await api.get(`/activities/${id}`);
        const activity = data.activity;
        const form = data.form;

        if (!form) {
          setFetchError("no_form");
          return;
        }

        const startDate = form?.startDate || activity?.startDate || null;
        const endDate = form?.endDate || activity?.endDate || null;

        setRegistrationOpen(
          form.status === "Active" &&
            activity.registrationEnabled !== false &&
            !(endDate && new Date(endDate) < new Date()),
        );

        const dateStr =
          startDate && endDate
            ? `From ${new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} To ${new Date(endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
            : startDate
              ? new Date(startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "";
        const startTime = startDate
          ? new Date(startDate).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "";
        const endTime = endDate
          ? new Date(endDate).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "";
        const timeStr =
          startTime && endTime ? `${startTime} – ${endTime}` : startTime || "";

        setFormData({
          formId: form?._id,
          title: activity.title,
          type: activity.type,
          content: activity.content,
          description: activity.description,
          location: activity.location,
          date: dateStr,
          time: timeStr,
          speakers: activity.speakers || [],
          fields: form.fields || [],
          maxSubmissions: form?.maxSubmissions || 0,
          endDate: endDate,
          settings: { requiresLogin: false },
        });

        const initial = {};
        (form.fields || []).forEach((f) => {
          initial[f.id] = f.id === "email" && user?.email ? user.email : "";
        });
        setAnswers(initial);
      } catch {
        setFetchError("not_found");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (fetchError === "not_found") {
      navigate("/not-found", { replace: true });
    }
  }, [fetchError, navigate]);

  useEffect(() => {
    if (!user?._id || !formData?.formId) {
      setCheckingRegistration(false);
      return;
    }
    setCheckingRegistration(true);
    api
      .get(`/users/${user._id}/events`)
      .then((res) => {
        const submissions = res.data?.data || [];
        if (submissions.some((s) => s.formId === formData.formId)) {
          setAlreadySubmitted(true);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingRegistration(false));
  }, [user?._id, formData?.formId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const { handleFileSelect, handleFileDrop, handleFileRemove } = useFileUpload(
    setFiles,
    setErrors,
  );

  const validate = () => {
    const errs = {};
    formData.fields?.forEach((f) => {
      if (f.required) {
        if (f.type === "FileUpload") {
          if (!files[f.id]) errs[f.id] = `${f.label} is required`;
        } else if (f.type === "Checkbox") {
          if (!answers[f.id] || answers[f.id].length === 0) {
            errs[f.id] = `${f.label} is required`;
          }
        } else if (!answers[f.id]?.trim()) {
          errs[f.id] = `${f.label} is required`;
        }
      }
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    submittingRef.current = true;
    const result = await submit(formData.formId, answers, files);
    submittingRef.current = false;
    if (result) {
      setShowSuccess(true);
    }
  };

  const renderField = (field) => {
    const common = {
      key: field.id,
      name: field.id,
      label: field.label,
      placeholder: field.placeholder || "Your answer",
      value: answers[field.id] || "",
      onChange: handleChange,
      error: errors[field.id],
    };

    switch (field.type) {
      case "TextArea":
        return <Input {...common} type="textarea" />;
      case "Dropdown":
        return (
          <div className="flex flex-col gap-1.5">
            {field.label && (
              <label
                htmlFor={field.id}
                className="text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-[#334155] dark:text-white"
              >
                {field.label}
              </label>
            )}
            <div className="relative">
              <select
                id={field.id}
                name={field.id}
                value={answers[field.id] || ""}
                onChange={handleChange}
                className="w-full appearance-none rounded-lg border border-border bg-input px-4 py-4 pr-12 lg:text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
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
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
            </div>
            {errors[field.id] && (
              <span className="text-xs text-red-500">{errors[field.id]}</span>
            )}
          </div>
        );
      case "Checkbox":
        return (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-[#334155] dark:text-white">
              {field.label}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {field.options?.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    (answers[field.id] || []).includes(opt)
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-border bg-input hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      (answers[field.id] || []).includes(opt)
                        ? "bg-primary border-primary"
                        : "border-muted"
                    }`}
                  >
                    {(answers[field.id] || []).includes(opt) && (
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
                    name={field.id}
                    value={opt}
                    checked={(answers[field.id] || []).includes(opt)}
                    onChange={(e) => {
                      const current = answers[field.id] || [];
                      const next = e.target.checked
                        ? [...current, opt]
                        : current.filter((v) => v !== opt);
                      setAnswers((prev) => ({ ...prev, [field.id]: next }));
                      setErrors((prev) => ({ ...prev, [field.id]: "" }));
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm text-foreground font-medium">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
            {errors[field.id] && (
              <span className="text-xs text-red-500">{errors[field.id]}</span>
            )}
          </div>
        );
      case "FileUpload": {
        const selectedFile = files[field.id];
        return (
          <div className="flex flex-col gap-1.5">
            {field.label && (
              <label className="text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-[#334155] dark:text-white">
                {field.label}
              </label>
            )}
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
            ) : !registrationOpen ? (
              <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Registration Closed
                </h2>
                <p className="text-muted max-w-md">
                  {formData.endDate && new Date(formData.endDate) < new Date()
                    ? "This form is currently closed. The registration period has ended."
                    : "Registration for this event is no longer accepting responses."}
                </p>
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
              ref={(el) => {
                fileInputRefs.current[field.id] = el;
              }}
              type="file"
              accept={ACCEPTED_FILE_EXTENSIONS}
              className="hidden"
              onChange={(e) => handleFileSelect(field.id, e.target.files[0])}
            />
            {errors[field.id] && (
              <span className="text-xs text-red-500">{errors[field.id]}</span>
            )}
          </div>
        );
      }
      default:
        return <Input {...common} type="text" />;
    }
  };

  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 animate-pulse space-y-6">
          <div className="h-10 w-48 rounded-lg bg-card" />
          <div className="h-6 w-96 rounded-lg bg-card" />
          <div className="h-96 rounded-3xl bg-card" />
        </div>
      </section>
    );
  }

  if (fetchError === "not_found") {
    return null;
  }

  if (fetchError === "no_form") {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Registration Unavailable
          </h2>
          <p className="text-muted text-lg">
            This event does not have a registration form.
          </p>
        </div>
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Registration Unavailable
          </h2>
          <p className="text-muted text-lg">This event could not be loaded.</p>
        </div>
      </section>
    );
  }

  if (!formData) return null;

  return (
    <section id="event-registration">
      <div
        className="dark:bg-[#020716] relative overflow-hidden bg-cover bg-center py-24"
        style={{ backgroundImage: `url(${eventImage})` }}
      >
        <div className="absolute inset-0 bg-black/83" />

        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black capitalize leading-tight">
            {formData.title}
          </h1>
        </div>
      </div>

      {formData.content && (
        <div className="w-full bg-[#F8FAFC] dark:bg-[#111827] border-y border-border">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <HtmlContent
              html={formData.content}
              className="prose-lg leading-relaxed text-justify"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-10
          *:border *:border-border *:rounded-3xl *:p-8
          *:[box-shadow:0px_10px_40px_0px_#2563EB14] *:dark:[box-shadow:0px_10px_40px_0px_#2563EB1F]"
        >
          {checkingRegistration ? (
            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : alreadySubmitted ? (
            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                You're Registered!
              </h2>
              <p className="text-muted max-w-md">
                You have successfully registered for{" "}
                <strong>{formData.title}</strong>. Check your email for the QR
                code to use at the event.
              </p>
            </div>
          ) : !registrationOpen ? (
            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Registration Closed
              </h2>
              <p className="text-muted max-w-md">
                {formData.endDate && new Date(formData.endDate) < new Date()
                  ? "This form is currently closed. The registration period has ended."
                  : "Registration for this event is no longer accepting responses."}
              </p>
            </div>
          ) : (
            <div className="col-span-1 lg:col-span-2 flex flex-col h-full relative">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground capitalize font-black">
                {formData.type} Registration
              </h2>
              <p className="text-muted mt-1 mb-8">
                Fill this before attending.
              </p>

              <form
                className="flex flex-col flex-1 gap-5"
                onSubmit={handleSubmit}
              >
                {showSuccess && (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                      <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                      You're Registered!
                    </h2>
                    <p className="text-muted max-w-md">
                      {ticketCode
                        ? "Check your email for the QR code to use at the event."
                        : "Your submission has been received successfully."}
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="rounded-xl border border-red-400/30 bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {submitError}
                    </p>
                  </div>
                )}

                {!showSuccess && (
                  <>
                    {formData.settings?.requiresLogin && !user && (
                      <div className="rounded-xl border border-amber-400/30 bg-amber-50 dark:bg-amber-900/20 p-4">
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          Please log in to register for this event.
                        </p>
                      </div>
                    )}

                    {formData.fields?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.fields.map((field) => (
                          <div
                            key={field.id}
                            className={
                              field.type === "TextArea" ||
                              field.type === "Checkbox" ||
                              field.type === "FileUpload"
                                ? "md:col-span-2"
                                : ""
                            }
                          >
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-card p-6 text-center">
                        <p className="text-muted text-lg font-medium">
                          No information is required for this event. Feel free
                          to click{" "}
                          <span className="font-bold">
                            Complete Registration
                          </span>{" "}
                          to register.
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      className={`mt-auto w-full bg-primary-dark text-white ${submitLoading ? "opacity-60" : ""}`}
                      disabled={
                        submitLoading ||
                        (formData.settings?.requiresLogin && !user)
                      }
                    >
                      {submitLoading
                        ? "Submitting..."
                        : "Complete Registration"}
                    </Button>
                  </>
                )}
              </form>
            </div>
          )}

          <div className="col-span-1 flex flex-col h-full gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-black">
                Event Details
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {formData.date && (
                <div className="rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]">
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">
                    Date
                  </span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">
                    {formData.date}
                  </p>
                </div>
              )}
              {formData.time && (
                <div className="rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]">
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">
                    Time
                  </span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">
                    {formData.time}
                  </p>
                </div>
              )}
              {formData.location && (
                <div className="rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]">
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">
                    Location
                  </span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">
                    {formData.location}
                  </p>
                </div>
              )}
              {formData.maxSubmissions > 0 && (
                <div className="rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]">
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">
                    Seats
                  </span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">
                    {formData.maxSubmissions >= 9007199254740991
                      ? "200+"
                      : formData.maxSubmissions}{" "}
                    Available
                  </p>
                </div>
              )}
            </div>

            {formData.speakers?.length > 0 && (
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4">
                  Speakers
                </h3>
                <div className="flex flex-col gap-4">
                  {formData.speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827] flex items-center gap-4"
                    >
                      {speaker.image && (
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0 border border-border"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold tracking-wider text-primary dark:text-primary-light">
                          {speaker.name}
                        </span>
                        {speaker.title && (
                          <p className="text-xs text-foreground font-gotham font-light mt-1">
                            {speaker.title}
                          </p>
                        )}
                        {speaker.bio && (
                          <p className="text-xs text-muted mt-1">
                            {speaker.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
