"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Event, EventResponse } from "@/utils/types";
import EventCard from "@/components/event/EventCard";
import EmptyState from "@/components/common/EmptyState";
import Loader from "@/components/common/Loader";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";

const fetchEvents = async (page: number, search: string): Promise<EventResponse> => {
  const res = await API.get(`/api/event/all?page=${page}&search=${search}`);
  return res.data as EventResponse;
};

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery<EventResponse, Error>({
    queryKey: ["events", page, debouncedSearch],
    queryFn: () => fetchEvents(page, debouncedSearch),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const events = query.data?.data ?? [];
  const totalPages = query.data?.pagination?.totalPages ?? 1;

  // ✅ Only show ACTIVE events
  const activeEvents = events.filter(
    (event: Event) => event.status === "ACTIVE"
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-4xl font-bold text-left">All Events</h1>

        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1); // Reset page on search
          }}
          placeholder="Search events by title..."
          className="sm:w-64"
        />
      </div>

      {/* Loader */}
      {query.isLoading && <Loader />}

      {/* Error */}
      {query.isError && (
        <EmptyState message="Failed to load events. Please try again." />
      )}

      {/* No events */}
      {!query.isLoading && activeEvents.length === 0 && (
        <EmptyState message="No active events available at the moment." />
      )}

      {/* Event Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {activeEvents.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages >= 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
