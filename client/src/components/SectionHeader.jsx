import React from "react";
import { twMerge } from "tailwind-merge";

const lineStyles = {
	white: "bg-white",
	gradient: "bg-gradient-to-r from-primary-dark to-primary-light",
};

const textStyles = {
	dark: "text-white",
	light: "text-black dark:text-white",
};

const highlightClasses = {
  'primary-light': 'text-primary-light',
  'primary-dark': 'text-primary-dark',
};

export default function SectionTitle({
	title,
	highlight,
	highlightColor = "primary-dark" | "primary-light",
	variant = "dark",
	line = "gradient",
	className,
}) {
	return (
		<div className={twMerge("inline-block", className)}>
			<h2 className="font-black text-5xl sm:text-7xl leading-tight uppercase">
				<span className={textStyles[variant]}>{title}</span>{" "}
				<span className={highlightClasses[highlightColor]}>{highlight}</span>
			</h2>
			<div
				className={twMerge("h-1 w-25 mt-2 mx-auto rounded-full", lineStyles[line])}
			/>
		</div>
	);
}
