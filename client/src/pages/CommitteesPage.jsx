import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Lock, LogIn, Repeat, Send } from 'lucide-react';
import { committees } from '../data/committeesData';
import { useCommitteeApplication } from '../hooks/useCommitteeApplication';
import { usePublicSettings } from '../hooks/usePublicSettings';
import ConfirmModal from '../components/ui/ConfirmModal';

// Describes what the signed-in visitor can do about the committee on screen,
// so the button never has to guess.
function applicationStateFor(committee, user, pending) {
  if (!user) {
    return { kind: 'signedOut' };
  }

  if (user.committee === committee.label) {
    return { kind: 'member' };
  }

  if (pending) {
    return pending.committee_position === committee.label
      ? { kind: 'pending', committee: pending }
      : { kind: 'pendingElsewhere', committee: pending };
  }

  return { kind: 'open' };
}

export default function CommitteesPage() {
  const [activeId, setActiveId] = useState(committees[0].id);
  // Committee the visitor is being asked to confirm, so nothing is sent until
  // they have agreed to it.
  const [confirming, setConfirming] = useState(null);
  const activeCommittee = committees.find(c => c.id === activeId) || committees[0];
  const { user, pending, applying, apply } = useCommitteeApplication();
  const { committeeApplicationsOpen } = usePublicSettings();

  const state = applicationStateFor(activeCommittee, user, pending);
  const applicationsClosed = committeeApplicationsOpen === false;
  // Committees the member could switch to, so the "apply for another" button
  // has somewhere specific to take them.
  const alternatives = committees.filter(
    c => c.label !== user?.committee && c.id !== activeCommittee.id
  );

  const handleConfirm = async () => {
    const ok = await apply(confirming);
    // Left open on failure so the message is still there to read.
    if (ok) setConfirming(null);
  };

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

            {state.kind === 'open' && !applicationsClosed && (
              <button
                onClick={() => setConfirming(activeCommittee.label)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full bg-primary dark:bg-primary-dark hover:bg-primary-dark text-white transition-colors duration-300"
              >
                <Send size={16} /> Apply for this committee
              </button>
            )}

            {state.kind === 'open' && applicationsClosed && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700/40 text-muted">
                <Lock size={16} /> Applications are closed
              </span>
            )}

            {state.kind === 'signedOut' && (
              <Link
                to="/login"
                state={{ from: '/committees' }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full bg-primary dark:bg-primary-dark hover:bg-primary-dark text-white transition-colors duration-300"
              >
                <LogIn size={16} /> Sign in to apply
              </Link>
            )}

            {state.kind === 'member' && (
              <>
                <span className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                  <Check size={16} /> You are in this committee
                </span>
                {/* Being in a committee is not a dead end: the member can put
                    themselves forward for another one at any time. */}
                {alternatives.length > 0 && !pending && (
                  <button
                    onClick={() => setActiveId(alternatives[0].id)}
                    className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full border text-primary dark:text-primary-light border-primary/70 dark:border-primary-light/70 bg-primary/10 dark:bg-primary-light/10 hover:bg-primary/20 dark:hover:bg-primary-light/20 transition-colors duration-300"
                  >
                    <Repeat size={16} /> Apply for another committee
                  </button>
                )}
              </>
            )}

            {state.kind === 'pending' && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock size={16} /> Application pending
              </span>
            )}

            {state.kind === 'pendingElsewhere' && (
              <span className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock size={16} /> Already applied to {state.committee.committee_position}
              </span>
            )}
          </div>

          {user && state.kind === 'member' && (
            <p className="mt-4 text-sm text-muted dark:text-gray-400">
              You can apply for a different committee whenever you like. You stay
              in {user.committee} until the board approves a change.
            </p>
          )}

          {/* One application at a time, so a pending request is explained rather
              than left as a silent no-op when the visitor tries to apply again. */}
          {user && state.kind === 'open' && !applicationsClosed && (
            <p className="mt-4 text-sm text-muted dark:text-gray-400">
              The board reviews every application, so yours is not final until
              you hear back. You can follow it in your dashboard.
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(confirming)}
        title="Apply for this committee?"
        message={
          confirming
            ? `Your application for ${confirming} will be sent to the board for approval. You can only have one application open at a time, and you will not join until it is approved.`
            : ''
        }
        confirmLabel="Send application"
        isLoading={applying}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(null)}
      />
    </section>
  );
}
