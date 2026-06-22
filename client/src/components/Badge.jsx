import React from 'react'
import clsx from 'clsx'

export default function Badge({ text, className }) {
  return (
		<span className={clsx(`text-primary dark:text-primary-light bg-primary/10
	    border border-primary-dark/10 dark:border-primary-light/10
	    rounded-full px-8 py-1 text-xs uppercase`,
			className)}
		>
      {text}
    </span>
  )
}