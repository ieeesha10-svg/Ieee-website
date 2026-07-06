import React from "react";
import {
  Mail,
  MapPin,
  Share2,
  Send,
  Lock,
  ArrowRight,
} from "lucide-react";
import { SOCIAL_MEDIA } from '../data/socialMedia';
import Badge from '../components/Badge'

function InfoCard({ Icon, label, value, subtext }) {
  return (
    <div className="flex flex-col shadow dark:shadow-2xl items-center bg-card rounded-xl py-7.5 px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-lg shadow-primary/40">
        <Icon className="text-white" size={22} aria-hidden="true" />
      </div>
      <div className="flex flex-col items-center gap-2 mt-5">
        <span className="text-xs font-semibold tracking-wide uppercase text-primary">
          {label}
        </span>
        <span className="text-xs font-medium text-foreground">{value}</span>
        <span className="text-xs text-muted">{subtext}</span>
      </div>
    </div>
  );
}

const INFO_CARDS = [
  { Icon: Mail,    label: "EMAIL US",   value: "ieee@university.edu.eg",   subtext: "We reply within 24 hours" },
  { Icon: MapPin,  label: "VISIT US",   value: "Faculty of Engineering",   subtext: "Shorouk Academy, Shorouk" },
  { Icon: Share2,  label: "FOLLOW US",  value: "@ieee.studentbranch",      subtext: "Active on all platforms" },
];

function SocialCard({ Icon, href, title, subtitle, linkLabel }) {
  return (
    <div className="flex flex-col gap-3 bg-main border lg:border-2 hover:-translate-y-2 transition-all duration-300 shadow border-[#E4EAF1] dark:border-border rounded-xl p-5">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
        <Icon className="text-primary" size={18} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-foreground">{title}</span>
        <span className="text-sm text-muted">{subtitle}</span>
      </div>
      <a
        href={href}
        className="flex items-center gap-1.5 text-sm font-gotham font-medium text-primary transition-all duration-300 hover:gap-2.5 hover:text-primary-light mt-auto"
        aria-label={`${linkLabel} – ${title}`}
      >
        {linkLabel}
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-main">
      {/* SECTION 1 – Contact Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left column: badge + heading + paragraph + info cards */}
          <div className="flex flex-col items-center text-center gap-8">
						<div className="flex flex-col gap-3 items-center">
           		<Badge text="Get In Touch" />
	            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-gotham text-foreground leading-tight max-w-lg">
	              Let's Start a Conversation
							</h1>
	            <p className="text-muted max-w-md">
	              Have a question, partnership idea, or just want to say hi? Our
	              team usually replies within 24 hours - we'd love to hear from
	              you.
	            </p>
						</div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {INFO_CARDS.map((c, i) => (
                <InfoCard key={i} {...c} />
              ))}
            </div>
          </div>

          {/* Right column: form card */}
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
                    FULL NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium tracking-wide uppercase text-muted">
                    EMAIL ADDRESS <span className="text-red-500">*</span>
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
                  SUBJECT <span className="text-red-500">*</span>
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
                  MESSAGE <span className="text-red-500">*</span>
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
        </div>
      </section>

      {/* SECTION 2 – Find Us Online */}
      <section className="bg-card rounded-t-3xl py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-12">
        		<Badge text="Stay Connected" />
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="text-foreground">Find Us </span>
              <span className="text-primary">Online</span>
            </h2>
            <p className="text-muted max-w-md">
              Follow our journey, see event highlights, and join the
              conversation.
            </p>
          </div>

          {/* Social cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SOCIAL_MEDIA.map((s, i) => (
              <SocialCard key={i} {...s} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
