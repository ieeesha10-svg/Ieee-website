import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext'; 

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Toaster position="top-center" />
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ieee-blue dark:text-sky-400 mb-2">IEEE SHA</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ieee-blue hover:bg-ieee-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ieee-blue dark:text-sky-400 font-bold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;