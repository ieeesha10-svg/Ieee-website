import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Users,
  CalendarRange,
  Star,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useSeasons } from "../../hooks/useSeasons";
import { useCrewForSeason } from "../../hooks/dashboard/useCrewForSeason";
import { useAuth } from "../../context/AuthContext";
import { canWrite } from "../../utils/roleAccess";
import ReadOnlyBanner from "../../components/dashboard/ReadOnlyBanner";

// The sections a member can be filed under, in display order. Mirrors SECTIONS
// in server/utils/crewUtils.js and the crewModel enum; the server is what
// actually validates, so a stale key here shows up as a 400 rather than as a
// silently dropped member.
const SECTIONS = [
  {
    key: "counselor",
    label: "Counselor",
    blurb: "The counselor advising this season. Shown on its own line on the site.",
  },
  { key: "excom", label: "Excom", blurb: "The executive committee for this season." },
  { key: "board", label: "Board", blurb: "The board members for this season." },
];

const sectionLabel = (key) =>
  SECTIONS.find((s) => s.key === key)?.label ?? "Crew";

// The five fields a member can have links on, in the order they are offered.
// `placeholder` is what the admin sees when the box is empty, which is also the
// only place a malformed address gets caught before it reaches a visitor.
const SOCIAL_FIELDS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/username" },
  { key: "collabratec", label: "Collabratec", placeholder: "ieee-collabratec.ieee.org/app/p/..." },
  { key: "email", label: "Email", placeholder: "name@example.com" },
  { key: "website", label: "Website", placeholder: "example.com" },
];

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30";
const labelClass =
  "block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5";

const emptySocials = () =>
  SOCIAL_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: "" }), {});

const memberToForm = (member) => ({
  name: member.name || "",
  position: member.position || "",
  image: member.image || "",
  bio: member.bio || "",
  socials: { ...emptySocials(), ...(member.socials || {}) },
});

export default function DashboardCrew() {
  const { user } = useAuth();
  // Crew and season edits are writes. Board can still read both lists.
  const canEdit = canWrite(user?.role);

  const { seasons, isLoading: seasonsLoading, refresh: refreshSeasons } = useSeasons();
  // Null means "follow whatever is published", which is where an admin almost
  // always wants to start. The dropdown writes an explicit id, after which the
  // picker stays on the season they picked even if a different one is published
  // later - they are editing that season, not browsing.
  const [preferredId, setPreferredId] = useState(null);

  // Derived during render rather than synced in an effect: a season that gets
  // deleted or unpublished falls through to the next choice on the next render,
  // with no intermediate render showing a season that is gone.
  const selectedId =
    seasons.find((s) => s._id === preferredId)?._id ??
    seasons.find((s) => s.isHome)?._id ??
    seasons[0]?._id ??
    null;

  const selected = seasons.find((s) => s._id === selectedId) || null;

  const {
    excom,
    counselor,
    board,
    isLoading,
    isSaving,
    error: crewFailed,
    addMember,
    updateMember,
    removeMember,
  } = useCrewForSeason(selectedId);

  // --- member form state ---
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formSection, setFormSection] = useState("excom");
  const [form, setForm] = useState({ name: "", position: "", image: "", bio: "", socials: emptySocials() });
  const [deleting, setDeleting] = useState(null);

  // --- season management state ---
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingSeason, setDeletingSeason] = useState(null);
  const [seasonBusy, setSeasonBusy] = useState(false);

  const membersBySection = { excom, counselor, board };

  const openCreateModal = (section) => {
    setForm({ name: "", position: "", image: "", bio: "", socials: emptySocials() });
    setEditId(null);
    setFormSection(section);
    setShowMemberModal(true);
  };

  const openEditModal = (member) => {
    setForm(memberToForm(member));
    setEditId(member._id);
    setFormSection(member.section || "excom");
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim()) {
      toast.error("Name and position are required.");
      return;
    }
    try {
      if (editId) {
        await updateMember(editId, form, formSection);
        toast.success("Crew member updated successfully!");
      } else {
        await addMember(form, formSection);
        toast.success("Crew member added successfully!");
      }
      setShowMemberModal(false);
    } catch (err) {
      // The server names the offending field for a bad link, so show its
      // message rather than a generic one that leaves the admin guessing.
      toast.error(
        err.response?.data?.message ||
          (editId ? "Failed to update member" : "Failed to create member")
      );
    }
  };

  const confirmDeleteMember = async () => {
    try {
      await removeMember(deleting._id);
      toast.success("Crew member deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete crew member");
    } finally {
      setDeleting(null);
    }
  };

  // --- season actions ---

  const handleCreateSeason = async (e) => {
    e.preventDefault();
    if (!newSeasonName.trim()) return;
    setSeasonBusy(true);
    try {
      const { data } = await api.post("/seasons", { name: newSeasonName.trim() });
      await refreshSeasons();
      // A season with no members is never the published one, so land the admin
      // on the season they just made instead of being yanked back to the live
      // one by the fallback above.
      setPreferredId(data.data._id);
      setNewSeasonName("");
      toast.success(`Season "${data.data.name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create season");
    } finally {
      setSeasonBusy(false);
    }
  };

  const handleRenameSeason = async (id) => {
    if (!renameValue.trim()) return;
    setSeasonBusy(true);
    try {
      await api.put(`/seasons/${id}`, { name: renameValue.trim() });
      await refreshSeasons();
      setRenaming(null);
      toast.success("Season renamed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to rename season");
    } finally {
      setSeasonBusy(false);
    }
  };

  // Publishing is a one-way toggle on the server: it clears whichever season
  // was published, so the home page always has exactly one.
  const handlePublishSeason = async (season) => {
    setSeasonBusy(true);
    try {
      await api.put(`/seasons/${season._id}/home`);
      await refreshSeasons();
      toast.success(`"${season.name}" is now on the home page`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish season");
    } finally {
      setSeasonBusy(false);
    }
  };

  const confirmDeleteSeason = async () => {
    setSeasonBusy(true);
    try {
      await api.delete(`/seasons/${deletingSeason._id}`);
      await refreshSeasons();
      toast.success("Season deleted");
    } catch (err) {
      // The server refuses to delete a season that still has members, and says
      // how many, so pass that straight through.
      toast.error(err.response?.data?.message || "Failed to delete season");
    } finally {
      setDeletingSeason(null);
      setSeasonBusy(false);
    }
  };

  const renderMemberCard = (member) => (
    <div
      key={member._id}
      className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936] p-5 flex flex-col justify-between"
    >
      <div className="flex items-start gap-4">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover bg-gray-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {member.name?.[0] || "?"}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-foreground font-semibold text-lg leading-snug">
            {member.name}
          </h2>
          <p className="text-primary text-sm font-medium">{member.position}</p>
          {SOCIAL_FIELDS.some((f) => member.socials?.[f.key]) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SOCIAL_FIELDS.filter((f) => member.socials?.[f.key]).map((f) => (
                <a
                  key={f.key}
                  href={
                    f.key === "email"
                      ? `mailto:${member.socials[f.key]}`
                      : member.socials[f.key]
                  }
                  target={f.key === "email" ? undefined : "_blank"}
                  rel="noreferrer"
                  title={f.label}
                  className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-primary px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-700/40"
                >
                  <ExternalLink size={10} /> {f.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#222936] flex justify-end gap-2">
        {/* Board can read the crew list; changing it is xcom-only. */}
        {canEdit && (
          <>
            <button
              onClick={() => openEditModal(member)}
              className="text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={() => setDeleting(member)}
              className="text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:hover:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Trash2 size={13} /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderEmptyState = (sectionLabel) => (
    <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-[#1a1f2e] rounded-xl border border-dashed border-gray-200 dark:border-[#222936]">
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-3">
        <Users size={20} className="text-muted" />
      </div>
      <p className="text-foreground font-medium text-sm">No {sectionLabel} members yet</p>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Crew Members</h1>
          <p className="text-sm text-muted mt-1">
            Each season has its own Excom, counselor and board. Publish one on
            the home page, and keep the rest as an archive.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowSeasonModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <CalendarRange size={16} /> Manage Seasons
          </button>
        )}
      </div>

      {!canEdit && <ReadOnlyBanner />}

      {/* Season picker */}
      {seasonsLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : seasons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936]">
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
            <CalendarRange size={24} className="text-muted" />
          </div>
          <h2 className="text-foreground font-semibold text-base mb-1">No seasons yet</h2>
          <p className="text-muted text-sm mb-4">
            A season holds its Excom, its counselor and its board. Create your first one to start adding people.
          </p>
          {canEdit && (
            <button
              onClick={() => setShowSeasonModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} /> Create a season
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wide">
              Season
            </label>
            <div className="w-full sm:w-72">
              <select
                value={selectedId || ""}
                onChange={(e) => setPreferredId(e.target.value)}
                className={inputClass}
              >
                {seasons.map((season) => (
                  <option key={season._id} value={season._id}>
                    {season.name}
                    {season.isHome ? " — on the home page" : ""} ({season.memberCount}{" "}
                    member{season.memberCount === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
            </div>
            {selected?.isHome && (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <Star size={12} /> Live on the home page
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : crewFailed ? (
            <div className="py-10 text-center text-sm text-red-500">
              Failed to load this season's members.
            </div>
          ) : (
            SECTIONS.map((section) => {
              const members = membersBySection[section.key] || [];
              return (
                <section key={section.key} className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-foreground">{section.label}</h2>
                      <p className="text-xs text-muted mt-0.5">{section.blurb}</p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => openCreateModal(section.key)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add to {section.label}
                      </button>
                    )}
                  </div>
                  {members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map(renderMemberCard)}
                    </div>
                  ) : (
                    renderEmptyState(section.label)
                  )}
                </section>
              );
            })
          )}
        </>
      )}

      {/* Member modal */}
      <Modal
        open={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title={editId ? "Edit Crew Member" : `Add to ${sectionLabel(formSection)}`}
      >
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="E.g. Ahmed Elmallah"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Position *</label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className={inputClass}
              placeholder="E.g. Web Master"
              required
            />
            <p className="text-[11px] text-muted mt-1">
              Their position is what the site prints under their name.
            </p>
          </div>
          <div>
            <label className={labelClass}>Section *</label>
            <select
              value={formSection}
              onChange={(e) => setFormSection(e.target.value)}
              className={inputClass}
            >
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className={inputClass}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="A short description..."
            />
          </div>
          <div>
            <label className={labelClass}>Links</label>
            <div className="space-y-2">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <span className="text-[11px] text-muted">{field.label}</span>
                  <input
                    value={form.socials[field.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        socials: { ...form.socials, [field.key]: e.target.value },
                      })
                    }
                    className={inputClass}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-2">
              Only the networks you fill in show as icons. A missing https:// is added for you.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving || !form.name || !form.position}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}{" "}
              {editId ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Season management modal */}
      <Modal
        open={showSeasonModal}
        onClose={() => setShowSeasonModal(false)}
        title="Seasons"
      >
        <div className="space-y-4">
          <form onSubmit={handleCreateSeason} className="space-y-2">
            <label className={labelClass}>New season</label>
            <div className="flex gap-2">
              <input
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                className={inputClass}
                placeholder="E.g. Season 12 or 2026-2027"
              />
              <button
                type="submit"
                disabled={seasonBusy || !newSeasonName.trim()}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {seasons.map((season) => (
              <div
                key={season._id}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-[#222936]"
              >
                <div className="min-w-0 flex-1">
                  {renaming === season._id ? (
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground truncate">
                      {season.name}
                      {season.isHome && (
                        <span className="ml-2 text-[10px] text-primary">on the home page</span>
                      )}
                    </p>
                  )}
                  <p className="text-[11px] text-muted">
                    {season.memberCount} member{season.memberCount === 1 ? "" : "s"}
                  </p>
                </div>

                {renaming === season._id ? (
                  <>
                    <button
                      onClick={() => handleRenameSeason(season._id)}
                      disabled={seasonBusy || !renameValue.trim()}
                      className="text-xs font-medium text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/10 disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRenaming(null)}
                      className="text-xs font-medium text-muted px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {!season.isHome && (
                      <button
                        onClick={() => handlePublishSeason(season)}
                        disabled={seasonBusy}
                        title="Show this season's Excom on the home page"
                        className="text-xs font-medium text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/10 disabled:opacity-60 inline-flex items-center gap-1"
                      >
                        <Star size={12} /> Publish
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRenaming(season._id);
                        setRenameValue(season.name);
                      }}
                      className="text-xs font-medium text-muted hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => setDeletingSeason(season)}
                      className="text-xs font-medium text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDeleteMember}
        title="Delete crew member"
        message={`Remove ${deleting?.name} from this season? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!deletingSeason}
        onCancel={() => setDeletingSeason(null)}
        onConfirm={confirmDeleteSeason}
        title="Delete season"
        message={`Delete "${deletingSeason?.name}"? A season can only be deleted once it has no members.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={seasonBusy}
      />
    </div>
  );
}
