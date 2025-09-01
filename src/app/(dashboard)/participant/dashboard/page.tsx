"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user/userStore";
import { useAuthStore } from "@/store/auth/authStore";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";

export default function ParticipantDashboard() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const {
    participantEvents,
    totalRequestedEvents,
    totalPendingEvents,
    fetchParticipantEvents,
    pagination,
  } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  // Redirect only after initialization
  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/");
    } else if (user.role !== "PARTICIPANT") {
      router.replace("/");
    } else {
      setLoading(false);
      fetchParticipantEvents(page, search);
    }
  }, [user, initialized, page, search, router, fetchParticipantEvents]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchParticipantEvents(1, value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchParticipantEvents(newPage, search);
  };

  if (!initialized || loading) {
  return (
    <div className="text-center mt-10 text-gray-600">
      <Loader />
    </div>
  );
}

  // ✅ Helper to calculate event status
  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return { label: "Upcoming", style: "bg-blue-100 text-blue-800" };
    if (now >= start && now <= end)
      return { label: "Running", style: "bg-green-100 text-green-800" };
    if (now > end) return { label: "Ended", style: "bg-red-100 text-red-800" };

    return { label: "N/A", style: "bg-gray-100 text-gray-800" };
  };

  // ✅ Helper to format date nicely
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 w-full ">
        <h1 className="text-3xl font-bold mb-8">Participant Dashboard</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <div>
              <h2 className="text-gray-500 font-semibold">Requested Events</h2>
              <p className="text-3xl font-bold mt-2">{totalRequestedEvents}</p>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <div>
              <h2 className="text-gray-500 font-semibold">Pending Approval</h2>
              <p className="text-3xl font-bold mt-2">{totalPendingEvents}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-end mb-4 w-full md:w-1/3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search events..."
          />
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
                  Event Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Join Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No events found
                  </td>
                </tr>
              )}
              {participantEvents.map((pe) => {
                const eventStatus = getEventStatus(
                  pe.event.startTime,
                  pe.event.endTime
                );
                return (
                  <tr key={pe.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pe.event.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateTime(pe.event.startTime)}
                    </td>
                    {/* ✅ Event Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${eventStatus.style}`}
                      >
                        {eventStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pe.event.type || "ONLINE"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pe.event.venue ? pe.event.venue : "N/A"}
                    </td>
                    {/* ✅ Show Join Link only if APPROVED */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pe.status === "APPROVED" && pe.event.joinLink ? (
                        <a
                          href={pe.event.joinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Join
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pe.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : pe.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pe.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
