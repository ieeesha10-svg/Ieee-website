import React, { useState } from "react";
import { Eye, Inbox, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { useReviewCommitteeRequests } from "../../hooks/dashboard/useReviewCommitteeRequests";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";

// The three buckets the page is split into. A request is created pending and
// stays in the collection after a decision, so Approved and Rejected are a
// permanent log rather than something that disappears once handled.
const TABS = [
  { key: "pending", label: "Pending", blurb: "Waiting on your decision.", icon: Inbox },
  { key: "approved", label: "Approved", blurb: "Accepted, with who accepted them.", icon: ShieldCheck },
  { key: "rejected", label: "Rejected", blurb: "Declined, with who declined them.", icon: ShieldX },
];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const RequestRow = ({ request, onView, onDecide, busy, decided }) => (
  <li className="flex flex-col md:flex-row md:items-center gap-3 py-3 border-t border-border/60 first:border-t-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{request.user.name}</p>
      <p className="text-xs text-muted truncate">{request.user.email}</p>
    </div>

    <span className="inline-flex w-fit items-center text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
      {request.committee}
    </span>

    <div className="text-xs text-muted w-fit md:w-32">
      <p>
        <span className="opacity-70">
          {decided ? "Decided" : "Requested"}
        </span>{" "}
        {formatDate(decided ? request.reviewedAt : request.createdAt)}
      </p>
      {decided && (
        <p className="mt-0.5">
          <span className="opacity-70">by</span>{" "}
          {request.reviewer?.name || "deleted account"}
        </p>
      )}
    </div>

    <div className="flex items-center justify-center md:justify-start gap-2">
      <button
        onClick={onView}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted/5 transition-colors"
      >
        <Eye size={16} />
        View
      </button>

      {/* Only a pending request can be decided. Once it has been approved or
          rejected the server refuses a second decision, so the buttons are
          hidden rather than left there to fail. */}
      {!decided && (
        <>
          <Button
            onClick={() => onDecide(request.id, "approved")}
            disabled={busy}
            aria-label="Approve request"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </Button>
          <Button
            onClick={() => onDecide(request.id, "rejected")}
            disabled={busy}
            aria-label="Reject request"
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </Button>
        </>
      )}
    </div>
  </li>
);

const RequestList = ({ bucket, decided, onView, onDecide }) => {
  const { requests, loading, page, setPage, totalPages, processingId } = bucket;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted py-8">
        <Loader2 size={18} className="animate-spin" />
        Loading requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted py-8 text-center">
        {decided
          ? `No ${decided === "approved" ? "approved" : "rejected"} requests yet`
          : "No pending requests"}
      </p>
    );
  }

  return (
    <>
      <ul>
        {requests.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            decided={decided}
            onView={() => onView(request)}
            onDecide={onDecide}
            busy={processingId === request.id}
          />
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="pt-3">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </>
  );
};

export default function DashboardCommitteeRequests() {
  // One hook per bucket. The tab counts need all three totals, and the
  // decisions are only ever made against the pending bucket.
  const pending = useReviewCommitteeRequests({ status: "pending" });
  const approved = useReviewCommitteeRequests({ status: "approved" });
  const rejected = useReviewCommitteeRequests({ status: "rejected" });

  const buckets = { pending, approved, rejected };
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const active = buckets[tab];

  const decide = (id, status) => {
    setSelected(null);
    pending.processRequest(id, status);
  };

  return (
    <div className="min-h-screen bg-main p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Committee Requests</h1>
          <p className="text-sm text-muted mt-1">
            Applications from members to join a committee. Approving one puts
            the member straight into that committee; every decision is kept
            here with your name against it.
          </p>
        </div>
      </div>

      <div className="bg-card-alt rounded-xl shadow-sm p-4">
        <div
          role="tablist"
          aria-label="Committee requests"
          className="flex flex-wrap gap-2 border-b border-border/60 pb-3"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground hover:bg-muted/10"
                }`}
              >
                <Icon size={16} />
                {t.label}
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : "bg-primary/10 text-primary"
                  }`}
                >
                  {buckets[t.key].totalCount}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted mt-3 mb-1">
          {TABS.find((t) => t.key === tab)?.blurb}
        </p>

        <RequestList
          bucket={active}
          decided={tab === "pending" ? null : tab}
          onView={setSelected}
          onDecide={decide}
        />
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.committee} Request` : "Committee Request"}
      >
        {selected && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Name", value: selected.user.name },
                { label: "Email", value: selected.user.email },
                { label: "University", value: selected.user.university },
                { label: "College", value: selected.user.college },
                { label: "Requested Committee", value: selected.committee },
                { label: "Requested On", value: formatDate(selected.createdAt) },
                // Only meaningful once a decision exists, so the modal is the one
                // place that can show it without the list having to.
                ...(selected.status === "pending"
                  ? []
                  : [
                      {
                        label: selected.status === "approved" ? "Approved By" : "Rejected By",
                        value: selected.reviewer?.name || "Deleted account",
                      },
                      {
                        label: "Decided On",
                        value: formatDate(selected.reviewedAt),
                      },
                    ]),
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">
                    {item.label}
                  </p>
                  {item.label === "Requested Committee" ? (
                    <p className="font-bold text-primary">{item.value || "—"}</p>
                  ) : (
                    <p className="text-sm text-foreground">{item.value || "—"}</p>
                  )}
                </div>
              ))}
            </div>

            {selected.status === "pending" ? (
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-[#222936]">
                <Button
                  onClick={() => decide(selected.id, "approved")}
                  disabled={pending.processingId === selected.id}
                  aria-label="Approve request"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => decide(selected.id, "rejected")}
                  disabled={pending.processingId === selected.id}
                  aria-label="Reject request"
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100 dark:border-[#222936]">
                <Button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted/5 transition-colors"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
