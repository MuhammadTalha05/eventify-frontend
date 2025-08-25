"use client";

import { FC } from "react";
import Link from "next/link";
import { Event } from "../../utils/types";
import { Calendar } from "lucide-react";

interface EventCardProps {
  event: Event;
}

const EventCard: FC<EventCardProps> = ({ event }) => {
  const statusLabel = event.status.charAt(0) + event.status.slice(1).toLowerCase();

  const statusColor =
    event.status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : event.status === "ENDED"
      ? "bg-gray-200 text-gray-800"
      : "bg-red-100 text-red-800";

  return (
    <Link href={`/events/${event.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full
                      transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
        {/* Image */}
        <div className="relative h-56 w-full">
          <img
            src={event.featuredImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Tags */}
        <div className="flex justify-center gap-3 mt-4">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
            {event.type}
          </span>
          <span className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
            <Calendar size={14} /> {new Date(event.startTime).toLocaleDateString()}
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Title & Description */}
        <div className="p-5 flex flex-col items-center justify-center text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <p className="text-gray-500 mt-2 line-clamp-3">{event.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
