import React from 'react'
import clsx from 'clsx'

export default function Badge({ text, className }) {
  return (
		<span className={clsx(`bg-primary/10 text-primary-dark dark:text-primary
	    border border-primary-dark dark:border-primary
	    rounded-full px-8 py-1 text-xs lg:text-sm uppercase`,
			className)}
		>
      {text}
    </span>
  )
}