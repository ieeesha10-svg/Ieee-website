import React from 'react';
import { Toaster } from 'react-hot-toast';
import BgImage from '../assets/backgrounds/black-line-circuit-pattern.png';

export default function AuthLayout({ children, title, subtitle, icon, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center relative bg-main transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      {/* Background Overlay */}
      <div className='absolute inset-0 bg-main/95 dark:bg-main/98' />
      <Toaster position="top-center" />
      
      {/* Main Card */}
      <div className={`bg-white relative z-10 dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-xl w-full ${maxWidth} border border-gray-100 dark:border-gray-700`}>
        
        {/* Header (Icon, Title, Subtitle) */}
        <div className="text-center mb-8 flex flex-col items-center">
          {icon && (
            <div className="bg-primary/10 dark:bg-sky-500/10 p-3 rounded-full mb-4">
              <img src={icon} alt={`${title} icon`} className="text-primary dark:text-sky-400" />
            </div>
          )}
          {title && <h1 className="text-3xl font-bold text-primary dark:text-sky-400 mb-2">{title}</h1>}
          {subtitle && <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>

        {/* Page-Specific Content (Forms, Links) */}
        {children}
      </div>
    </div>
  );
}
