import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { useResetPassword } from "../../hooks/auth/useResetPassword";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { resetPassword, loading } = useResetPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      return toast.error("Passwords do not match!");
    }

    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    try {
      await resetPassword(token, email, newPassword, confirmNewPassword);
      toast.success("Password reset successfully! Please sign in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to reset password";
      toast.error(msg);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Invalid or missing reset link"
      >
        <div className="text-center space-y-4">
          <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-full w-fit mx-auto">
            <KeyRound className="text-red-500" size={32} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            This link is invalid or incomplete. Please request a new password
            reset link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block text-primary dark:text-sky-400 font-bold hover:underline text-sm"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength="8"
            className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-3 text-gray-400 hover:text-primary dark:hover:text-sky-400 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            minLength="8"
            className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-3 text-gray-400 hover:text-primary dark:hover:text-sky-400 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="flex flex-col text-center mt-6 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-primary dark:text-sky-400 font-bold hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
