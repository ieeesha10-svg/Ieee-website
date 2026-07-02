import { useState } from 'react';
import { eventsData } from '../../data/eventsData';

export function useEvents() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const allEvents = eventsData;

  const filtered = allEvents.filter((event) => {
    const matchesFilter =
      filter === 'All' ||
      event.status === filter;

    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.type.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const counts = {
    All: allEvents.length,
    Active: allEvents.filter((e) => e.status === 'Active').length,
    Completed: allEvents.filter((e) => e.status === 'Completed').length,
  };

  return {
    events: filtered,
    filter,
    setFilter,
    search,
    setSearch,
    counts,
    totalCount: allEvents.length,
  };
}
