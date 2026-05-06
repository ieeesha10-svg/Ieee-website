import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AuthLayout from '../layouts/AuthLayout';
import MailIcon from '../assets/icons/mail.png'

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
		<AuthLayout title="Verify Email" subtitle="Enter the 6-digit code sent to your email" icon={MailIcon}>
      <form onSubmit={handleVerify} className="space-y-6">
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
          <KeyRound className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="6-Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white tracking-widest text-center text-lg font-bold"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Back to{' '}
          <Link to="/login" className="text-primary dark:text-sky-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
		</AuthLayout>
  );
};

export default VerifyEmailPage;