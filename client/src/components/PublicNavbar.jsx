import React, { useState } from 'react';
// Added Menu and X to the imports
import { User as UserIcon, LogOut as LogOutIcon, Home as HomeIcon, Calendar, UserPlus, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const PublicNavbar = () => {
    // 1. Add state to control the mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const navigate = useNavigate();
    // Check if someone is logged in by looking at LocalStorage
    const { user } = useAuth();

    const handleLogout = async() => {

   

        try {
            const { message } = await api.post('/users/logout');

            toast.success('Logged out successfully!');

            setTimeout(() => {
                window.location.reload()
                navigate('/');
            }, 1000);

        } catch (error) {
            const msg = error.response?.data?.message || 'Logout failed';
            toast.error(msg);
        }
    };

    // Helper to close menu when a link is clicked
    const closeMenu = () => setIsMobileMenuOpen(false);



    

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-100 dark:border-gray-700 h-16 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <Toaster position="top-center" />

                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-ieee-blue dark:text-sky-400 tracking-tight flex items-center gap-2">
                    <span>IEEE</span> <span className="text-ieee-dark dark:text-white">SHA</span>
                </Link>

                {/* --- DESKTOP MENU (Hidden on small screens) --- */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-white font-medium transition flex items-center gap-1">
                        <HomeIcon size={18} /> Home
                    </Link>
                    <Link to="/events" className="text-gray-600 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-white font-medium transition flex items-center gap-1">
                        <Calendar size={18} /> Events
                    </Link>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

                    {user ? (
                        <>
                            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-white font-medium transition flex items-center gap-1">
                                <UserIcon size={18} /> Hi, {user.name.split(' ')[0]}
                            </Link>
                            {['admin', 'board', 'xcom'].includes(user.role?.toLowerCase()) && (
                                <Link to="/dashboard" className="text-ieee-blue dark:text-sky-400 font-bold hover:underline text-sm">
                                    Go to Admin
                                </Link>
                            )}
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition flex items-center gap-1 font-medium">
                                <LogOutIcon size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-white font-medium transition">
                                Login
                            </Link>
                            <Link to="/signup" className="px-5 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-dark transition shadow-sm font-semibold flex items-center gap-2">
                                <UserPlus size={18} /> Sign Up
                            </Link>
                        </>
                    )}

                    <div className="ml-2">
                        <ThemeToggle />
                    </div>
                </div>

                {/* --- MOBILE MENU BUTTON (Visible only on small screens) --- */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-600 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-white transition"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* --- MOBILE DROPDOWN MENU --- */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-xl border-b border-gray-100 dark:border-gray-700 flex flex-col px-4 py-4 gap-4 z-40">
                    <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                        <HomeIcon size={18} /> Home
                    </Link>
                    <Link to="/events" onClick={closeMenu} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                        <Calendar size={18} /> Events
                    </Link>

                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-1"></div>

                    {user ? (
                        <>
                            <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                                <UserIcon size={18} /> Profile ({user.name.split(' ')[0]})
                            </Link>
                            {['admin', 'board', 'xcom'].includes(user.role?.toLowerCase()) && (
                                <Link to="/dashboard" onClick={closeMenu} className="text-ieee-blue dark:text-sky-400 font-bold">
                                    Go to Admin Dashboard
                                </Link>
                            )}
                            <button onClick={() => { closeMenu(); handleLogout(); }} className="flex items-center gap-2 text-red-500 font-medium text-left">
                                <LogOutIcon size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu} className="text-gray-600 dark:text-gray-300 font-medium">
                                Login
                            </Link>
                            <Link to="/signup" onClick={closeMenu} className="flex items-center gap-2 text-ieee-blue dark:text-sky-400 font-bold">
                                <UserPlus size={18} /> Sign Up
                            </Link>
                        </>
                    )}

                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-1"></div>

                    {/* Dark Mode toggle inside mobile menu for easy access */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>
            )}
        </nav>
    );
}

export default PublicNavbar;