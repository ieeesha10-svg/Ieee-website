import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { useForgetPassword } from "../../hooks/auth/useForgetPassword";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { forgetPassword, loading } = useForgetPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await forgetPassword(email);
      setSent(true);
      toast.success("Reset email sent! Check your inbox.");
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to send reset email";
      toast.error(msg);
    }
  };

  return (
    <AuthLayout
      title="Forget Password"
      subtitle={
        sent
          ? "Check your email for the reset link"
          : "Enter your email and we'll send you a reset link"
      }
    >
      {sent ? (
        <div className="text-center space-y-4">
          <div className="bg-primary/10 dark:bg-sky-500/10 p-3 rounded-full w-fit mx-auto">
            <Mail className="text-primary dark:text-sky-400" size={32} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            If an account exists for{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {email}
            </span>
            , a password reset link has been sent. The link expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="inline-block text-primary dark:text-sky-400 font-bold hover:underline text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <KeyRound size={20} /> Send Reset Link
              </>
            )}
          </button>
        </form>
      )}

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

export default ForgetPasswordPage;
