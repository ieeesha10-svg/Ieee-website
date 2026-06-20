import React from 'react'
import { ArrowRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

const variants = {
  default: "bg-white text-primary-dark hover:bg-white/70 hover:text-primary px-6 py-3",
  outline: "bg-transparent text-white border border-white hover:bg-white/10 px-6 py-3",
  link: "bg-transparent text-primary-dark hover:underline",
};

export default function Button({ variant = "default", className, children, ...props }) {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center gap-1 font-medium rounded-lg transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      {variant === "link" && <ArrowRight className="w-4 h-4" />}
    </button>
  );
}
