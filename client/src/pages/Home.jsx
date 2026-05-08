import React from 'react'
import Hero from '../sections/home/Hero'
import Chapters from '../sections/home/Chapters'
import About from '../sections/home/About'
import FlagshipEvents from '../sections/home/FlagshipEvents'

function Home() {
    return (
			<>
				<Hero />
				<About />
				<Chapters />
				<FlagshipEvents />
			</>
    )
}

export default Home
