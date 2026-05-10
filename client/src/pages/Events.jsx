import React from 'react'

import EventsHero from '../sections/events/EventsHero'
import UpcomingEvents from '../sections/events/UpcomingEvents'
import PreviousEvents from '../sections/events/PreviousEvents'

const Events = () => {
  return (
		<main>
			<EventsHero />
			<UpcomingEvents />
			<PreviousEvents />
		</main>
  )
}

export default Events