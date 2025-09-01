"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/authStore";
import { useUserStore, User } from "@/store/user/userStore";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import { Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import XMarkIcon from "@heroicons/react/16/solid/XMarkIcon";
import UserForm from "@/components/user/UserForm";
import Loader from "@/components/common/Loader";
import { toast } from "react-toastify";


export default function AdminDashboard() {
  const router = useRouter();
  const { user, fetchUser, addUser } = useAuthStore();
  const {
    users,
    totalUsers,
    totalParticipants,
    totalOrganizers,
    fetchUsers,
    pagination,
    updateUserRole,
    deleteUser, // <-- Add deleteUser from store
  } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // <-- delete modal
  const [newRole, setNewRole] = useState<"PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN">("PARTICIPANT");
  const [submitting, setSubmitting] = useState(false);
  const [addingUser, setAddingUser] = useState(false);

  // Add User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "PARTICIPANT" as "PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN",
  });

  useEffect(() => {
    const init = async () => {
      if (!user) {
        await fetchUser();
      }
      setInitialized(true);
    };
    init();
  }, [user, fetchUser]);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/");
    } else if (user.role !== "SUPER_ADMIN") {
      router.replace("/");
    } else {
      setLoading(false);
      fetchUsers(page, search);
    }
  }, [user, initialized, page, search, router, fetchUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchUsers(1, value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers(newPage, search);
  };

  const openRoleModalFn = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      await updateUserRole(selectedUser.id, newRole);
      await fetchUsers(page, search);
      setShowRoleModal(false);
    } catch (err) {
      console.error("Failed to change role", err);
      alert("Failed to update role. Please try again.");
    } finally {
      toast.success("Role updated sucessfully")
      setSubmitting(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      await deleteUser(selectedUser.id);
      await fetchUsers(page, search);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      toast.success("User Deleted Successfully")
      setSubmitting(false);
    }
  };

  if (!initialized || loading) {
  return (
    <div className="text-center mt-10 text-gray-600">
      <Loader />
    </div>
  );
}

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
          <h2 className="text-gray-500 font-semibold">Total Users</h2>
          <p className="text-3xl font-bold mt-2">{totalUsers}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
          <h2 className="text-gray-500 font-semibold">Total Participants</h2>
          <p className="text-3xl font-bold mt-2">{totalParticipants}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition">
          <h2 className="text-gray-500 font-semibold">Total Organizers</h2>
          <p className="text-3xl font-bold mt-2">{totalOrganizers}</p>
        </div>
      </div>

      {/* Search + Add User */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
        <div className="w-full md:w-1/3">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search users..." />
        </div>
        <div className="w-full md:w-auto">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer justify-center md:justify-start gap-2 hover:bg-indigo-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">{u.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.phone || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.role}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <button
                    className="p-2 rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => openRoleModalFn(u)}
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    className="p-2 rounded-full cursor-pointer bg-gray-50 hover:bg-red-100"
                    onClick={() => openDeleteModal(u)}
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Change Role for {selectedUser?.fullName}</h3>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "PARTICIPANT" | "ORGANIZER")}
              className="w-full p-2 border rounded-lg mb-4"
            >
              <option value="PARTICIPANT">PARTICIPANT</option>
              <option value="ORGANIZER">ORGANIZER</option>
            </select>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300" onClick={() => setShowRoleModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-indigo-600 cursor-pointer text-white hover:bg-indigo-700 disabled:opacity-50" onClick={confirmRoleChange} disabled={submitting}>
                {submitting ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Delete {selectedUser?.fullName}?</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300" onClick={() => setShowDeleteModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-600 cursor-pointer text-white hover:bg-red-700 disabled:opacity-50" onClick={confirmDelete} disabled={submitting}>
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              type="button"
              className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
              onClick={() => setShowAddUserModal(false)}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <UserForm
              onCancel={() => setShowAddUserModal(false)}
              onSubmit={async (data) => {
                const validRoles = ["PARTICIPANT", "ORGANIZER", "SUPER_ADMIN"] as const;
                if (!validRoles.includes(data.role as any)) {
                  alert("Invalid role selected");
                  return;
                }
                const payload = {
                  ...data,
                  role: data.role as "PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN",
                };
                await addUser(payload);
                await fetchUsers(page, search);
                setShowAddUserModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

