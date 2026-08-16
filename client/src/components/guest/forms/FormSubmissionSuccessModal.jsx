import React, { useEffect } from "react";
import { Check } from "lucide-react";
import Modal from "../../ui/Modal";

export default function FormSubmissionSuccessModal({
  isOpen,
  formTitle,
  onBackToHome,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onBackToHome?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onBackToHome]);

  return (
    <Modal open={isOpen} onClose={onBackToHome} title="">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5 border border-green-600 dark:border-green-400">
          <Check size={28} className="text-green-600 dark:text-green-400" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">
          Application Submitted Successfully!
        </h3>

        <p className="text-sm text-muted leading-relaxed mb-6">
          Thank you for applying{formTitle ? ` to the ${formTitle}` : ""}. Our
          committee will review your application. Keep an eye on your email for updates.
        </p>

        <div className="border-t border-border mb-6" />

        <button
          type="button"
          onClick={onBackToHome}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
        >
          Back to Appliactions Page
        </button>
      </div>
    </Modal>
  );
}
