import React from "react";
import { Send, Lock } from "lucide-react";
import RequiredAsterisk from "./RequiredAsterisk";

export default function ContactForm() {
  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xl">
      <h2 className="text-xl font-bold text-foreground">
        Send Us a Message
      </h2>
      <p className="text-sm text-muted mt-1 mb-4">
        Fill out the form and our team will get back to you shortly.
      </p>

      <div className="grid gap-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase text-muted">
              FULL NAME <RequiredAsterisk />
            </label>
            <input
              type="text"
              placeholder="Your full name"
              className="bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase text-muted">
              EMAIL ADDRESS <RequiredAsterisk />
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium tracking-wide uppercase text-muted">
            SUBJECT <RequiredAsterisk />
          </label>
          <input
            type="text"
            placeholder="What's this about?"
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium tracking-wide uppercase text-muted">
            MESSAGE <RequiredAsterisk />
          </label>
          <textarea
            rows={4}
            placeholder="Tell us more..."
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full bg-brand-linear text-white font-semibold rounded-full py-3 transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
        >
          Send Message
          <Send size={16} aria-hidden="true" />
        </button>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <Lock size={12} aria-hidden="true" />
          <span>
            Your information is kept private and never shared.
          </span>
        </div>
      </div>
    </div>
  );
}
