import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSubmitForm } from '../hooks/useSubmitForm';

import Button from "../components/Button";
import Input from "../components/Input";
import RegistrationImage from '../assets/images/events/registration.jpg';

export default function EventRegistration() {
  const { id } = useParams();
  const location = useLocation();
	const { user } = useAuth();
	
  const eventImage = location.state?.image || RegistrationImage;
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const { submit, loading: submitLoading, error: submitError, alreadySubmitted, ticketCode, setAlreadySubmitted } = useSubmitForm();

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

        const startDate = form?.startDate || null;
        const endDate = form?.endDate || null;

        const dateStr = startDate
          ? new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : "";
        const startTime = startDate
          ? new Date(startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "";
        const endTime = endDate
          ? new Date(endDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "";
        const timeStr = startTime && endTime ? `${startTime} – ${endTime}` : startTime || "";

        setFormData({
          formId: form?._id,
          title: activity.title,
          description: activity.content,
          location: activity.location,
          date: dateStr,
          time: timeStr,
          speakers: activity.speakers || [],
          fields: form.fields || [],
          maxSubmissions: form?.maxSubmissions || 0,
          settings: { requiresLogin: false },
        });

        const initial = {};
        (form.fields || []).forEach(f => {
          initial[f.id] = f.id === 'email' && user?.email ? user.email : '';
        });
        setAnswers(initial);
      } catch (_err) {
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
    setAnswers(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    formData.fields?.forEach(f => {
      if (f.required && !answers[f.id]?.trim()) {
        errs[f.id] = `${f.label} is required`;
      }
      if (f.type === 'email' && answers[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers[f.id])) {
        errs[f.id] = 'Invalid email format';
      }
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (submitLoading) return;
    await submit(formData.formId, answers);
  };

  const renderField = (field) => {
    const common = {
      key: field.id,
      name: field.id,
      label: field.label,
      placeholder: field.placeholder || `Enter your ${field.label.toLowerCase()}`,
      value: answers[field.id] || '',
      onChange: handleChange,
      error: errors[field.id],
    };

    switch (field.type) {
      case 'textarea':
        return <Input {...common} type="textarea" />;
      case 'select':
        return (
          <Input {...common} type="select">
            <option value="" disabled>Select {field.label.toLowerCase()}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Input>
        );
      default:
        return <Input {...common} type={field.type || 'text'} />;
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Registration Unavailable</h2>
          <p className="text-muted text-lg">This event does not have a registration form.</p>
        </div>
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Registration Unavailable</h2>
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
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
            {formData.title}
          </h1>
          {formData.description && (
            <p className="text-white md:text-lg mt-3 max-w-2xl">
              {formData.description}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10
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
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">You're Registered!</h2>
              <p className="text-muted max-w-md">
                You have successfully registered for <strong>{formData.title}</strong>. Check your email for the QR code to use at the event.
              </p>
            </div>
          ) : (
            <div className="col-span-1 lg:col-span-2 flex flex-col h-full relative">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Workshop Registration</h2>
              <p className="text-muted mt-1 mb-8">
                Fill this before attending.
              </p>

              <form className="flex flex-col flex-1 gap-5" onSubmit={handleSubmit}>
                {ticketCode && (
                  <div className="rounded-xl border border-green-400/30 bg-green-50 dark:bg-green-900/20 p-4">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Registration submitted successfully!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Check your email for the QR code to use at the event.
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="rounded-xl border border-red-400/30 bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{submitError}</p>
                  </div>
                )}

                {!ticketCode && (
                  <>
                    {formData.settings?.requiresLogin && !user && (
                      <div className="rounded-xl border border-amber-400/30 bg-amber-50 dark:bg-amber-900/20 p-4">
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          Please log in to register for this event.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.fields?.map(field => (
                        <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      className="mt-auto w-full bg-primary-dark text-white"
                      disabled={submitLoading || (formData.settings?.requiresLogin && !user)}
                    >
                      {submitLoading ? 'Submitting...' : 'Complete Registration'}
                    </Button>
                  </>
                )}
              </form>
            </div>
          )}

          <div className="col-span-1 flex flex-col h-full gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Event Details</h2>
              {formData.description && (
                <p className="text-muted mt-1">{formData.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {formData.date && (
                <div className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">Date</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{formData.date}</p>
                </div>
              )}
              {formData.time && (
                <div className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">Time</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{formData.time}</p>
                </div>
              )}
              {formData.location && (
                <div className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">Location</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{formData.location}</p>
                </div>
              )}
              {formData.maxSubmissions > 0 && (
                <div className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">Seats</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">
                    {formData.maxSubmissions >= 9007199254740991 ? "200+" : formData.maxSubmissions} Available
                  </p>
                </div>
              )}
            </div>

            {formData.speakers?.length > 0 && (
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4">Speakers</h3>
                <div className="flex flex-col gap-4">
                  {formData.speakers.map((speaker, index) => (
                    <div key={index} className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                      <span className="font-semibold tracking-wider text-primary dark:text-primary-light">{speaker.name}</span>
                      {speaker.title && (
                        <p className="text-xs text-foreground font-gotham font-light mt-1">{speaker.title}</p>
                      )}
                      {speaker.bio && (
                        <p className="text-xs text-muted mt-1">{speaker.bio}</p>
                      )}
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
