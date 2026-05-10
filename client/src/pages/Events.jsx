import React from 'react'

import EventsHero from '../sections/events/EventsHero'
import UpcomingEvents from '../sections/events/UpcomingEvents'
import PreviousEvents from '../sections/events/PreviousEvents'
import EventRegistration from '../sections/events/EventRegistration'

const Events = () => {
  return (
		<main>
			<EventsHero />
			<UpcomingEvents />
			<PreviousEvents />
			<EventRegistration />
		</main>
  )
}

export default Events