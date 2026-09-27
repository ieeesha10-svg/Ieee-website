import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import {
  RECRUITMENT_COLOR,
  ATTENDANCE_COLOR,
  WORKSHOP_COLOR,
  SURVEY_COLOR,
  FEEDBACK_COLOR,
  LEGACY_COLOR,
} from "../../../data/formTypes";

const tinted = (color, label) => ({
  badge: "border",
  badgeStyle: { backgroundColor: `${color}1A`, color, borderColor: `${color}20` },
  color,
  label,
});

const CATEGORY_STYLES = {
  Recruitment: tinted(RECRUITMENT_COLOR, "Recruitment"),
  Attendance: tinted(ATTENDANCE_COLOR, "Attendance"),
  Workshop: tinted(WORKSHOP_COLOR, "Workshop"),
  Survey: tinted(SURVEY_COLOR, "Survey"),
  Feedback: tinted(FEEDBACK_COLOR, "Feedback"),
  Other: tinted(LEGACY_COLOR, "General"),
};


export default function FormCard({ form }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const style = CATEGORY_STYLES[form.category] || CATEGORY_STYLES.Other;
  const hasLink = !!form._id;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!user?._id || !form._id) {
      setCheckingSubmission(false);
      return;
    }
    api
      .get(`/submissions/${user._id}/${form._id}`)
      .then(() => setIsSubmitted(true))
      .catch(() => {})
      .finally(() => setCheckingSubmission(false));
  }, [user?._id, form._id]);

  const hoverBorderColor = style.badgeStyle?.color || "#0096ff";

  const handleClick = () => {
    if (!hasLink) return;
    // Forms are open to everyone — logged in or not.
    if (isSubmitted) {
      toast("You have already submitted this form", { icon: "ℹ️" });
      return;
    }
    navigate(`/applications/${form._id}`);
  };

  return (
    <div
      className="group flex flex-col bg-card-alt border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-[0_8px_30px_-8px_rgba(0,150,255,0.12)] dark:hover:shadow-[0_8px_30px_-8px_rgba(0,150,255,0.08)] relative"
      style={{ borderColor: isHovered ? hoverBorderColor : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`w-full self-start text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${style.badge}`}
        style={style.badgeStyle}
      >
        {style.label}
      </span>

      <h2 className="mt-4 text-lg font-bold text-foreground leading-snug capitalize">
        {form.title}
      </h2>

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
          disabled={!hasLink || isSubmitted}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
            isSubmitted
              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700/40 cursor-not-allowed"
              : hasLink
                ? "bg-primary/10 text-primary hover:bg-primary-dark/20 border border-primary/30"
                : "bg-border/50 text-muted cursor-not-allowed"
          }`}
        >
          {checkingSubmission ? (
            <div className="flex items-center justify-center py-1">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isSubmitted ? (
            "Already Submitted"
          ) : (
            form.ctaLabel
          )}
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
