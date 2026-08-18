import React, { useState, useMemo } from "react";
import { useFeaturedEvents } from "../../hooks/dashboard/events/useFeaturedEvents";
import { usePublicEvents } from "../../hooks/usePublicEvents";
import EventCard from "../../components/guest/events/HomeEventCard";
import EventDetailModal from "../../components/guest/events/EventDetailModal";
import FlagshipSkeleton from "../../components/skeletons/FlagshipSkeleton";
import SectionHeader from "../../components/ui/SectionHeader";

export default function FlagshipEvents() {
  const { featured, loading: featuredLoading } = useFeaturedEvents();
  const { upcoming, previous, loading: eventsLoading } = usePublicEvents({ maxPages: 1 });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loading = featuredLoading || eventsLoading;

  const displayEvents = useMemo(() => {
    if (featured.length > 0) return featured;
    const pool = upcoming.length > 0 ? upcoming : previous;
    return pool.slice(0, 2);
  }, [featured, upcoming, previous]);

  if (!loading && displayEvents.length === 0) return null;

  return (
    <section
      id="flagship-events"
      className="w-full py-12 lg:py-20 px-4 lg:px-6 bg-main transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12 lg:mb-20">
          <SectionHeader
            title="FLAGSHIP"
            highlight="EVENTS"
            highlightColor="primary-dark"
          />
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-8">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <FlagshipSkeleton key={i} />)
            : displayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  badge={event.badge}
                  title={event.title}
                  image={event.image}
                  description={event.description}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal
          key={selectedEvent.id}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
}
