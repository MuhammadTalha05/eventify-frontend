"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { Calendar, MapPin, Users, Globe ,Ticket} from "lucide-react";
import { useUserStore } from "@/store/user/userStore";
import { useAuthStore } from "@/store/auth/authStore"; 
import { EventDetailResponse } from "@/utils/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const { joinEvent } = useUserStore();
  const { user } = useAuthStore();

  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchEventById = async (id: string) => {
    const res = await API.get(`/api/event/${id}`);
    return res.data as EventDetailResponse;
  };

  const { data, isLoading, isError, refetch } = useQuery<EventDetailResponse, Error>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventById(eventId),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (user && data?.data.participants) {
      setHasJoined(data.data.participants.some(p => p.userId === user.id));
    }
  }, [user, data]);

  if (isLoading) return <Loader />;
  if (isError || !data?.data) return <EmptyState message="Event not found." />;

  const event = data.data;

  const handleJoinEvent = () => {
    if (!user) {
      router.push(`/auth?mode=login`);
      return;
    }
    if (hasJoined) return;
    setShowModal(true);
  };

  const confirmJoin = async () => {
    setShowModal(false);
    setJoining(true);
    try {
      await joinEvent(event.id, user!);
      setHasJoined(true);
      refetch();
    } catch (err) {
      console.error("Failed to join event", err);
      alert("Failed to join event. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const cancelJoin = () => setShowModal(false);

  // ✅ Helper to format as "DD/MM/YYYY, 03:00 pm"
  const formatDateTime = (dateString: string): string => {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12;
    if (h === 0) h = 12;
    const hh = String(h).padStart(2, "0"); // keep leading zero like "03"
    return `${dd}/${mm}/${yyyy}, ${hh}:${m} ${ampm}`;
  };

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

        {/* ✅ Show Join button only if status is ACTIVE and user role is PARTICIPANT */}
        {event.status === "ACTIVE" && user?.role === "PARTICIPANT" && (
          <button
            onClick={handleJoinEvent}
            disabled={joining || hasJoined}
            className={`absolute top-4 right-4 px-6 py-2 rounded-xl font-semibold shadow-lg transition ${
              hasJoined
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {hasJoined ? "Already Requested" : joining ? "Joining..." : "Request To Join"}
          </button>
        )}

        <h1 className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
          {event.title}
        </h1>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <span className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <Calendar size={16} /> {formatDateTime(event.startTime)} → {formatDateTime(event.endTime)}
        </span>
        <span className="flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <MapPin size={16} /> {event.venue || "N/A"}
        </span>
        <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
          <Users size={16} /> {event.confirmedParticipants} Participants
        </span>
        {/* ✅ Total Seats */}
                <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                    <Ticket size={16} /> {event.totalSeats ? event.totalSeats : "∞"} Total Seats
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
          <h3 className="font-semibold text-xl mb-3">Main Organizer</h3>
          <p className="text-gray-700">
            <span className="font-bold">Name:</span> {event.createdBy.fullName}
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h3 className="font-semibold text-xl mb-3">Contact Info</h3>
          <p className="text-gray-700"><span className="font-bold">Email:</span> {event.contactEmail}</p>
          <p className="text-gray-700"><span className="font-bold">Phone:</span> {event.contactPhone}</p>
        </div>
      </div>

      {/* Hosts */}
            {event.hosts?.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-2xl font-semibold mb-4 text-left">Hosts</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {event.hosts.map((host: any) => (
                            <div
                                key={host.id}
                                className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition"
                            >
                                <p className="font-semibold">
                                    {host.user ? host.user.fullName : host.email}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {host.user ? host.user.email : "Invited via email"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

      {/* Attachments */}
      {event.attachments.length > 0 && (
        <div className="mb-10">
          <h3 className="text-3xl font-semibold mb-4 text-left">Attachments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
            {event.attachments.map(file => (
              <div
                key={file.id}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:scale-105 transform transition duration-300"
              >
                {file.fileType.startsWith("video") ? (
                  <video
                    src={file.fileUrl}
                    controls
                    className="w-full h-60 object-cover"
                  />
                ) : (
                  <img
                    src={file.fileUrl}
                    alt={file.fileType}
                    className="w-full h-60 object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Participation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg flex flex-col items-left">
            <h2 className="text-xl font-semibold mb-4">Confirm Participation</h2>
            <p className="text-gray-700 mb-6 text-left">
              Are you sure you want to join this event?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={cancelJoin}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmJoin}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
