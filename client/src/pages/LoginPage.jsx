import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth(); // Global state setter

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/users/login', { email, password });

      setUser(data); // Instantly update the app state
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);

      setTimeout(() => {
        const isAdmin = ['admin', 'board', 'xcom'].includes(data.role?.toLowerCase());
        navigate(isAdmin ? '/dashboard' : '/profile');
      }, 1000);

    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      if (error.response?.status === 403 && msg.includes('not verified')) {
        setTimeout(() => {
          navigate('/verify', { state: { email } });
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
		<AuthLayout title="IEEE SHA" subtitle="Sign in to your account">
      <form onSubmit={handleLogin} className="space-y-6">
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
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-sky-500 dark:text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : <><LogIn size={20} /> Sign In</>}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary dark:text-sky-400 font-bold hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
		</AuthLayout>
  );
};

export default LoginPage;
