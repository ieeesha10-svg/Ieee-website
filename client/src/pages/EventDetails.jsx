import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import HtmlContent from '../components/HtmlContent';

export default function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [eventImage, setEventImage] = useState(location.state?.image || "");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const { data } = await api.get(`/activities/${id}`);
        const activity = data.activity;
        const form = data.form;

        const startDate = form?.startDate || activity?.startDate || null;
        const endDate = form?.endDate || activity?.endDate || null;

        const dateStr = startDate && endDate
          ? `from ${new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} to ${new Date(endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
          : startDate
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
          type: activity.type,
          content: activity.content,
          description: activity.description || "",
          location: activity.location,
          date: dateStr,
          time: timeStr,
          speakers: activity.speakers || [],
          maxSubmissions: form?.maxSubmissions || 0,
        });

        if (!location.state?.image) {
          setEventImage(activity.coverImage || "");
        }
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

  if (fetchError === "not_found") return null;
  if (!formData) return null;

  return (
    <section id="event-details">
      <section className="bg-[#F8FAFC] dark:bg-[#111827] border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            {eventImage && (
              <img
                src={eventImage}
                alt={formData.title}
                className="w-full max-w-[90%] rounded-3xl object-cover shadow-lg"
              />
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground capitalize leading-tight">
              {formData.title}
            </h1>
            {formData.location && (
              <div className="flex items-center gap-2 text-muted">
                <svg className="w-5 h-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{formData.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="col-span-1 lg:col-span-2 flex flex-col h-full">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground capitalize mb-2 font-black">{formData.type} Description</h2>
            <HtmlContent html={formData.content} className="mt-1 prose-lg leading-relaxed text-justify" />
          </div>

          <div className="col-span-1 flex flex-col h-full gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground capitalize font-black">{formData.type} Details</h2>
            </div>

            <div className="flex flex-col gap-6">
              {formData.date && (
                <div className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">Date</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{formData.date}</p>
                </div>
              )}
              {formData.location && (
                <div className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827]'>
                  <span className="font-semibold tracking-wider text-primary dark:text-primary-light">Location</span>
                  <p className="text-xs text-foreground font-gotham font-medium mt-1">{formData.location}</p>
                </div>
              )}
            </div>

            {formData.speakers?.length > 0 && (
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 font-black">Speakers</h3>
                <div className="flex flex-col gap-4">
                  {formData.speakers.map((speaker, index) => (
                    <div key={index} className='rounded-xl p-3 border border-border bg-[#F8FAFC] dark:bg-[#111827] flex items-center gap-4'>
                      {speaker.image && (
                        <img 
                          src={speaker.image} 
                          alt={speaker.name} 
                          className="w-12 h-12 rounded-full object-cover shrink-0 border border-border" 
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold tracking-wider text-primary dark:text-primary-light">{speaker.name}</span>
                        {speaker.title && (
                          <p className="text-xs text-foreground font-gotham font-light mt-1">{speaker.title}</p>
                        )}
                        {speaker.bio && (
                          <p className="text-xs text-muted mt-1">{speaker.bio}</p>
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
