"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/authStore";
import { useUserStore } from "@/store/user/userStore";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import {
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import CreateEventForm from "@/components/event/CreateEventForm";
import UpdateEventForm from "@/components/event/UpdateEventForm";

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const {
    organizerEvents,
    organizerPagination,
    fetchOrganizerEvents,
    deleteEvent,
    updateEventStatus,
    createEvent,
    updateEvent
  } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // modal states
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const init = async () => {
      if (!user) {
        await fetchUser();
      }
      setInitialized(true);
    };
    init();
  }, [user, fetchUser]);

  // Redirect + fetch events
  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/");
    } else if (user.role !== "ORGANIZER") {
      router.replace("/");
    } else {
      setLoading(false);
      fetchOrganizerEvents(page, search);
    }
  }, [user, initialized, page, search, router, fetchOrganizerEvents]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchOrganizerEvents(1, value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchOrganizerEvents(newPage, search);
  };

  // ✅ Updated: Runtime status also respects event.status
  const getEventRuntimeStatus = (event: any) => {
    if (event.status === "CANCELLED")
      return { label: "CANCELLED", style: "bg-red-100 text-red-800" };
    if (event.status === "ENDED")
      return { label: "ENDED", style: "bg-pink-100 text-pink-800" };

    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (now < start)
      return { label: "UPCOMING", style: "bg-blue-100 text-blue-800" };
    if (now >= start && now <= end)
      return { label: "RUNNING", style: "bg-green-100 text-green-800" };
    if (now > end)
      return { label: "ENDED", style: "bg-gray-200 text-gray-700" };

    return { label: "Unknown", style: "bg-gray-100 text-gray-500" };
  };

  // ✅ Utility to format date and time properly -> DD/MM/YYYY, hh:mm am/pm
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12 || 12; // convert 0 -> 12 for midnight
    const formattedTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

    return `${day}/${month}/${year}, ${formattedTime}`;
  };

  if (!initialized || loading) {
  return (
    <div className="text-center mt-10 text-gray-600">
      <Loader />
    </div>
  );
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 w-full ">
        <h1 className="text-3xl font-bold mb-8">Organizer Dashboard</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <h2 className="text-gray-500 font-semibold">My Events</h2>
            <p className="text-3xl font-bold mt-2">{organizerEvents.length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <h2 className="text-gray-500 font-semibold">Pending Approvals</h2>
            <p className="text-3xl font-bold mt-2">
              {organizerEvents.filter((e) => e.status === "PENDING").length}
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <h2 className="text-gray-500 font-semibold">Approved</h2>
            <p className="text-3xl font-bold mt-2">
              {organizerEvents.filter((e) => e.status === "APPROVED").length}
            </p>
          </div>
        </div>

        {/* Search + Create Event */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
          {/* Search Bar */}
          <div className="w-full md:w-1/3">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search events..."
            />
          </div>

          {/* Button */}
          <div className="w-full md:w-auto">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full md:w-auto bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg flex items-center justify-center md:justify-start gap-2 hover:bg-indigo-700"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Create Event
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Runtime Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Confirmed Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Total Hosts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Event Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizerEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No events found
                  </td>
                </tr>
              )}
              {organizerEvents.map((event) => {
                const runtime = getEventRuntimeStatus(event);
                return (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/organizer/dashboard/${event.id}`)
                    }
                  >
                    <td className="px-6 py-4">{event.title}</td>
                    <td className="px-6 py-4">
                      {formatDateTime(event.startTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${runtime.style}`}
                      >
                        {runtime.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">{event.type}</td>
                    <td className="px-6 py-4">{event.confirmedParticipants}</td>
                    <td className="px-6 py-4">{event.hosts.length}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${event.status === "ENDED"
                          ? "bg-pink-100 text-pink-800"
                          : event.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 h-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center h-full gap-3">
                        <PencilIcon
                          className="h-5 w-5 text-blue-600 cursor-pointer"
                          onClick={() => {
                            setSelectedEvent(event);
                            setEditModalOpen(true);
                          }}
                        />
                        <TrashIcon
                          className="h-5 w-5 text-red-600 cursor-pointer"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDeleteModalOpen(true);
                          }}
                        />
                        <Cog6ToothIcon
                          className="h-5 w-5 text-gray-600 cursor-pointer"
                          onClick={() => {
                            setSelectedEvent(event);
                            setStatusModalOpen(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={organizerPagination.currentPage}
          totalPages={organizerPagination.totalPages}
          onPageChange={handlePageChange}
        />

        {/* All Orgianer Modals Modals */}


        {/* Create Event Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <h2 className="text-xl font-bold mb-4">Create Event</h2>
              <CreateEventForm
                onSubmit={async (formData: any) => {
                  try {
                    console.log("📤 Form data sending:", formData);
                    await createEvent(formData);
                    setCreateModalOpen(false);
                    fetchOrganizerEvents(page, search);
                  } catch (err) {
                    console.error("Failed to create event", err);
                  }
                }}
                onCancel={() => setCreateModalOpen(false)}
              />
            </div>
          </div>
        )}


        {/* Edit Event Modal */}
        {isEditModalOpen && selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            {/* Outer container for scrollable content */}
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <h2 className="text-xl font-bold mb-4">Edit Event</h2>
              <UpdateEventForm
                eventId={selectedEvent.id}
                initialData={selectedEvent}
                onSubmit={async (eventId: string, formData: any) => {
                  try {
                    console.log("📤 Updating event:", formData);
                    await updateEvent(eventId, formData);
                    setEditModalOpen(false);
                    fetchOrganizerEvents(page, search);
                  } catch (err) {
                    console.error("❌ Failed to update event", err);
                  }
                }}
                onCancel={() => setEditModalOpen(false)}
              />
            </div>
          </div>
        )}


        {/* Delete Model */}
        {isDeleteModalOpen && selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this event?</p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg cursor-pointer bg-gray-200"
                  disabled={deleting} // disable during deletion
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true); // start loading
                    try {
                      await deleteEvent(selectedEvent.id);
                      setDeleteModalOpen(false);
                      setSelectedEvent(null);
                      fetchOrganizerEvents(page, search);
                    } catch (err) {
                      console.error("Error deleting event", err);
                    } finally {
                      setDeleting(false); // stop loading
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${deleting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 cursor-pointer hover:bg-red-700"
                    }`}
                  disabled={deleting} // disable button while deleting
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status CHnage Modal */}
        {isStatusModalOpen && selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Change {selectedEvent.title} Event Status</h2>
              <select
                value={selectedEvent.status}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, status: e.target.value })
                }
                className="border rounded-lg w-full px-3 py-2"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="ENDED">ENDED</option>
              </select>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200"
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsUpdatingStatus(true);
                    try {
                      await updateEventStatus(
                        selectedEvent.id,
                        selectedEvent.status as "ACTIVE" | "CANCELLED" | "ENDED"
                      );
                      // update table immediately
                      fetchOrganizerEvents(page, search);
                      setStatusModalOpen(false);
                      setSelectedEvent(null);
                    } catch (err) {
                      console.error("Failed to update event status", err);
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${isUpdatingStatus
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 cursor-pointer hover:bg-indigo-700"
                    }`}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
