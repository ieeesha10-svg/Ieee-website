import React from 'react'

export default function Input({ label, name, type = "text", placeholder, error, className = "", children, ...props }) {
  const baseClasses = "w-full rounded-lg border border-border bg-input px-4 py-4 lg:text-lg text-foreground lg:placeholder:text-lg placeholder:text-muted dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-[#334155] dark:text-white">
          {label}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          className={`${baseClasses} resize-none ${className}`}
          rows={4}
          {...props}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          className={`${baseClasses} text-muted dark:text-[#64748B] ${className}`}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`${baseClasses} ${className}`}
          {...props}
        />
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
