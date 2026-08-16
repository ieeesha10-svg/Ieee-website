import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, Users, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Modal from "../../components/ui/Modal";

export default function DashboardCrew() {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    position: "",
    image: "",
    bio: "",
  });

  const openCreateModal = () => {
    setForm({ name: "", position: "", image: "", bio: "" });
    setEditMode(false);
    setCurrentId(null);
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setForm({
      name: member.name || "",
      position: member.position || "",
      image: member.image || "",
      bio: member.bio || "",
    });
    setEditMode(true);
    setCurrentId(member._id);
    setShowModal(true);
  };

  const fetchCrew = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/crew");
      setCrew(data.data || []);
    } catch (err) {
      toast.error("Failed to load crew members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.position) {
      toast.error("Name and position are required.");
      return;
    }
    setSaving(true);
    try {
      if (editMode && currentId) {
        await api.put(`/crew/${currentId}`, form);
        toast.success("Crew member updated successfully!");
      } else {
        await api.post("/crew", form);
        toast.success("Crew member added successfully!");
      }
      setShowModal(false);
      setForm({ name: "", position: "", image: "", bio: "" });
      fetchCrew();
    } catch (err) {
      toast.error(
        err.response?.data?.message || (editMode ? "Failed to update member" : "Failed to create member")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await api.delete(`/crew/${id}`);
      toast("Crew member deleted successfully", {
        icon: <Trash2 size={16} className="text-red-500" />,
      });
      fetchCrew();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete crew member",
      );
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Crew Members</h1>
          <p className="text-sm text-muted mt-1">
            Manage the core team members displayed on the Crew page.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : crew.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crew.map((member) => (
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
                <div>
                  <h3 className="text-foreground font-semibold text-lg leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm font-medium">
                    {member.position}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#222936] flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(member)}
                  className="text-xs font-medium text-muted hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Edit size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-100 dark:border-[#222936]">
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
            <Users size={24} className="text-muted" />
          </div>
          <h3 className="text-foreground font-semibold text-base mb-1">
            No crew members yet
          </h3>
          <p className="text-muted text-sm">
            Add your first member to display them on the website.
          </p>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editMode ? "Edit Crew Member" : "Add Crew Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="E.g. Ahmed Elmallah"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              Position *
            </label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="E.g. Web Master"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              Image URL
            </label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#222936] bg-white dark:bg-[#111827] text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
              placeholder="A short description..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || !form.name || !form.position}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              {editMode ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
