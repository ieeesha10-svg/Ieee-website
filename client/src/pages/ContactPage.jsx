import React from "react";
import {
  Mail,
  MapPin,
  Share2,
  ArrowRight,
} from "lucide-react";
import { EMAIL_ADDRESS, SOCIAL_MEDIA } from '../data/socialMedia';
import Badge from '../components/Badge'
import ContactForm from '../components/ContactForm';

function InfoCard({ Icon, label, value, subtext, href }) {
  const content = (
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

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}

const INFO_CARDS = [
  { Icon: Mail,    label: "EMAIL US",   value: EMAIL_ADDRESS,   subtext: "We reply within 24 hours", href: `mailto:${EMAIL_ADDRESS}` },
  { Icon: MapPin,  label: "VISIT US",   value: "Faculty of Engineering",   subtext: "Shorouk Academy, Shorouk", href: "https://maps.app.goo.gl/ENkABHeXemrkYXKv8?g_st=aw" },
  { Icon: Share2,  label: "FOLLOW US",  value: "IEEE Student Branch",      subtext: "Active on all platforms" },
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
				target="_blank"
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
        <div className="flex items-center justify-center">
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
          {/* <ContactForm />*/}
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
