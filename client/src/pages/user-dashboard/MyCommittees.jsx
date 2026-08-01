import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Check, RefreshCw, Loader2 } from "lucide-react";
import api from "../../utils/api";
import Modal from "../../components/Modal";
import Button from "../../components/Button";

import { committees } from "../../data/committeesData";

function CommitteeCard({ name, icon, emoji, description }) {
  return (
    <div className="relative bg-white dark:bg-[#13161D] rounded-[16px] md:rounded-[20px] border-[0.8px] border-[#0096FF] dark:border-[rgba(0,150,255,0.3)] shadow-[0px_4px_16px_rgba(0,150,255,0.12)] dark:shadow-[0px_4px_16px_rgba(0,150,255,0.08)] p-5 md:p-6 transition-all duration-300 group hover:shadow-[0px_6px_20px_rgba(0,100,220,0.12)]">
      {/* Joined Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1BCC6E] text-white text-[11px] font-lakes font-bold tracking-[0.3px] px-3 py-1.5 rounded-full shadow-[0px_2px_8px_rgba(27,204,110,0.3)]">
        <Check size={12} strokeWidth={3} />
        Joined
      </div>

      {/* Icon */}
      <div className="w-[44px] h-[44px] rounded-[12px] bg-[#F0F7FF] dark:bg-[#1A1F2E] flex items-center justify-center mb-4 text-[22px] transition-transform duration-300 group-hover:scale-105">
        {icon ? <img src={icon} alt={name} className="w-6 h-6 object-contain" /> : emoji}
      </div>

      {/* Info */}
      <h3 className="font-gotham font-normal text-[14.5px] md:text-[15px] leading-[19px] text-[#0A1628] dark:text-white mb-[6px] pr-16">
        {name}
      </h3>
      <p className="font-[Outfit] text-[12px] md:text-[12.8px] leading-[18px] text-[#7A96B2] dark:text-muted mb-4 line-clamp-2">
        {description}
      </p>

      {/* Members count */}
      {/* <div className="flex items-center gap-[6px]">
        <Users size={13} className="text-[#0096FF] dark:text-primary" />
        <span className="font-lakes font-bold text-[11.5px] tracking-[0.3px] text-[#0096FF] dark:text-primary">
          {members} members
        </span>
      </div> */}
    </div>
  );
}

export default function MyCommittees() {
  const { userData } = useOutletContext();
  const userCommittee = userData?.committee || "";

  const myCommittee = committees.find(
    (committee) =>
      committee.label.toLowerCase().trim() === userCommittee.toLowerCase().trim() ||
      committee.title.toLowerCase().trim() === userCommittee.toLowerCase().trim(),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors w-fit"
        >
          <RefreshCw size={16} />
          Request Change
        </Button>
      </div>

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
              disabled={isSubmitting}
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
              className="px-5 py-2 text-sm text-[#64748B] dark:text-muted border-gray-200 dark:border-[#222936] hover:bg-gray-50 dark:hover:bg-[#1A1F2E] rounded-xl transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestChange}
              disabled={isSubmitting || !selectedCommittee}
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
