import React from 'react'
import { usePublicEvents } from '../hooks/usePublicEvents'

import EventsHero from '../sections/events/EventsHero'
import UpcomingEvents from '../sections/events/UpcomingEvents'
import PreviousEvents from '../sections/events/PreviousEvents'

const Events = () => {
  const { upcoming, previous, loading, error } = usePublicEvents()

  return (
    <main>
      <EventsHero featuredEvent={upcoming[0]} loading={loading} />
      <UpcomingEvents events={upcoming} loading={loading} />
      <PreviousEvents events={previous} loading={loading} />
    </main>
  )
}

export default Events
