"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/common/Loader";
import { API } from "@/lib/api";
import EmptyState from "@/components/common/EmptyState";
import { Calendar, MapPin, Users, Globe } from "lucide-react";
import { EventDetailResponse } from "@/utils/types";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const fetchEventById = async (id: string) => {
    const res = await API.get(`/api/event/${id}`);
    return res.data as EventDetailResponse;
  };

  const { data, isLoading, isError } = useQuery<EventDetailResponse, Error>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventById(eventId),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Loader />;
  if (isError || !data?.data)
    return <EmptyState message="Event not found." />;

  const event = data.data;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero Image */}
      <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-xl mb-8">
        <img
          src={event.featuredImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <h1 className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
          {event.title}
        </h1>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <span className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <Calendar size={16} /> {new Date(event.startTime).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <MapPin size={16} /> {event.venue || "Online"}
        </span>
        <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <Users size={16} /> {event.confirmedParticipants} Participants
        </span>
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <Globe size={16} /> {event.type}
        </span>
        <span className="flex items-center gap-1 bg-red-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          Status: {event.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-lg mb-10 text-center leading-relaxed">
        {event.description}
      </p>

      {/* Organizer & Contact */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h3 className="font-semibold text-xl mb-3">Organizer(s)</h3>
          {event.hosts.map((host) => (
            <p key={host.id} className="text-gray-700">
              {host.fullName} ({host.role})
            </p>
          ))}
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h3 className="font-semibold text-xl mb-3">Contact Info</h3>
          <p className="text-gray-700">Email: {event.contactEmail}</p>
          <p className="text-gray-700">Phone: {event.contactPhone}</p>
        </div>
      </div>

      {/* Attachments */}
{event.attachments.length > 0 && (
  <div className="mb-10">
    <h3 className="text-3xl font-semibold mb-4 text-center">Attachments</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center">
      {event.attachments.map((file) => (
        <div
          key={file.id}
          className="relative overflow-hidden rounded-2xl shadow-lg hover:scale-105 transform transition duration-300"
        >
          <img
            src={file.fileUrl}
            alt={file.fileType}
            className="w-full h-60 object-cover"
          />
        </div>
      ))}
    </div>
  </div>
)}

      {/* Join Event */}
      {event.joinLink && (
        <div className="text-center">
          <a
            href={event.joinLink}
            target="_blank"
            className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-indigo-700 transition"
          >
            Join Event
          </a>
        </div>
      )}
    </div>
  );
}
