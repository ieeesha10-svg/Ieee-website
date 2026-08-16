import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText } from "lucide-react";
import { useFormSubmissions } from "../../hooks/dashboard/useGetSubmissions";
import HtmlContent from "../ui/HtmlContent";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function EventViewModal({ open, onClose, eventId, getEventById }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      setLoading(true);
      getEventById(eventId).then((res) => setData(res)).finally(() => setLoading(false));
    }
    if (!open) setData(null);
  }, [open, eventId, getEventById]);

  const activity = data?.activity;
  const form = data?.form;
  const { total: submissionCount } = useFormSubmissions(form?._id);

  return (
    <Modal open={open} onClose={onClose} title="Event Details" maxWidth="max-w-xl">
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : activity ? (
        <div className="space-y-5">
          {activity.coverImage && (
            <img src={activity.coverImage} alt={activity.title} className="w-full h-48 object-cover rounded-lg" />
          )}
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Title</span>
            <p className="text-sm text-foreground mt-1">{activity.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Type</span>
              <p className="text-sm text-foreground mt-1 capitalize">{activity.type}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Location</span>
              <p className="text-sm text-foreground mt-1">{activity.location}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Section</span>
              <p className={`text-sm mt-1 font-medium ${activity.registrationEnabled !== false ? "text-green-600 dark:text-green-400" : "text-muted"}`}>
                {activity.registrationEnabled !== false ? "Upcoming Events" : "Previous Events"}
              </p>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Description</span>
            <p className="text-sm text-foreground mt-1">{activity.description}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Content</span>
            <div className="mt-1"><HtmlContent html={activity.content} /></div>
          </div>
          {activity.speakers?.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Speakers</span>
              <div className="space-y-3 mt-2">
                {activity.speakers.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {s.name?.[0] || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      {s.title && <p className="text-xs text-primary font-medium mt-0.5">{s.title}</p>}
                      {s.bio && <p className="text-xs text-muted mt-1 leading-relaxed">{s.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {form && (
            <div className="pt-3 border-t border-gray-100 dark:border-[#222936]">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-muted" />
                <span className="text-xs font-bold text-muted uppercase tracking-wide">Form Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted text-xs">Registration</span>
                  <p className={`font-medium ${form.status === "Active" ? "text-green-600 dark:text-green-400" : "text-muted"}`}>
                    {form.status === "Active" ? "Open" : "Closed"}
                  </p>
                </div>
                <div>
                  <span className="text-muted text-xs">Max Submissions</span>
                  <p className="text-foreground font-medium">{form.maxSubmissions ? form.maxSubmissions.toLocaleString() : "Unlimited"}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Registration Opens</span>
                  <p className="text-foreground font-medium">{form.startDate ? new Date(form.startDate).toLocaleString() : "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Registration Closes</span>
                  <p className="text-foreground font-medium">{form.endDate ? new Date(form.endDate).toLocaleString() : "N/A"}</p>
                </div>
              </div>
              {submissionCount > 0 && (
                <div className="mt-3">
                  <Button
                    variant="link"
                    onClick={() => navigate(`/dashboard/forms/submissions/${form._id}`)}
                    aria-label="View Submissions"
                  >
                    View Submissions
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
