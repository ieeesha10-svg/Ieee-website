import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Calendar, Users } from "lucide-react";
import HtmlContent from "../../ui/HtmlContent";

export default function EventDetailModal({ event, onClose }) {
  const [visible, setVisible] = useState(false);
  const closing = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const handleKey = (e) => {
      if (e.key === "Escape" && !closing.current) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    if (closing.current) return;
    closing.current = true;
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const { image, badge, title, description, content, date, location, speakers } = event;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[85vh] bg-card-alt rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto max-h-[85vh] scrollable-content">
          {image ? (
            <div className="relative h-56 sm:h-72 overflow-hidden">
              <img src={image} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {badge && (
                  <span className="inline-block rounded-full py-1.5 px-3 text-xs font-semibold backdrop-blur-sm bg-white/15 text-white mb-3">
                    {badge}
                  </span>
                )}
                <h2 className="uppercase font-black leading-tight text-white text-2xl sm:text-3xl">
                  {title}
                </h2>
              </div>
            </div>
          ) : (
            <div className="relative h-32 sm:h-40 bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
              {badge && (
                <span className="absolute top-4 left-6 rounded-full py-1.5 px-3 text-xs font-semibold bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
              <h2 className="uppercase font-black text-primary/30 text-4xl sm:text-5xl select-none">
                {title?.charAt(0)?.toUpperCase()}
              </h2>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h2 className="uppercase font-black leading-tight text-foreground text-2xl sm:text-3xl">
                  {title}
                </h2>
              </div>
            </div>
          )}

          <div className="px-6 sm:px-8 pt-5 flex flex-wrap gap-4 text-sm text-muted">
            {date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-primary shrink-0" />
                <span>{date}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-primary shrink-0" />
                <span>{location}</span>
              </div>
            )}
            {speakers?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-primary shrink-0" />
                <span>{speakers.length} {speakers.length === 1 ? "Speaker" : "Speakers"}</span>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6 mt-4">
            {description && (
              <p className="text-foreground font-lakes text-base leading-relaxed">
                {description}
              </p>
            )}

            {content && (
              <div className="border-t border-border pt-5">
                <HtmlContent html={content} className="prose-base leading-relaxed text-justify" />
              </div>
            )}

            {speakers?.length > 0 && (
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wide mb-4">
                  Speakers
                </h3>
                <div className="space-y-3">
                  {speakers.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {s.name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                        {s.title && <p className="text-xs text-muted truncate">{s.title}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
