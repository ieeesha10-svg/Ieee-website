import React from "react";

import Button from "./Button";

export default function ChapterCard({ title, icon, branch, body, activeMembers, bgColor = { from: '#ffffff', to: "#000000" }}) {
	return <div className="flex flex-col rounded-3xl h-full">

		{/* Top section of the card*/}
		<div
			className="pl-6 py-6 relative overflow-hidden"
			style={{ background: `linear-gradient(to right, ${bgColor.from}, ${bgColor.to})`
		}}>
			<div className="absolute rounded-full w-32 h-32 bg-white/20 -right-14 -top-14"/>
			<div className=" bg-white/20 rounded-2xl p-3 w-fit">
				<img src={icon} className="w-12 h-12" alt={`Chapter's Icon`} />
			</div>
			<h3 className="text-white fton-semibold text-3xl mt-6 mb-10">{title}</h3>
			<span className="text-white text-sm font-light">{branch}</span>
		</div>
		
		{/* Bottom section of the card*/}
		<div className="flex-1 bg-main p-6 flex flex-col">
			<p className="text-muted mb-3">{body}</p>
			
			<div className="flex justify-between mt-auto">
				<div className="flex flex-col gap-1">
					<span className="text-2xl text-primary">{activeMembers}+</span>
					<span className="text-sm text-muted">Active Members</span>
				</div>
				<Button variant="link">Explore</Button>
			</div>
		</div>
	</div>
}
