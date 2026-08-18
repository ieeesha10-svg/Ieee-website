import React from 'react'
import { ArrowRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

const variants = {
  default: "bg-primary dark:bg-primary-dark text-white hover:bg-primary/80 hover:dark:bg-primary-dark/80 px-6 py-3",
  outline: "bg-primary/10 text-primary dark:text-white hover:text-white hover:bg-primary border border-primary/10 px-6 py-3",
  link: "bg-transparent text-primary-dark hover:underline",
};

export default function Button({ variant = "default", className, children, ...props }) {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center gap-1 font-medium rounded-lg transition-all duration-300",
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
