import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import api from "../utils/api";

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
    const fetchUserData = async () => {
      try {
        const { data } = await api.get("/users/profile");

        const fetchedData = {
          fullName: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "Student",
          age: data.age || "",
          university: data.university || "Shorouk Academy",
          college: data.college || "",
          aboutMe: data.aboutMe || "",
        };

        setUserData(fetchedData);
        setOriginalData(fetchedData);
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

  const handleSave = async () => {
    try {
      const { data } = await api.put("/users/profile", {
        name: userData.fullName,
        phone: userData.phone,
        age: userData.age,
        university: userData.university,
        college: userData.college,
        aboutMe: userData.aboutMe,
      });

      console.log("Data saved successfully to backend:", data);

      setOriginalData(userData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className="relative w-full min-h-screen py-12 px-4 lg:px-20 bg-[#F2F2F2] dark:bg-[#0F1420] flex justify-center items-center transition-colors duration-300 overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 w-full h-full opacity-5 dark:opacity-[0.02] pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: 'url("/images/profileBackground.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[1760px] bg-white dark:bg-[#1A1F2E] shadow-xl dark:shadow-none border border-transparent dark:border-gray-800 rounded-3xl p-6 lg:p-12 transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 lg:mb-12">
          <h1 className="font-gotham font-bold text-3xl lg:text-4xl text-[#0077CC] dark:text-[#33B5FF] transition-colors duration-300">
            My Profile
          </h1>
          {isEditing && (
            <span className="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">
              Edit Mode
            </span>
          )}
        </div>

        {/* User Info Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
          <img
            src="/images/avatar.jpg"
            alt="User Avatar"
            className="w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 border-[#E0E7FF] dark:border-[#0077CC]/30 object-cover shadow-md"
            onError={(e) => {
              e.target.src = "/images/Checker.jpg";
            }}
          />

          <div className="flex flex-col items-center sm:items-start mt-2">
            <h2 className="font-inter font-bold text-2xl lg:text-3xl text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {userData.fullName || "user"}
            </h2>
            <div className="bg-[#DBEAFE] dark:bg-[#0077CC]/20 border border-[#008DF0]/20 dark:border-[#33B5FF]/20 rounded-full px-4 py-1 mb-2">
              <span className="font-lakes font-bold text-sm text-[#0077CC] dark:text-[#33B5FF]">
                IEEE Member
              </span>
            </div>
            <p className="font-lakes font-medium text-base text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {userData.college || "Student"}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="relative pl-6 lg:pl-10">
          {/* Vertical Decorative Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full bg-gradient-to-b from-[#1FA6FF] to-[#0088FF] dark:from-[#33B5FF] dark:to-[#0077CC] transition-all duration-300" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Component */}
            {[
              {
                label: "Full Name",
                name: "fullName",
                type: "text",
                editable: true,
              },
              { label: "Email", name: "email", type: "email", editable: false },
              { label: "Phone", name: "phone", type: "text", editable: true },
              { label: "Age", name: "age", type: "number", editable: true },
              {
                label: "University",
                name: "university",
                type: "text",
                editable: true,
              },
              {
                label: "College",
                name: "college",
                type: "text",
                editable: true,
              },
            ].map((field) => (
              <div
                key={field.name}
                className="flex flex-col p-4 lg:p-5 bg-gray-50 dark:bg-[#0F1420] border border-gray-200 dark:border-gray-800 rounded-2xl gap-2 transition-colors duration-300"
              >
                <label className="font-lakes font-bold text-sm lg:text-base text-gray-600 dark:text-gray-400">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={userData[field.name]}
                  onChange={handleChange}
                  readOnly={!isEditing || !field.editable}
                  className={`w-full bg-white dark:bg-[#1A1F2E] border ${
                    isEditing && field.editable
                      ? "border-[#0077CC] dark:border-[#33B5FF] focus:ring-1 focus:ring-[#0077CC] dark:focus:ring-[#33B5FF]"
                      : "border-gray-200 dark:border-gray-700 opacity-80 cursor-default"
                  } rounded-xl p-3 text-sm font-lakes font-medium text-gray-700 dark:text-gray-200 outline-none transition-all duration-300`}
                />
              </div>
            ))}

            {/* Role Select */}
            <div className="flex flex-col p-4 lg:p-5 bg-gray-50 dark:bg-[#0F1420] border border-gray-200 dark:border-gray-800 rounded-2xl gap-2 transition-colors duration-300">
              <label className="font-lakes font-bold text-sm lg:text-base text-gray-600 dark:text-gray-400">
                Role
              </label>
              <div className="relative w-full">
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full bg-white dark:bg-[#1A1F2E] border ${
                    isEditing
                      ? "border-[#0077CC] dark:border-[#33B5FF] cursor-pointer focus:ring-1 focus:ring-[#0077CC]"
                      : "border-gray-200 dark:border-gray-700 opacity-80 cursor-not-allowed"
                  } rounded-xl p-3 text-sm font-lakes font-medium text-gray-700 dark:text-gray-200 outline-none appearance-none transition-all duration-300`}
                >
                  <option value="Student">Student</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Instructor">Instructor</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="flex flex-col p-4 lg:p-5 bg-gray-50 dark:bg-[#0F1420] border border-gray-200 dark:border-gray-800 rounded-2xl gap-2 transition-colors duration-300 h-full">
              <label className="font-lakes font-bold text-sm lg:text-base text-gray-600 dark:text-gray-400">
                About Me (Optional)
              </label>
              <textarea
                name="aboutMe"
                value={userData.aboutMe}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full h-full min-h-[100px] bg-white dark:bg-[#1A1F2E] border ${
                  isEditing
                    ? "border-[#0077CC] dark:border-[#33B5FF] focus:ring-1 focus:ring-[#0077CC]"
                    : "border-gray-200 dark:border-gray-700 opacity-80 cursor-default"
                } rounded-xl p-3 text-sm font-lakes font-medium text-gray-700 dark:text-gray-200 outline-none resize-none transition-all duration-300`}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-6 md:gap-0">
          <div className="bg-[#DBEAFE] dark:bg-[#0077CC]/20 border border-[#008DF0]/30 dark:border-[#33B5FF]/30 rounded-full px-8 py-3 w-full md:w-auto text-center">
            <span className="font-inter font-bold text-xl lg:text-2xl text-[#0077CC] dark:text-[#33B5FF] transition-colors duration-300 tracking-wide uppercase">
              IEEE Committee
            </span>
          </div>

          <div className="flex flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancel();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex-1 md:flex-none flex justify-center items-center px-8 py-3 border border-[#0077CC] dark:border-[#33B5FF] rounded-xl bg-transparent hover:bg-[#0077CC]/5 dark:hover:bg-[#33B5FF]/10 transition-colors duration-300"
            >
              <span className="font-lakes font-bold text-base text-[#0077CC] dark:text-[#33B5FF]">
                {isEditing ? "Cancel" : "Edit Profile"}
              </span>
            </button>

            <button
              onClick={handleSave}
              disabled={!isEditing}
              className={`flex-1 md:flex-none flex justify-center items-center px-8 py-3 rounded-xl transition-all duration-300 ${
                isEditing
                  ? "bg-[#0077CC] dark:bg-[#33B5FF] text-white dark:text-[#0F1420] shadow-lg hover:shadow-xl hover:-translate-y-1 font-bold"
                  : "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed font-medium"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
