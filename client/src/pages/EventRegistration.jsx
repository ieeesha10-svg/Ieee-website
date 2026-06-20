import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom';
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

const fallbackDetails = [
  { label: "Date",     value: "June 15, 2026" },
  { label: "Time",     value: "6:00 PM - 9:00 PM" },
  { label: "Location", value: "IEEE Innovation Lab, Room 203" },
  { label: "Seats",    value: "150 Available" },
];

const fallbackSchedule = [
  { time: "6:00 PM", session: "Introduction to Robotics" },
  { time: "6:45 PM", session: "Sensors & Automation Systems" },
  { time: "7:30 PM", session: "Hands-on Session" },
  { time: "8:30 PM", session: "Q&A Session" },
];

export default function EventRegistration() {
  const { id } = useParams();
  const location = useLocation();
	const { user } = useAuth();
	const fallbackTitle = "IEEE Robotics Bootcamp 2026";
	const fallbackDescription = "Explore robotics, automation systems, and intelligent technologies through a hands-on engineering experience.";
	
  const eventImage = location.state?.image || RegistrationImage;
  const eventTitle = location.state?.title || fallbackTitle;
  const eventDescription = location.state?.description || fallbackDescription;

  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/forms/${id}`);
        setFormData(data);
        const initial = {};
        data.fields?.forEach(f => { initial[f.id] = ''; });
        setAnswers(initial);
      } catch (err) {
        // Use fallback data during development
        const fallback = {
          title: eventTitle,
          description: eventDescription,
          fields: fallbackFields,
          settings: { requiresLogin: false },
        };
        setFormData(fallback);
        const initial = {};
        fallbackFields.forEach(f => { initial[f.id] = ''; });
        setAnswers(initial);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

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

  if (error) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Registration Unavailable</h2>
          <p className="text-muted text-lg">{error}</p>
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
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
            {formData.title}
          </h1>
          {formData.description && (
            <p className="text-white text-lg font-bold md:text-xl mt-3 max-w-2xl">
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
              {fallbackDetails.map((item, index) => (
                <div key={index} className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">{item.label}</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4">Schedule</h3>
              <div className="flex flex-col gap-6">
                {fallbackSchedule.map((item, index) => (
                  <div key={index} className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                    <span className="font-semibold tracking-wider text-primary dark:text-primary-light">{item.session}</span>
                    <p className="text-xs text-foreground font-gotham font-light mt-1">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
