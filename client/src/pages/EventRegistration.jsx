import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

import Button from "../components/Button";
import Input from "../components/Input";
import RegistrationImage from '../assets/images/events/registration.jpg';

const fallbackFields = [
  { id: 'fullName', type: 'text', label: 'Full Name', required: true },
  { id: 'email', type: 'email', label: 'Email Address', required: true },
  { id: 'phone', type: 'tel', label: 'Phone Number', required: true },
  { id: 'university', type: 'text', label: 'University', required: true },
  { id: 'department', type: 'text', label: 'Department', required: true },
  { id: 'academicYear', type: 'select', label: 'Academic Year', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'] },
  { id: 'experience', type: 'textarea', label: 'Previous Experience', required: false },
  { id: 'reason', type: 'textarea', label: 'Why do you want to attend?', required: true },
];

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
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/activities/${id}`);
        const activity = data.activity;
        const form = data.form;

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
          title: activity.title,
          description: activity.content,
          location: activity.location,
          date: dateStr,
          time: timeStr,
          speakers: activity.speakers || [],
          fields: form?.fields || fallbackFields,
          maxSubmissions: form?.maxSubmissions || 0,
          settings: { requiresLogin: false },
        });

        const initial = {};
        (form?.fields || fallbackFields).forEach(f => { initial[f.id] = ''; });
        setAnswers(initial);
      } catch (err) {
        setError("not_found");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (error === "not_found") {
      navigate("/not-found", { replace: true });
    }
  }, [error, navigate]);

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
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/submissions', { formId: id, answers });
      setSubmitted(true);
      setTicketCode(data.ticketCode);
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed.';
      if (err.response?.status === 401) {
        setErrors({ submit: 'Please log in to register.' });
      } else {
        setErrors({ submit: msg });
      }
    } finally {
      setSubmitting(false);
    }
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

  if (error === "not_found") {
    return null;
  }

  if (error) {
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
          <div className="col-span-1 lg:col-span-2 flex flex-col h-full relative">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Workshop Registration</h2>
            <p className="text-muted mt-1 mb-8">
            	Fill this before attending.
            </p>

            <form className="flex flex-col flex-1 gap-5" onSubmit={handleSubmit}>
              {submitted && (
                <div className="rounded-xl border border-green-400/30 bg-green-50 dark:bg-green-900/20 p-4">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Registration submitted successfully!
                    {ticketCode && <span className="block mt-1 font-mono">Ticket: {ticketCode}</span>}
                  </p>
                </div>
              )}

              {errors.submit && (
                <div className="rounded-xl border border-red-400/30 bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              {!submitted && (
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
                    disabled={submitting || (formData.settings?.requiresLogin && !user)}
                  >
                    {submitting ? 'Submitting...' : 'Complete Registration'}
                  </Button>
                </>
              )}
            </form>
          </div>

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
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{formData.maxSubmissions} Available</p>
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
