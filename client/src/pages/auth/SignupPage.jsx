import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { committees } from "../../data/committeesData";
import { ORDINAL_OPTIONS } from "../../data/ordinalMap";
import { COLLEGE_OPTIONS, OTHER_COLLEGE } from "../../data/collegeOptions";
import {
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Building2,
  Briefcase,
  Clock,
  Info,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRegister } from "../../hooks/auth/useRegister";
import AuthLayout from "../../layouts/AuthLayout";
import Modal from "../../components/Modal";
import RequiredAsterisk from "../../components/RequiredAsterisk";

function SignupPage() {
  // Preselect a tab via ?user= query param (backward compatible), default to student
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("user") === "professional" ? "professional" : "student"
  );
  const isStudent = activeTab === "student";

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData((prev) => ({ ...prev, position: tab }));
  };

  // 1. Updated State to match Backend Schema
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    position: isStudent ? "student" : "professional",
    university: "",
    college: "",
    committee: "",
    yearOfStudy: "1", // Default to 1st year
    organization: "",
    roleInOrganization: "",
    yearsOfExperience: "",
    reasonForRegistration: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { register, loading: registering } = useRegister();
  const [showCommitteeInfo, setShowCommitteeInfo] = useState(false);
  const [collegeOption, setCollegeOption] = useState("");
  const [isOtherCollege, setIsOtherCollege] = useState(false);
  const [customCollege, setCustomCollege] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    if (value === OTHER_COLLEGE) {
      setIsOtherCollege(true);
      setCustomCollege("");
      setFormData({ ...formData, college: "" });
    } else {
      setIsOtherCollege(false);
      setCustomCollege("");
      setCollegeOption(value);
      setFormData({ ...formData, college: value });
    }
  };

  const handleCustomCollegeChange = (e) => {
    setCustomCollege(e.target.value);
    setFormData({ ...formData, college: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      // 2. Format data for the backend (Ensure numbers are sent as Numbers)
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        position: isStudent ? "student" : "professional",
        committee: formData.committee,
        ...(isStudent
          ? {
              university: formData.university,
              college: formData.college,
              yearOfStudy: Number(formData.yearOfStudy),
            }
          : {
              organization: formData.organization,
              roleInOrganization: formData.roleInOrganization,
              yearsOfExperience: formData.yearsOfExperience
                ? Number(formData.yearsOfExperience)
                : undefined,
              reasonForRegistration: formData.reasonForRegistration,
            }),
      };

      await register(payload);

      toast.success("Account created! Please check your email for the OTP.");

      setTimeout(() => {
        navigate("/verify", { state: { email: formData.email } });
      }, 1500);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Email might already be in use.";
      toast.error(msg);
    }
  };

  return (
    <>
      <AuthLayout
      title="Join IEEE SHA"
      subtitle={
        isStudent
          ? "Create your student account to register for events."
          : "Create your professional account to register for events."
      }
      maxWidth="max-w-2xl"
    >
      {/* Account Type Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700/40 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => handleTabChange("student")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition ${
            isStudent
              ? "bg-primary text-white shadow"
              : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-400"
          }`}
        >
          <GraduationCap size={18} /> Student
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("professional")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition ${
            !isStudent
              ? "bg-primary text-white shadow"
              : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-sky-400"
          }`}
        >
          <Briefcase size={18} /> Professional
        </button>
      </div>
      <form onSubmit={handleSignup} className="space-y-6">
        {/* SECTION 1: Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Full Name <RequiredAsterisk /></label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Email Address <RequiredAsterisk /></label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Age</label>
            <div className="relative">
              <CalendarDays
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* SECTION 2: Academic / Professional Info */}
        {isStudent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* University */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">University <RequiredAsterisk /></label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="university"
                  placeholder="e.g., El Shorouk Academy"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* College */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">College / Faculty <RequiredAsterisk /></label>
              <div className="relative">
                <BookOpen
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <select
                  name="college"
                  value={isOtherCollege ? OTHER_COLLEGE : collegeOption}
                  onChange={handleCollegeChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white appearance-none cursor-pointer *:dark:text-white"
                  required
                >
                  <option value="" disabled hidden>Select College / Faculty</option>
                  {COLLEGE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value={OTHER_COLLEGE}>Other</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>

              {/* Other College (free text, shown below the select) */}
              {isOtherCollege && (
                <div className="mt-3">
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Specify College / Faculty</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="customCollege"
                      placeholder="Type your college / faculty"
                      value={customCollege}
                      onChange={handleCustomCollegeChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Committee */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Committee</label>
              <div className="relative flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-sky-500 transition-all">
                <select
                  name="committee"
                  value={formData.committee}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 px-3 focus:outline-none dark:text-white *:dark:text-black appearance-none cursor-pointer"
                >
                  <option value="">Select Committee</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCommitteeInfo(true)}
                  className="shrink-0 mr-2 p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors"
                  aria-label="Committee info"
                >
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Year of Study (Converted to a clean Select dropdown) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Year of Study <RequiredAsterisk /></label>
              <div className="relative flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-sky-500 transition-all">
                <span className="pl-3 pr-2 text-gray-500 dark:text-gray-400 text-sm font-medium border-r border-gray-200 dark:border-gray-600">
                  Year
                </span>
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 px-3 focus:outline-none dark:text-white *:dark:text-black appearance-none cursor-pointer"
                  required
                >
                  {ORDINAL_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Organization / Company */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Organization / Company <RequiredAsterisk /></label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="organization"
                  placeholder="Organization / Company"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Role in Organization */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Role in Organization <RequiredAsterisk /></label>
              <div className="relative">
                <input
                  type="text"
                  name="roleInOrganization"
                  placeholder="Role in Organization"
                  value={formData.roleInOrganization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Years of Experience <RequiredAsterisk /></label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="yearsOfExperience"
                  min="0"
                  placeholder="Years of Experience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Reason for Registration */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Reason for Registration</label>
              <div className="relative">
                <textarea
                  name="reasonForRegistration"
                  placeholder="Reason for Registration"
                  value={formData.reasonForRegistration}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        )}

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* SECTION 3: Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Password <RequiredAsterisk /></label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">Confirm Password <RequiredAsterisk /></label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="6"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={registering}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-colors"
        >
          {registering ? (
            "Creating Account..."
          ) : (
            <>
              <UserPlus size={20} /> Create Account
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary dark:text-sky-400 font-bold hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
      </AuthLayout>

      <Modal
	      open={showCommitteeInfo}
	      onClose={() => setShowCommitteeInfo(false)}
	      title="How Committee Selection Works"
	      maxWidth="max-w-md"
	    >
	      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-foreground">1. Choose a committee</span>
          <p className="text-sm text-muted leading-relaxed">
            Pick the one that fits you best. Not required for guests — you can change it later from your profile.
          </p>
        </div>
        <div className="border-t border-gray-100 dark:border-[#222936]" />
        <div className="space-y-2">
          <span className="text-sm font-semibold text-foreground">2. Your request is sent to our team</span>
          <p className="text-sm text-muted leading-relaxed">
            Once you register, we'll get notified of your choice.
          </p>
        </div>
        <div className="border-t border-gray-100 dark:border-[#222936]" />
        <div className="space-y-2">
          <span className="text-sm font-semibold text-foreground">3. Our team reviews it</span>
          <p className="text-sm text-muted leading-relaxed">
            A team member will approve your request and welcome you into the committee. You'll know when it's confirmed.
          </p>
        </div>
	      </div>
	    </Modal>
    </>
  );
};

export default SignupPage;
