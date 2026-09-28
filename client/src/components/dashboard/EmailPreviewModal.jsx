import React, { useCallback, useEffect, useState } from "react";
import { User, UserX, Loader2, AlertTriangle, Info } from "lucide-react";
import Modal from "../ui/Modal";
import { useEmailPreview } from "../../hooks/dashboard/forms/useEmailPreview";

/**
 * Shows exactly what a submitter will receive for this form's email.
 *
 * The HTML comes from the server, rendered by the same function the real send
 * uses, so the preview cannot drift from the message. It is shown in a sandboxed
 * iframe rather than injected into the dashboard's DOM: the body is
 * author-authored HTML, and `dangerouslySetInnerHTML` would give a stray
 * <script> or onerror= handler the dashboard's origin and the admin's session.
 * `sandbox` with no allow-scripts means the preview renders but cannot run
 * anything or reach the parent page.
 */
export default function EmailPreviewModal({
  open,
  onClose,
  formTitle,
  formType,
  fields,
  subject,
  messageBody,
}) {
  const { previewEmail } = useEmailPreview();

  const [asGuest, setAsGuest] = useState(false);
  // The response is tagged with the mode it was fetched for, so switching
  // between member and guest shows a spinner instead of the other case's HTML
  // while the new one is in flight. That keeps "loading" derived rather than a
  // second piece of state that has to be set and cleared.
  const [state, setState] = useState({ mode: null, data: null });
  const [error, setError] = useState(null);

  // Re-render whenever the message or the form changes, and when the author
  // flips between the member and the guest case. Every setState happens after
  // the await, and a stale response is dropped rather than shown.
  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await previewEmail({ formTitle, formType, fields, subject, messageBody, asGuest });
        if (!cancelled) {
          setState({ mode: asGuest, data });
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not render the preview");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, asGuest, formTitle, formType, fields, subject, messageBody, previewEmail]);

  // Reset as we close, so the next open starts on the member case without
  // needing an effect to correct state after the fact.
  const close = useCallback(() => {
    setAsGuest(false);
    setState({ mode: null, data: null });
    setError(null);
    onClose();
  }, [onClose]);

  const result = state.mode === asGuest ? state.data : null;
  const loading = !error && (!state.data || state.mode !== asGuest);
  const html = result ? (asGuest ? result.guest : result.member) : "";
  const unresolved = asGuest ? [] : result?.unresolved || [];
  const guestNotes = asGuest ? result?.guestUnresolved || [] : [];

  return (
    <Modal open={open} onClose={close} title="Email preview" maxWidth="max-w-3xl">
      <div className="space-y-4">
        {/* Whose inbox this is. The two cases differ, because db-user[...] fills
            for a member and stays as literal text for a guest. */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 dark:border-[#222936] overflow-hidden">
            <button
              type="button"
              onClick={() => setAsGuest(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                !asGuest
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground bg-white dark:bg-[#111827]"
              }`}
            >
              <User size={13} /> Registered member
            </button>
            <button
              type="button"
              onClick={() => setAsGuest(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 dark:border-[#222936] ${
                asGuest
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground bg-white dark:bg-[#111827]"
              }`}
            >
              <UserX size={13} /> Guest
            </button>
          </div>

          <p className="text-[11px] text-muted">
            Sample data. Nothing is sent and no member is read from the database.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 px-3 py-2.5">
            <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {unresolved.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-2.5">
            <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {unresolved.length === 1
                  ? "1 placeholder will not be replaced"
                  : `${unresolved.length} placeholders will not be replaced`}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300/90 mt-0.5">
                The submitter sees these as typed text, usually because a field was
                renamed or deleted after this message was written:
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1">
                {unresolved.map((t) => (
                  <li
                    key={t}
                    className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-mono text-[11px]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {guestNotes.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 px-3 py-2.5">
            <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {guestNotes.length === 1
                  ? "1 placeholder only works for registered members"
                  : `${guestNotes.length} placeholders only work for registered members`}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300/90 mt-0.5">
                A guest has no account, so these reach their inbox as typed text.
                That is expected, but it is worth knowing if many of your
                submissions come from outside the branch.
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1">
                {guestNotes.map((t) => (
                  <li
                    key={t}
                    className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-mono text-[11px]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* The subject, which otherwise only exists as the hidden preheader
            inside the document. */}
        {result && (
          <div className="rounded-lg border border-gray-200 dark:border-[#222936] overflow-hidden">
            <div className="flex items-start gap-3 px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-[#222936]">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted shrink-0 pt-0.5">
                Subject
              </span>
              <p className="text-sm text-foreground break-words">
                {result.subject || <span className="text-muted italic">No subject</span>}
              </p>
            </div>

            <iframe
              title="Email preview"
              srcDoc={html}
              // No allow-scripts: the body is author-written HTML, and without
              // this a <script> or onerror= in a template would run with the
              // dashboard's origin and session. No allow-same-origin keeps it
              // from reaching this page at all.
              sandbox=""
              className="w-full border-0 bg-white"
              style={{ height: "520px" }}
            />
          </div>
        )}

        {/* Shown while there is nothing to display yet, and while the author has
            just switched between the two cases. */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted">
            <Loader2 size={16} className="animate-spin" />
            <p className="text-sm">Rendering…</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
