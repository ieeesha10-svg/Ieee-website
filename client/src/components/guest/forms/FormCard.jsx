import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import { SURVEY_COLOR, FEEDBACK_COLOR, CUSTOM_COLOR } from "../../../data/formTypes";

const CATEGORY_STYLES = {
  Registration: {
    badge: "border bg-primary/10 text-primary-light dark:text-primary border-primary-light/10 dark:border-primary/10",
    label: "Registration",
  },
  Survey: {
    badge: "border",
		badgeStyle: { backgroundColor: `${SURVEY_COLOR}1A`, color: SURVEY_COLOR, borderColor: `${SURVEY_COLOR}20` },
		color: SURVEY_COLOR,
    label: "Survey",
  },
  Feedback: {
    badge: "border",
		badgeStyle: { backgroundColor: `${FEEDBACK_COLOR}1A`, color: FEEDBACK_COLOR, borderColor: `${FEEDBACK_COLOR}20` },
		color: FEEDBACK_COLOR,
    label: "Feedback",
  },
  Custom: {
    badge: "border",
		badgeStyle: { backgroundColor: `${CUSTOM_COLOR}1A`, color: CUSTOM_COLOR, borderColor: `${CUSTOM_COLOR}20` },
    color: CUSTOM_COLOR,
    label: "General",
  },
};

export default function FormCard({ form }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const style = CATEGORY_STYLES[form.category] || CATEGORY_STYLES["Custom"];
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
    if (!user) {
      navigate("/login");
      return;
    }
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
