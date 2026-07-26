import React, { useState, useEffect, useMemo } from 'react'
import { usePublicEvents } from '../hooks/usePublicEvents'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

import HeroEvents from '../sections/events/HeroEvents'
import UpcomingEvents from '../sections/events/UpcomingEvents'
import PreviousEvents from '../sections/events/PreviousEvents'

const EVENTS_PER_PAGE = 6

const Events = () => {
  const { user } = useAuth()
  const [registeredFormIds, setRegisteredFormIds] = useState(new Set())
  const { upcoming, previous, loading } = usePublicEvents()
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [previousPage, setPreviousPage] = useState(1)

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

  const markedUpcoming = useMemo(() => markRegistered(upcoming), [upcoming, registeredFormIds])
  const markedPrevious = useMemo(() => markRegistered(previous), [previous, registeredFormIds])

  const upcomingTotalPages = Math.ceil(markedUpcoming.length / EVENTS_PER_PAGE)
  const previousTotalPages = Math.ceil(markedPrevious.length / EVENTS_PER_PAGE)

  const paginatedUpcoming = useMemo(() => {
    const start = (upcomingPage - 1) * EVENTS_PER_PAGE
    return markedUpcoming.slice(start, start + EVENTS_PER_PAGE)
  }, [markedUpcoming, upcomingPage])

  const paginatedPrevious = useMemo(() => {
    const start = (previousPage - 1) * EVENTS_PER_PAGE
    return markedPrevious.slice(start, start + EVENTS_PER_PAGE)
  }, [markedPrevious, previousPage])

  return (
    <main>
      <HeroEvents featuredEvent={upcoming[0]} loading={loading} />
      <UpcomingEvents
        events={paginatedUpcoming}
        loading={loading}
        page={upcomingPage}
        totalPages={upcomingTotalPages}
        onPageChange={setUpcomingPage}
      />
      <PreviousEvents
        events={paginatedPrevious}
        loading={loading}
        page={previousPage}
        totalPages={previousTotalPages}
        onPageChange={setPreviousPage}
      />
    </main>
  )
}

export default Events
