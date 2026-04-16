import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, KeyRound } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/api';

const VerifyEmailPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/users/verify-email', { email, otp });
      
      toast.success(data.message || 'Email verified successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Toaster position="top-center" />
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-ieee-blue/10 dark:bg-sky-500/10 p-3 rounded-full mb-4">
            <ShieldCheck className="text-ieee-blue dark:text-sky-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-ieee-blue dark:text-sky-400 mb-2">Verify Email</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to your email</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white"
              required
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="6-Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white tracking-widest text-center text-lg font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-ieee-blue hover:bg-ieee-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Back to{' '}
            <Link to="/login" className="text-ieee-blue dark:text-sky-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;