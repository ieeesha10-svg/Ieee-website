import React from "react";
import { useNavigate } from "react-router-dom";

const SURVEY_COLOR = '#5DD9B0';
const FEEDBACK_COLOR = '#B08FFF';
const CUSTOM_COLOR = '#FF9F43';

const CATEGORY_STYLES = {
  Registration: {
    badge: "border bg-primary/10 text-primary-light dark:text-primary border-primary-light/20 dark:border-primary/20",
    label: "Registration",
  },
  Survey: {
    badge: "border",
    badgeStyle: { backgroundColor: `${SURVEY_COLOR}1A`, color: SURVEY_COLOR, borderColor: `${SURVEY_COLOR}20` },
    label: "Survey",
  },
  Feedback: {
    badge: "border",
    badgeStyle: { backgroundColor: `${FEEDBACK_COLOR}1A`, color: FEEDBACK_COLOR, borderColor: `${FEEDBACK_COLOR}20` },
    label: "Feedback",
  },
  Custom: {
    badge: "border",
    badgeStyle: { backgroundColor: `${CUSTOM_COLOR}1A`, color: CUSTOM_COLOR, borderColor: `${CUSTOM_COLOR}20` },
    label: "General",
  },
};

export default function FormCard({ form }) {
  const navigate = useNavigate();
  const style = CATEGORY_STYLES[form.category] || CATEGORY_STYLES["Custom"];
  const hasLink = !!form._id;

  const handleClick = () => {
    if (!hasLink) return;
    navigate(`/applications/${form._id}`);
  };

  return (
    <div className="group flex flex-col bg-card-alt border border-border rounded-xl p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_8px_30px_-8px_rgba(0,150,255,0.12)] dark:hover:shadow-[0_8px_30px_-8px_rgba(0,150,255,0.08)]">
      <span
        className={`w-full self-start text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${style.badge}`}
        style={style.badgeStyle}
      >
        {style.label}
      </span>

      <h3 className="mt-4 text-lg font-bold text-foreground leading-snug capitalize">
        {form.title}
      </h3>

      {form.description && (
        <p className="mt-2 text-sm text-muted line-clamp-3 leading-relaxed">
          {form.description}
        </p>
      )}

      <div className="mt-auto pt-5">
        <div className="border-t border-border mb-4" />
        <button
          type="button"
          onClick={handleClick}
          disabled={!hasLink}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
            hasLink
              ? "bg-primary/10 text-primary hover:bg-primary-dark/20 border border-primary/30"
              : "bg-border/50 text-muted cursor-not-allowed"
          }`}
        >
          {form.ctaLabel}
        </button>
        {!hasLink && (
          <p className="mt-2 text-xs text-muted text-center">
            Submission link unavailable
          </p>
        )}
      </div>
    </div>
  );
}
