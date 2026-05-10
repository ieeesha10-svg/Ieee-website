import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    age: "",
    university: "",
    college: "",
    aboutMe: "",
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    // محاكاة جلب البيانات من الـ API
    const fetchUserData = async () => {
      try {
        setTimeout(() => {
          const fetchedData = {
            fullName: "Ahmed Ali",
            email: "ahmed@email.com",
            phone: "+20 100 000 0000",
            role: "Student",
            age: "19",
            university: "Shorouk Academy",
            college: "Computer Science",
            aboutMe:
              "I am passionate about software engineering and web development.",
          };

          setUserData(fetchedData);
          setOriginalData(fetchedData);
        }, 500);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
  };

  // 4. دالة الحفظ: تبعت للباك إند وتخلي الداتا الجديدة هي النسخة الأصلية
  const handleSave = async () => {
    try {
      console.log("Data saved successfully:", userData);

      // بعد ما الحفظ ينجح، نخلي التعديلات الجديدة هي الـ Backup الجديد
      setOriginalData(userData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className="relative w-full min-h-screen py-12 px-4 lg:px-20 bg-[#F2F2F2] dark:bg-[#0A0E1A] flex justify-center items-center transition-colors duration-300 overflow-hidden">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 w-full h-full opacity-5 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: 'url("/images/profileBackground.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1760px] bg-[#F2F2F2]/95 dark:bg-[#111827] shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-none border border-transparent dark:border-[#1F2937] rounded-[24px] p-6 lg:p-12 transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-gotham text-[28px] lg:text-[35px] text-[#0077CC] dark:text-[#F8FAFC] transition-colors duration-300">
            My Profile
          </h1>
          {isEditing && (
            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              Edit Mode Active
            </span>
          )}
        </div>

        {/* Profile Info (Top Section) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
          <img
            src="/images/avatar.jpg"
            alt="User Avatar"
            className="w-[110px] h-[110px] rounded-full border-[2.4px] border-[#E0E7FF] dark:border-[#1F2937] object-cover"
            onError={(e) => {
              e.target.src = "/images/Checker.png";
            }}
          />

          <div className="flex flex-col items-center sm:items-start mt-2">
            <h2 className="font-inter font-bold text-[24px] lg:text-[30px] text-black dark:text-[#F8FAFC] mb-2 transition-colors duration-300">
              {userData.fullName || "Loading..."}
            </h2>
            <div className="bg-[#DBEAFE] dark:bg-[#60A5FA]/15 border-[0.2px] border-[#008DF0] dark:border-transparent rounded-full px-4 py-1 mb-2">
              <span className="font-lakes font-bold text-[13px] text-[#2563EB] dark:text-[#60A5FA]">
                IEEE Member
              </span>
            </div>
            <p className="font-lakes font-medium text-[16px] text-[#64748B] dark:text-[#94A3B8] transition-colors duration-300">
              {userData.college || "Student"}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="relative pl-6 lg:pl-10">
          <div className="absolute left-0 top-0 bottom-0 w-[6px] rounded-full bg-gradient-to-b from-[#1FA6FF] to-[#0088FF] dark:from-[#6366F1] dark:to-[#22C55E] transition-all duration-300" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Full Name */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={userData.fullName}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-lakes font-medium text-[#64748B] dark:text-[#F8FAFC] outline-none transition-all duration-300`}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-lakes font-medium text-[#64748B] dark:text-[#F8FAFC] outline-none transition-all duration-300`}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-inter text-[#64748B] dark:text-[#F8FAFC] outline-none transition-all duration-300`}
              />
            </div>

            {/* Role (Dropdown) */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                Role
              </label>
              <div className="relative w-full">
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] cursor-pointer focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937] cursor-not-allowed"} rounded-[12px] p-3 text-[14px] font-lakes font-medium text-[#64748B] dark:text-[#F8FAFC] outline-none appearance-none transition-all duration-300`}
                >
                  <option value="Student">Student</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Instructor">Instructor</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Age */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={userData.age}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-inter text-[#64748B] dark:text-[#F8FAFC] outline-none transition-all duration-300`}
              />
            </div>

            {/* University */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                University
              </label>
              <input
                type="text"
                name="university"
                value={userData.university}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-lakes font-medium text-[#64748B] dark:text-[#F8FAFC] outline-none transition-all duration-300`}
              />
            </div>

            {/* College */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                College
              </label>
              <input
                type="text"
                name="college"
                value={userData.college}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-inter text-[#64748B] dark:text-[#F8FAFC] outline-none transition-all duration-300`}
              />
            </div>

            {/* About Me */}
            <div className="flex flex-col p-4 lg:p-5 bg-[#F8FAFC] dark:bg-[#0B1220] border-[0.8px] border-[#E2E8F0] dark:border-[#1F2937] rounded-[18px] lg:rounded-[24px] gap-2 transition-colors duration-300 h-full">
              <label className="font-lakes font-bold text-[14px] lg:text-[16px] text-[#475569] dark:text-[#94A3B8]">
                About Me (Optional)
              </label>
              <textarea
                name="aboutMe"
                value={userData.aboutMe}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full h-full min-h-[50px] bg-[#F1F5F9] dark:bg-[#111827]/70 border-[0.8px] ${isEditing ? "border-[#0096FF] dark:border-[#6366F1] focus:ring-1 focus:ring-[#0096FF]" : "border-[#CBD5E1] dark:border-[#1F2937]"} rounded-[12px] p-3 text-[14px] font-lakes font-medium text-[#64748B] dark:text-[#F8FAFC] outline-none resize-none transition-all duration-300`}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-12 gap-8 md:gap-0">
          <div className="bg-[#DBEAFE] dark:bg-[#60A5FA]/15 border-[0.2px] border-[#008DF0] dark:border-transparent rounded-full px-8 py-3">
            <span className="font-inter font-semibold text-[24px] lg:text-[28px] text-[#2563EB] dark:text-[#60A5FA] transition-colors duration-300">
              IEEE committee
            </span>
          </div>

          <div className="flex flex-row gap-4 w-full md:w-auto">
            {/* زر التعديل / الإلغاء */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancel(); // لو كنا بنعدل وداسنا عليه، يرجع الداتا القديمة ويقفل
                } else {
                  setIsEditing(true); // لو مكناش بنعدل، يفتح وضع التعديل
                }
              }}
              className="flex-1 md:flex-none flex justify-center items-center px-8 py-3 border border-[#0077CC] dark:border-[#F8FAFC] rounded-[8px] bg-transparent hover:bg-[#0077CC]/5 dark:hover:bg-white/10 transition-colors duration-300"
            >
              <span className="font-lakes font-medium text-[16px] text-[#0077CC] dark:text-[#F8FAFC]">
                {isEditing ? "Cancel" : "Edit"}
              </span>
            </button>

            {/* زر الحفظ */}
            <button
              onClick={handleSave}
              disabled={!isEditing}
              className={`flex-1 md:flex-none flex justify-center items-center px-8 py-3 rounded-[8px] transition-all duration-300 ${isEditing ? "bg-gradient-to-r from-[#0096FF] to-[#33B5FF] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(0,150,255,0.6)] hover:-translate-y-1" : "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"}`}
            >
              <span
                className={`font-lakes font-medium text-[16px] ${isEditing ? "text-[#F2F2F2]" : "text-gray-200 dark:text-gray-400"}`}
              >
                Save
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
