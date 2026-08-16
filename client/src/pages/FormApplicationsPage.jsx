import React, { useState, useMemo } from "react";
import { usePublicForms } from "../hooks/usePublicForms";
import FormCard from "../components/guest/forms/FormCard";
import Badge from "../components/ui/Badge";
import FooterAlt from "../components/layout/FooterAlt";

const TABS = ["All", "Registration", "Survey", "Feedback", "General"];

export default function ApplicationsPage() {
  const { forms, isLoading } = usePublicForms();
  const [activeTab, setActiveTab] = useState("All");

  const filteredForms = useMemo(() => {
    if (activeTab === "All") return forms;
    return forms.filter((f) => f.category === activeTab);
  }, [forms, activeTab]);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <Badge
            className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] tracking-[0.15em]"
            text={
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                IEEE Student Branch — SHA Campus
              </>
            }
          />

          <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground">
            Open Application Forms
          </h1>

          <p className="mt-4 text-muted max-w-lg mx-auto leading-relaxed text-sm md:text-base">
						Welcome, students. Browse and submit our active forms — from recruitment applications to workshop registrations.
						All submissions are reviewed by our branch committee.
          </p>

					<div className="mt-8 mx-auto max-w-2xl h-px" style={{ background: "linear-gradient(to right, transparent, rgba(0,150,255,0.2) 50%, transparent)" }} />
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex justify-center">
          {/* Mobile dropdown */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="md:hidden w-full max-w-xs px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>{tab}</option>
            ))}
          </select>
          {/* Desktop tabs */}
          <div className="hidden md:inline-flex gap-2 p-1 rounded-full">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "bg-card border border-border text-muted hover:text-foreground hover:bg-card"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Grid */}
        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card-alt border border-border rounded-xl p-6 animate-pulse space-y-4"
                >
                  <div className="h-5 w-20 rounded-md bg-card" />
                  <div className="h-6 w-3/4 rounded bg-card" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-card" />
                    <div className="h-4 w-2/3 rounded bg-card" />
                  </div>
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="h-10 w-full rounded-lg bg-card" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg font-medium">No forms available</p>
              <p className="text-muted/60 text-sm mt-1">
                {activeTab === "All"
                  ? "Check back later for open applications."
                  : `No ${activeTab.toLowerCase()} are currently open.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <FormCard key={form._id} form={form} />
              ))}
            </div>
          )}
				</div>

				<FooterAlt />
			</div>
    </section>
  );
}
