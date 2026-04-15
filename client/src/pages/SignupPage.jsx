import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, UserPlus, 
  GraduationCap, BookOpen, CalendarDays 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/api'; // Check this path!
import { useAuth } from '../context/AuthContext'; // Check this path!

const SignupPage = () => {
  // 1. Updated State to match Backend Schema
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    phone: '', 
    age: '',
    university: '', 
    college: '', 
    yearOfStudy: '1', // Default to 1st year
    password: '', 
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    setLoading(true);

    try {
      // 2. Format data for the backend (Ensure numbers are sent as Numbers)
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        university: formData.university,
        college: formData.college,
        yearOfStudy: Number(formData.yearOfStudy),
      };

      const { data } = await api.post('/users', payload);

      toast.success('Account created successfully!');
      setUser(data); 

      setTimeout(() => {
        navigate('/profile'); 
      }, 1000);

    } catch (error) {
      console.log(error)
      const msg = error.response?.data?.message || 'Registration failed. Email might already be in use.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      {/* Expanded max-width (max-w-2xl) to accommodate the 2-column layout */}
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ieee-blue dark:text-sky-400 mb-2">Join IEEE SHA</h1>
          <p className="text-gray-500 dark:text-gray-400">Create your student account to register for events.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          
          {/* --- SECTION 1: Personal Info --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="relative md:col-span-2">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>

            {/* Email */}
            <div className="relative md:col-span-2">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>

            {/* Age */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="number" name="age" placeholder="Age" min="15" max="30" value={formData.age} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* --- SECTION 2: Academic Info --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* University */}
            <div className="relative md:col-span-2">
              <GraduationCap className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" name="university" placeholder="University (e.g., El Shorouk Academy)" value={formData.university} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>

            {/* College */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" name="college" placeholder="College / Faculty" value={formData.college} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>

            {/* Year of Study (Converted to a clean Select dropdown) */}
            <div className="relative flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-ieee-blue dark:focus-within:ring-sky-500 transition-all">
               <span className="pl-3 pr-2 text-gray-500 dark:text-gray-400 text-sm font-medium border-r border-gray-200 dark:border-gray-600">Year</span>
               <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className="w-full bg-transparent py-3 px-3 focus:outline-none dark:text-white appearance-none cursor-pointer" required>
                 <option value="1">1st Year</option>
                 <option value="2">2nd Year</option>
                 <option value="3">3rd Year</option>
                 <option value="4">4th Year</option>
                 <option value="5">5th Year</option>
                 <option value="0">Alumni / Graduate</option>
               </select>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* --- SECTION 3: Security --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} minLength="6" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} minLength="6" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue dark:focus:ring-sky-500 dark:text-white" required />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-ieee-blue hover:bg-ieee-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-colors">
            {loading ? 'Creating Account...' : <><UserPlus size={20} /> Create Account</>}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-ieee-blue dark:text-sky-400 font-bold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;