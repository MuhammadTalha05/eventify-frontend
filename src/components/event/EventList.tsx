import { FC } from "react";
import { Event } from "../../utils/types";
import EventCard from "./EventCard";

interface EventListProps {
  events: Event[];
}

const EventList: FC<EventListProps> = ({ events }) => (
  <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    {events.map(event => <EventCard key={event.id} event={event} />)}
  </div>
);

export default EventList;
