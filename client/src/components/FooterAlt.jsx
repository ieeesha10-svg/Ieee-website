import React from "react";

export default function FooterAlt({ tagline = "Built with passion" }) {
  return (
    <div className="font-barlow max-w-5xl mx-auto mt-20 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <span className="text-xs text-muted">© 2026 IEEE Student Branch · SHA Campus · All rights reserved</span>
      <span className="text-xs tracking-widest text-primary/60 uppercase">
        {tagline}
      </span>
    </div>
  );
}
