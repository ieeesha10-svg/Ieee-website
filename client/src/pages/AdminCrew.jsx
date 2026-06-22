import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, X, Search } from "lucide-react";
import toast from "react-hot-toast"; // بنستخدمها عشان نطلع إشعارات النجاح أو الإيرور
import api from "../utils/api";

export default function AdminCrew() {
  const [crew, setCrew] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States للـ Modal (النافذة المنبثقة للإضافة والتعديل)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // داتا الفورم
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    description: "",
    image: "",
    linkedin: "",
    email: "",
    website: "",
  });

  // 1. جلب البيانات (GET)
  const fetchCrew = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/crew");
      setCrew(data);
    } catch (error) {
      console.error("Error fetching crew:", error);
      toast.error("Failed to load crew members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, []);

  // التحكم في الفورم
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openModal = (member = null) => {
    if (member) {
      // لو بنعمل Edit، هنملا الفورم ببياناته القديمة
      setEditingId(member._id || member.id);
      setFormData({
        name: member.name || "",
        position: member.position || member.role || "",
        description: member.description || "",
        image: member.image || "",
        linkedin: member.socials?.linkedin || member.linkedin || "",
        email: member.socials?.email || member.email || "",
        website: member.socials?.website || member.website || "",
      });
    } else {
      // لو إضافة جديدة، هنفضي الفورم
      setEditingId(null);
      setFormData({
        name: "",
        position: "",
        description: "",
        image: "",
        linkedin: "",
        email: "",
        website: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // 2. الحفظ: الإضافة (POST) أو التعديل (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation بسيط
    if (!formData.name || !formData.position) {
      return toast.error("Name and Position are required!");
    }

    try {
      setIsSaving(true);

      // تجميع الداتا بالشكل اللي الباك إند مستنيه
      const payload = {
        name: formData.name,
        position: formData.position,
        description: formData.description,
        image: formData.image,
        socials: {
          linkedin: formData.linkedin,
          email: formData.email,
          website: formData.website,
        },
      };

      if (editingId) {
        // تحديث عضو موجود (PUT)
        await api.put(`/crew/${editingId}`, payload);
        toast.success("Crew member updated successfully!");
      } else {
        // إضافة عضو جديد (POST)
        await api.post("/crew", payload);
        toast.success("New crew member added successfully!");
      }

      closeModal();
      fetchCrew(); // بنعمل ريفريش للداتا عشان تظهر التعديلات
    } catch (error) {
      console.error("Error saving crew member:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong while saving!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 3. مسح شخص (DELETE)
  const handleDelete = async (id) => {
    // رسالة تأكيد قبل المسح
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await api.delete(`/crew/${id}`);
      toast.success("Member deleted successfully!");
      fetchCrew(); // ريفريش بعد المسح
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error(error.response?.data?.message || "Failed to delete member!");
    }
  };

  return (
    <div className="p-6 lg:p-10 w-full dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-gotham">
            Crew Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your chairpersons, heads, and members.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#0077CC] hover:bg-[#005FA3] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0077CC]"></div>
          </div>
        ) : crew.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No crew members found. Click "Add Member" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#0F1420] text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {crew.map((member) => (
                  <tr
                    key={member._id || member.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={member.image || "/images/avatar.jpg"}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.src = "/images/Checker.png";
                        }}
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#0077CC] dark:text-[#33B5FF] font-medium">
                      {member.position || member.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {member.socials?.email || member.email || "-"}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => openModal(member)}
                        className="p-2 text-gray-500 hover:text-[#0077CC] hover:bg-[#0077CC]/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id || member.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "Edit Crew Member" : "Add New Crew Member"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 overflow-y-auto">
              <form id="crewForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all"
                      placeholder="e.g. Ali Ahmed"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all"
                      placeholder="e.g. Chairperson, Web Head, Member"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all resize-none"
                    placeholder="Brief description about their role or vision..."
                  ></textarea>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all"
                      placeholder="Contact Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0077CC] outline-none transition-all"
                      placeholder="Personal Website"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1420] flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                form="crewForm"
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg font-medium bg-[#0077CC] hover:bg-[#005FA3] text-white flex items-center justify-center min-w-[120px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Save Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
