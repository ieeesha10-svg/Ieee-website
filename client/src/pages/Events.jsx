import React, { useState, useEffect } from 'react'
import { usePublicEvents } from '../hooks/usePublicEvents'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

import EventsHero from '../sections/events/EventsHero'
import UpcomingEvents from '../sections/events/UpcomingEvents'
import PreviousEvents from '../sections/events/PreviousEvents'

const Events = () => {
  const { user } = useAuth()
  const [registeredFormIds, setRegisteredFormIds] = useState(new Set())
  const { upcoming, previous, loading } = usePublicEvents()

  useEffect(() => {
    if (!user?._id) {
      setRegisteredFormIds(new Set())
      return
    }
    api
      .get(`/users/${user._id}/events`)
      .then((res) => {
        const submissions = res.data?.data || []
        setRegisteredFormIds(new Set(submissions.map((s) => s.formId)))
      })
      .catch(() => setRegisteredFormIds(new Set()))
  }, [user?._id])

  const markRegistered = (events) =>
    events.map((e) => ({
      ...e,
      isRegistered: registeredFormIds.has(e.formId),
    }))

  return (
    <main>
      <EventsHero featuredEvent={upcoming[0]} loading={loading} />
      <UpcomingEvents events={markRegistered(upcoming)} loading={loading} />
      <PreviousEvents events={markRegistered(previous)} loading={loading} />
    </main>
  )
}

export default Events
