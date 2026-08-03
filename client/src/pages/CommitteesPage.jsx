import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { committees } from '../data/committeesData';

export default function CommitteesPage() {
  const [activeId, setActiveId] = useState(committees[0].id);
  const activeCommittee = committees.find(c => c.id === activeId) || committees[0];

  return (
    <section className="py-16 px-6 bg-main transition-colors">
      <div className="max-w-3xl font-gotham mx-auto text-center mb-10">
        <p className="text-sm font-medium text-primary dark:text-primary-light uppercase tracking-wide mb-2">
          IEEE Student Branch
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-foreground dark:text-white">
          OUR COMMITTEES
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="h-0.5 w-15 bg-primary dark:bg-primary-light" />
          <span className="w-2 h-2 rotate-45 bg-primary dark:bg-primary-light" />
          <span className="h-0.5 w-15 bg-primary dark:bg-primary-light" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto mb-0">
        {committees.map((committee) => {
          const isActive = committee.id === activeId;

          return (
            <button
              key={committee.id}
              onClick={() => setActiveId(committee.id)}
              className={`flex flex-col items-center justify-center gap-2 w-[45%] sm:w-20 md:w-24 aspect-square rounded-xl border transition-all duration-200 px-0 md:px-3 py-0 md:py-5 hover:-translate-y-0.5 ${
                isActive
                  ? 'bg-primary/5 dark:bg-primary-dark border border-primary/80 text-primary dark:text-white'
                  : 'bg-white border-gray-200 hover:border-primary dark:bg-[#0A1628] dark:border-white/5 dark:text-gray-400 dark:hover:border-primary-light/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-sm p-2 rotate-45 overflow-hidden border flex items-center justify-center transition-colors duration-200 ${
                isActive
                  ? 'border-primary/80 dark:border-white/50 bg-primary dark:bg-primary-dark'
                  : 'border-gray-300 dark:border-white/10'
								}`}
							>
                <img
                  src={committee.icon}
                  alt={committee.label}
                  className={`-rotate-45 w-10 h-10 md:w-7 md:h-7 object-contain`}
                />
              </div>
              <span className={`md:text-[11px] font-medium mt-2 text-center leading-tight`}>
                {committee.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto mt-6 rounded-2xl border p-6 sm:p-8 bg-white dark:bg-[#0A1628] border-border/50 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md">
        <div key={activeCommittee.id}>
          <h3 className="text-center md:text-left text-xl font-bold text-primary dark:text-primary-light mb-4">
            {activeCommittee.title}
          </h3>
          <ul className="space-y-2.5">
            {activeCommittee.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary-light flex-shrink-0" />
                <span className="text-sm text-muted dark:text-gray-300 leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <Link to="/applications" className='inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full border text-primary dark:text-primary-light border-primary/70 dark:border-primary-light/70 bg-primary/10 dark:bg-primary-light/10 hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors duration-300'>
              View All Open Positions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
