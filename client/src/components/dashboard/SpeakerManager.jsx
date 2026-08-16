import React, { useState } from "react";
import { X, Edit, Plus } from "lucide-react";
import Modal from "../ui/Modal";

const SpeakerManager = ({ speakers, onChange }) => {
  const [speakerName, setSpeakerName] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [speakerImage, setSpeakerImage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const openAddModal = () => {
    setSpeakerName("");
    setSpeakerTitle("");
    setSpeakerBio("");
    setSpeakerImage("");
    setEditingIndex("new");
  };

  const saveSpeaker = () => {
    if (!speakerName.trim()) return;
    const speaker = {
      name: speakerName.trim(),
      title: speakerTitle.trim(),
      bio: speakerBio.trim(),
      image: speakerImage.trim(),
    };
    if (typeof editingIndex === "number") {
      const updated = [...speakers];
      updated[editingIndex] = speaker;
      onChange(updated);
    } else {
      onChange([...speakers, speaker]);
    }
    setSpeakerName("");
    setSpeakerTitle("");
    setSpeakerBio("");
    setSpeakerImage("");
    setEditingIndex(null);
  };

  const openEditModal = (index) => {
    const s = speakers[index];
    setSpeakerName(s.name);
    setSpeakerTitle(s.title || "");
    setSpeakerBio(s.bio || "");
    setSpeakerImage(s.image || "");
    setEditingIndex(index);
  };

  const removeSpeaker = (idx) => {
    onChange(speakers.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-2">
      {speakers.length > 0 ? (
        <div className="w-full space-y-1.5">
          {speakers.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-muted shrink-0">{s.name[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground font-medium">{s.name}</span>
                {s.title && <span className="text-xs text-muted ml-2">— {s.title}</span>}
              </div>
              <button type="button" onClick={() => openEditModal(i)} aria-label={`Edit ${s.name}`} className="text-muted hover:text-primary transition-colors"><Edit size={13} /></button>
              <button type="button" onClick={() => removeSpeaker(i)} aria-label={`Remove ${s.name}`} className="text-muted hover:text-red-500 transition-colors"><X size={13} /></button>
            </div>
          ))}
        </div>
			) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted italic">No speakers added yet.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Plus size={14} /> Add Speaker
          </button>
        </div>
      )}

      {speakers.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Plus size={14} /> Add Speaker
          </button>
        </div>
			)}

      <Modal open={editingIndex !== null} onClose={() => setEditingIndex(null)} title={typeof editingIndex === "number" ? "Edit Speaker" : "Add Speaker"} maxWidth="max-w-md">
        <div className="space-y-3">
          <input value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker name" />
          <input value={speakerTitle} onChange={(e) => setSpeakerTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker title (e.g. Senior Engineer)" />
          <input value={speakerImage} onChange={(e) => setSpeakerImage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" placeholder="Speaker image URL (optional)" />
          <textarea value={speakerBio} onChange={(e) => setSpeakerBio(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors resize-none" placeholder="Speaker bio" />
          <button type="button" onClick={saveSpeaker} disabled={!speakerName.trim()} className="w-full py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{typeof editingIndex === "number" ? "Save" : "Add Speaker"}</button>
        </div>
      </Modal>
    </div>
  );
};

export default SpeakerManager;
