import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Clock, Loader2, RefreshCw, Users } from "lucide-react";
import api from "../../utils/api";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

import { committees } from "../../data/committeesData";

function CommitteeCard({ name, icon, description }) {
  return (
    <div className="relative bg-white dark:bg-[#13161D] rounded-[16px] md:rounded-[20px] border-[0.8px] border-[#0096FF] dark:border-[rgba(0,150,255,0.3)] shadow-[0px_4px_16px_rgba(0,150,255,0.12)] dark:shadow-[0px_4px_16px_rgba(0,150,255,0.08)] p-5 md:p-6 transition-all duration-300 group hover:shadow-[0px_6px_20px_rgba(0,100,220,0.12)]">
      {/* Joined Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1BCC6E] text-white text-[11px] font-lakes font-bold tracking-[0.3px] px-3 py-1.5 rounded-full shadow-[0px_2px_8px_rgba(27,204,110,0.3)]">
        <Check size={12} strokeWidth={3} />
        Joined
      </div>

      {/* Icon */}
      <div className="w-[44px] h-[44px] rounded-[12px] bg-[#F0F7FF] dark:bg-[#1A1F2E] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
        {icon ? <img src={icon} alt={name} className="w-6 h-6 object-contain" /> : null}
      </div>

      {/* Info */}
      <h3 className="font-gotham font-normal text-[14.5px] md:text-[15px] leading-[19px] text-[#0A1628] dark:text-white mb-[6px] pr-16">
        {name}
      </h3>
      <p className="font-[Outfit] text-[12px] md:text-[12.8px] leading-[18px] text-[#7A96B2] dark:text-muted mb-4 line-clamp-2">
        {description}
      </p>
    </div>
  );
}

const findCommittee = (name) =>
  committees.find(
    (c) =>
      c.label.toLowerCase().trim() === (name || "").toLowerCase().trim() ||
      c.title.toLowerCase().trim() === (name || "").toLowerCase().trim(),
  );

export default function MyCommittees() {
  const { userData } = useOutletContext();
  const userCommittee = userData?.committee || "";

  const myCommittee = findCommittee(userCommittee);

  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const pendingRequest = myRequests.find((r) => r.request_status === "pending");

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const res = await api.get("/committee-requests/my");
        setMyRequests(res.data?.data || []);
      } catch {
        setMyRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchMyRequests();
  }, []);

  const handleRequestChange = async () => {
    if (!selectedCommittee) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post("/committee-requests", {
        committee_position: selectedCommittee,
      });
      setMessage({
        type: "success",
        text: "Your request has been submitted successfully and is pending admin approval.",
      });
      const res = await api.get("/committee-requests/my");
      setMyRequests(res.data?.data || []);
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage({ type: "", text: "" });
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit request.",
      });
      setIsSubmitting(false);
    }
  };

  const pendingCommittee = pendingRequest && findCommittee(pendingRequest.committee_position);

  return (
    <div className="bg-white dark:bg-[#13161D] rounded-[32px] p-8 md:p-10 border border-[#F1F5F9] dark:border-[#222936]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-[56px] h-[56px] rounded-[20px] bg-[#8B5CF6] flex items-center justify-center text-white shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-[24px] font-bold text-[#0A1628] dark:text-white">
              My Committee
            </h2>
            <p className="text-[#64748B] text-[14px]">Your current committee</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedCommittee("");
            setMessage({ type: "", text: "" });
            setIsModalOpen(true);
          }}
          disabled={!!pendingRequest}
          aria-label={pendingRequest ? "Request Pending" : "Request Change"}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} />
          {pendingRequest ? "Request Pending" : "Request Change"}
        </Button>
      </div>

      {/* Pending Request Notice */}
      {requestsLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted py-8">
          <Loader2 size={18} className="animate-spin" />
          Loading your requests...
        </div>
      ) : pendingRequest ? (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
            {pendingCommittee?.icon ? (
              <img src={pendingCommittee.icon} alt={pendingCommittee.label} className="w-5 h-5 object-contain" />
            ) : (
              <Clock size={18} className="text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              You have a pending request to join {pendingCommittee?.label || pendingRequest.committee_position}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Submitted on {new Date(pendingRequest.createdAt).toLocaleDateString()} — you can request another change once it's reviewed.
            </p>
          </div>
        </div>
      ) : null}

      {/* Committee Card */}
      {myCommittee ? (
        <CommitteeCard
          name={myCommittee.title}
          icon={myCommittee.icon}
          description={myCommittee.subtitle}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-[#7A96B2] dark:text-muted text-[14px]">
            You are not assigned to any committee yet.
          </p>
        </div>
      )}

      {/* Request Change Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Request Committee Change"
      >
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-[#64748B] dark:text-muted">
            Select the new committee you wish to join. Your request will be reviewed by the board.
          </p>

          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0A1628] dark:text-white">
              New Committee
            </label>
            <select
              value={selectedCommittee}
              onChange={(e) => setSelectedCommittee(e.target.value)}
              disabled={isSubmitting || !!pendingRequest}
              className="w-full bg-[#F8FAFC] dark:bg-[#1A1F2E] border-[0.8px] border-[#E2E8F0] dark:border-[#222936] rounded-xl p-3 text-sm text-[#0A1628] dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            >
              <option value="" disabled>Select a committee</option>
              {committees
                .filter((c) => !myCommittee || c.id !== myCommittee.id)
                .map((c) => (
                  <option key={c.id} value={c.label}>
                    {c.label}
                  </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-[#222936]">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              aria-label="Cancel"
              className="px-5 py-2 text-sm text-[#64748B] dark:text-muted border-gray-200 dark:border-[#222936] hover:bg-gray-50 dark:hover:bg-[#1A1F2E] rounded-xl transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestChange}
              disabled={isSubmitting || !selectedCommittee}
              aria-label="Submit Request"
              className="bg-primary hover:bg-primary-dark text-white px-5 py-2 text-sm rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
