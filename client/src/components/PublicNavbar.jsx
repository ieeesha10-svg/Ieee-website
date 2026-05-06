import React, { useState } from 'react';
// Added Menu and X to the imports
import { User as UserIcon, LogOut as LogOutIcon, Home as HomeIcon, Calendar, UserPlus, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const NAV_LINKS = [
	{
		label: 'Home', href: '/',
	},
	{
		label: 'About', href: '#about',
	},
	{
		label: 'Chapters', href: '#chapters',
	},
	{
		label: 'Events', href: '#events',
	},
	{
		label: 'Contact', href: '#contact',
	}
]

const PublicNavbar = () => {
    // 1. Add state to control the mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    // Check if someone is logged in by looking at LocalStorage
    const { user } = useAuth();
	
    const location = useLocation();
    const isHome = location.pathname === '/';
	
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
        <nav className="bg-navbar-background shadow-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-1 h-full flex items-center justify-between">
            <Toaster position="top-center" />

                {/* Logo */}
                <Link to="/">
                	<img src="/logo.png" alt="IEEE Logo" />
                </Link>

                {/* --- DESKTOP MENU (Hidden on small screens) --- */}
                <div className="hidden md:flex items-center gap-6">
                	{NAV_LINKS.map((nav_link, index) => {
                		return <a key={index} href={nav_link.href.startsWith('#') && !isHome ? '/' + nav_link.href : nav_link.href} className="text-white hover:text-primary-light transition flex items-center">
                        {nav_link.label}
                    </a>
                 	})}
                 
                  <ThemeToggle />

                  {user ? (
                        <>
                            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition flex items-center gap-1">
                                <UserIcon size={18} /> Hi, {user.name.split(' ')[0]}
                            </Link>
                            {['admin', 'board', 'xcom'].includes(user.role?.toLowerCase()) && (
                                <Link to="/dashboard" className="text-primary dark:text-sky-400 font-bold hover:underline text-sm">
                                    Go to Admin
                                </Link>
                            )}
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition flex items-center gap-1 font-medium">
                                <LogOutIcon size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="px-6 py-3 bg-linear-to-r from-primary-dark to-primary-light text-white rounded-lg hover:bg-primary-dark/90 transition shadow-lg font-light">
                                Join Now
                            </Link>
                        </>
                    )}

                </div>

                {/* --- MOBILE MENU BUTTON (Visible only on small screens) --- */}
                <div className="md:hidden flex items-center gap-4">
                		<ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white rounded-full border border-primary-light p-3 transition"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* --- MOBILE DROPDOWN MENU --- */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-xl border-b border-gray-100 dark:border-gray-700 flex flex-col px-4 py-4 gap-4 z-40">

	               	{NAV_LINKS.map((nav_link, index) => {
	               		return <a key={index} href={isHome ? nav_link.href : '/' + nav_link.href} className="text-white hover:text-primary-light transition flex items-center">
	                       {nav_link.label}
	                   </a>
                	})}

                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-1"></div>

                    {user ? (
                        <>
                            <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                                <UserIcon size={18} /> Profile ({user.name.split(' ')[0]})
                            </Link>
                            {['admin', 'board', 'xcom'].includes(user.role?.toLowerCase()) && (
                                <Link to="/dashboard" onClick={closeMenu} className="text-primary dark:text-sky-400 font-bold">
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
                            <Link to="/signup" onClick={closeMenu} className="flex items-center gap-2 text-primary dark:text-sky-400 font-bold">
                                <UserPlus size={18} /> Sign Up
                            </Link>
                        </>
                    )}

                </div>
            )}
        </nav>
    );
}

export default PublicNavbar;