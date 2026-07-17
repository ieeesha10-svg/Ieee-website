import React, { useState, useEffect, useMemo } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function EventCountdown({ events = [] }) {
  const nearest = useMemo(() => {
    if (events.length === 0) return null;
    const now = Date.now();
    return events
      .filter((e) => {
        const d = e.form?.endDate || e.form?.startDate;
        return d && new Date(d).getTime() > now;
      })
      .sort((a, b) => {
        const da = new Date(a.form?.endDate || a.form?.startDate);
        const db = new Date(b.form?.endDate || b.form?.startDate);
        return da - db;
      })[0] || null;
  }, [events]);

  const targetDate = useMemo(() => {
    if (!nearest) return null;
    const now = Date.now();
    const start = nearest.form?.startDate ? new Date(nearest.form.startDate).getTime() : null;
    const end = nearest.form?.endDate ? new Date(nearest.form.endDate).getTime() : null;
    if (start && start > now) return nearest.form.startDate;
    if (end && end > now) return nearest.form.endDate;
    return null;
  }, [nearest]);

  const [countdown, setCountdown] = useState({ weeks: "00", days: "00", hours: "00", minutes: "00" });

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) {
        setCountdown({ weeks: "00", days: "00", hours: "00", minutes: "00" });
        return;
      }
      const m = Math.floor(diff / 60000);
      setCountdown({
        weeks: pad(Math.floor(m / (7 * 24 * 60))),
        days: pad(Math.floor((m % (7 * 24 * 60)) / (24 * 60))),
        hours: pad(Math.floor((m % (24 * 60)) / 60)),
        minutes: pad(m % 60),
      });
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!nearest) return null;

  return (
    <div className="mt-10 lg:mt-20 flex flex-col lg:flex-row gap-10 lg:gap-0 items-center justify-between rounded-2xl px-3.5 lg:px-7 py-4 lg:py-6 bg-primary-linear font-gotham shadow-2xl">
      <div className="text-white text-center lg:text-left">
        <p className="font-gotham-thin text-lg lg:text-[30px]">{nearest.title}</p>
        <p className="text-3xl lg:text-[50px] capitalize">counting time....</p>
      </div>

      <div className="flex items-center *:flex *:flex-col *:gap-3 font-gotham text-white">
        {[
          [countdown.weeks, "Weeks"],
          [countdown.days, "Days"],
          [countdown.hours, "Hours"],
          [countdown.minutes, "Minutes"],
        ].map(([value, label], index, arr) => (
          <React.Fragment key={label}>
            <div>
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl italic">{value}</span>
              <span className="sm:text-xl lg:text-3xl font-gotham-light">{label}</span>
            </div>
            {index < arr.length - 1 && (
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-gotham-thin mx-3">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
