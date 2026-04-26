import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Mail, Camera, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/api';

const AdminSidebar = () => {
  const navigate = useNavigate();
const test = 0;
    const logout = async (e) => {
        e.preventDefault();

        try {
            const { message } = await api.post('/users/logout');

            toast.success('Logged out successfully!');

            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            const msg = error.response?.data?.message || 'Logout failed';
            toast.error(msg);
        }
    };

    return (
        <aside className="w-64 bg-ieee-dark text-white hidden md:flex flex-col h-screen sticky top-0 shadow-xl z-50">
            <div className="p-6 text-2xl font-bold border-b border-gray-700/50 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-sm ">⚙️</div>
                <span>Admin</span>
            </div>
            <Toaster position="top-center" />
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Core</div>

                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-gray-100">
                    <LayoutDashboard size={20} /> Overview
                </Link>
                <Link to="/dashboard/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-gray-100">
                    <Users size={20} /> Users & Members
                </Link>

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-2">Tools</div>

                <Link to="/dashboard/forms" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-gray-100">
                    <FileText size={20} /> Forms & Events
                </Link>
                <Link to="/dashboard/email" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-gray-100">
                    <Mail size={20} /> Bulk Mailer
                </Link>
                <Link to="/dashboard/scan" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-gray-100">
                    <Camera size={20} /> QR Scanner
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-700/50">
                <button onClick={logout} className="flex cursor-pointer items-center gap-2 text-red-300 hover:text-red-100 transition px-2 py-2 rounded hover:bg-red-500/10">
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </aside>
    )
};

export default AdminSidebar
