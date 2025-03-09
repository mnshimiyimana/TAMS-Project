// Create a new file: agency_system/src/hooks/superadmin/useUserManagement.ts

import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  agencyName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export function useUserManagement() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    user: User | null;
    role: string;
  }>({
    open: false,
    user: null,
    role: "",
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://tams-project.onrender.com/api/superadmin/audit-logs?page=${page}&limit=${pagination.limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data.users || []);
        setPagination({
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          pages: response.data.pagination.pages,
        });
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err?.response?.data?.message || "Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  const fetchUsersByAgency = useCallback(
    async (agencyName: string, page = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://tams-project.onrender.com/api/superadmin/users/${agencyName}?page=${page}&limit=${pagination.limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data.users || []);
        setPagination({
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          pages: response.data.pagination.pages,
        });
      } catch (err: any) {
        console.error("Error fetching users by agency:", err);
        setError(err?.response?.data?.message || "Failed to load agency users");
        toast.error("Failed to load agency users");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit]
  );

  const searchUsers = useCallback(
    async (query: string, page = 1) => {
      if (!query.trim()) {
        return fetchUsers(page);
      }

      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://tams-project.onrender.com/api/superadmin/users/search?query=${encodeURIComponent(
            query
          )}&page=${page}&limit=${pagination.limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data.users || []);
        setPagination({
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          pages: response.data.pagination.pages,
        });
      } catch (err: any) {
        console.error("Error searching users:", err);
        setError(err?.response?.data?.message || "Failed to search users");
        toast.error("Failed to search users");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers, pagination.limit]
  );

  const getUserDetails = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://tams-project.onrender.com/api/superadmin/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedUser(response.data);
      return response.data;
    } catch (err: any) {
      console.error("Error fetching user details:", err);
      setError(err?.response?.data?.message || "Failed to load user details");
      toast.error("Failed to load user details");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(
    async (userId: string, newRole: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.patch(
          "https://tams-project.onrender.com/api/superadmin/user/role",
          {
            userId,
            newRole,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("User role updated successfully");

  
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );


        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }

        return response.data;
      } catch (err: any) {
        console.error("Error updating user role:", err);
        setError(err?.response?.data?.message || "Failed to update user role");
        toast.error(
          err?.response?.data?.message || "Failed to update user role"
        );
        return null;
      } finally {
        setIsLoading(false);
        setRoleDialog({ open: false, user: null, role: "" });
      }
    },
    [selectedUser]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.delete(
          "https://tams-project.onrender.com/api/superadmin/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { userId },
          }
        );

        toast.success("User deleted successfully");


        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );

        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser(null);
        }

        return response.data;
      } catch (err: any) {
        console.error("Error deleting user:", err);
        setError(err?.response?.data?.message || "Failed to delete user");
        toast.error(err?.response?.data?.message || "Failed to delete user");
        return null;
      } finally {
        setIsLoading(false);
        setDeleteDialog({ open: false, user: null });
      }
    },
    [selectedUser]
  );

  const resetUserPassword = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://tams-project.onrender.com/api/superadmin/user/reset-password",
        {
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User password reset successfully");
      return response.data;
    } catch (err: any) {
      console.error("Error resetting user password:", err);
      setError(err?.response?.data?.message || "Failed to reset user password");
      toast.error(
        err?.response?.data?.message || "Failed to reset user password"
      );
      return null;
    } finally {
      setIsLoading(false);
      setResetPasswordDialog({ open: false, user: null });
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    pagination,
    deleteDialog,
    setDeleteDialog,
    roleDialog,
    setRoleDialog,
    resetPasswordDialog,
    setResetPasswordDialog,
    fetchUsers,
    fetchUsersByAgency,
    searchUsers,
    getUserDetails,
    updateUserRole,
    deleteUser,
    resetUserPassword,
  };
}
