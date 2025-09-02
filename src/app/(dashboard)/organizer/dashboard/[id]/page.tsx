"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user/userStore";
import { useAuthStore } from "@/store/auth/authStore";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { toast } from "react-toastify";
import {
    Calendar,
    MapPin,
    Users,
    Globe,
    Mail,
    Phone,
    Settings,
    X,
    Ticket
} from "lucide-react";

interface Attachment {
    id: string;
    fileUrl: string;
    fileType: string;
}

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params?.id as string;

    const { user } = useAuthStore();
    const { getEventById, updateParticipantStatus } = useUserStore();

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
    const [newStatus, setNewStatus] = useState<
        "PENDING" | "APPROVED" | "REJECTED"
    >("PENDING");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const data = await getEventById(eventId);
                setEvent(data);
            } catch (err) {
                console.error("Failed to load event:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId, getEventById]);

    if (loading) return <Loader />;
    if (error || !event) return <EmptyState message="Event not found." />;

    const openModal = (participant: any) => {
        setSelectedParticipant(participant);
        if (participant.status === "PENDING") {
            setNewStatus("APPROVED");
        } else {
            setNewStatus(participant.status as "APPROVED" | "REJECTED");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedParticipant(null);
    };

    // ✅ Helper to format datetime
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Helper to decide if file is video
    const isVideoFile = (file: any) => {
        const type = file.fileType?.toLowerCase() || "";
        return (
            type.startsWith("video") ||
            file.fileUrl.match(/\.(mp4|webm|ogg)$/i) !== null
        );
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
                <h1 className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
                    {event.title}
                </h1>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                <span className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                    <Calendar size={16} /> {formatDateTime(event.startTime)} → {formatDateTime(event.endTime)}
                </span>

                {/* ✅ Replace Venue with Join Link when ONLINE */}
                {event.type === "ONLINE" ? (
                    <a
                        href={event.joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:underline"
                    >
                        <MapPin size={16} /> Join Link
                    </a>
                ) : (
                    <span className="flex items-center gap-1 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                        <MapPin size={16} /> {event.venue || "N/A"}
                    </span>
                )}

                {/* ✅ Total Seats */}
                <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                    <Ticket size={16} /> {event.totalSeats ? event.totalSeats : "∞"} Total Seats
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
                    <h3 className="font-semibold text-xl mb-3">Main Organizer</h3>
                    <p className="text-gray-700">
                        <span className="font-bold">Name:</span>{" "}
                        {event.createdBy?.fullName}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-bold">Email:</span>{" "}
                        {event.createdBy?.email}
                    </p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition">
                    <h3 className="font-semibold text-xl mb-3">Contact Info</h3>
                    <p className="text-gray-700 flex items-center gap-2">
                        <Mail size={16} /> {event.contactEmail}
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                        <Phone size={16} /> {event.contactPhone}
                    </p>
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
            {event.attachments?.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-3xl font-semibold mb-4 text-left">
                        Attachments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
                        {event.attachments.map((file: Attachment) => (
                            <div
                                key={file.id}
                                className="relative overflow-hidden rounded-2xl shadow-lg hover:scale-105 transform transition duration-300"
                            >
                                {isVideoFile(file) ? (
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

            {/* Participants Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                <h3 className="text-2xl font-semibold px-6 py-4 border-b">
                    Participants
                </h3>
                {event.participants?.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                                    Name
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                                    Email
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                                    Status
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {event.participants.map((p: any) => (
                                <tr
                                    key={p.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-3">
                                        {p.user?.fullName || "N/A"}
                                    </td>
                                    <td className="px-6 py-3">{p.user?.email || "N/A"}</td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${p.status === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : p.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td
                                        className="px-6 py-4 h-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center h-full gap-3">
                                            <button
                                                onClick={() => openModal(p)}
                                                disabled={p.status !== "PENDING"}
                                                className={`${p.status !== "PENDING"
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-gray-600 cursor-pointer hover:text-gray-900"
                                                    }`}
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="px-6 py-4 text-gray-600">No participants yet.</p>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedParticipant && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                        <button
                            className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={closeModal}
                            disabled={isUpdating}
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-semibold mb-4">
                            Update Status for{" "}
                            {selectedParticipant.user?.fullName || "User"}
                        </h3>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Status
                            </label>
                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                value={newStatus}
                                onChange={(e) =>
                                    setNewStatus(
                                        e.target.value as "APPROVED" | "REJECTED"
                                    )
                                }
                            >
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-lg cursor-pointer bg-gray-200 hover:bg-gray-300"
                                onClick={closeModal}
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg cursor-pointer text-white ${isUpdating
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                                disabled={isUpdating}
                                onClick={async () => {
                                    try {
                                        // ✅ Prevent approving if full
                                        if (
                                            newStatus === "APPROVED" &&
                                            event.totalSeats &&
                                            event.confirmedParticipants >= event.totalSeats
                                        ) {
                                            toast.error("No more seats available");
                                            return;
                                        }

                                        setIsUpdating(true);
                                        await updateParticipantStatus(
                                            eventId,
                                            selectedParticipant.id,
                                            newStatus as
                                            | "PENDING"
                                            | "APPROVED"
                                            | "REJECTED"
                                        );
                                        const updatedEvent =
                                            await getEventById(eventId);
                                        setEvent(updatedEvent);
                                        closeModal();
                                    } catch (err) {
                                        console.error(
                                            "Failed to update participant status",
                                            err
                                        );
                                    } finally {
                                        setIsUpdating(false);
                                    }
                                }}
                            >
                                {isUpdating ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

