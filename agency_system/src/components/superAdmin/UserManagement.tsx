"use client";

import { useEffect, useState } from "react";
import { useUserManagement } from "@/hooks/superadmin/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Search,
  RefreshCw,
  MoreVertical,
  UserCog,
  XCircle,
  CheckCircle,
  KeyRound,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function UserManagement() {
  const {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    pagination,
    deleteDialog: userDeleteDialog,
    setDeleteDialog: setUserDeleteDialog,
    roleDialog,
    setRoleDialog,
    resetPasswordDialog,
    setResetPasswordDialog,
    fetchUsers,
    searchUsers,
    updateUserRole,
    deleteUser,
    resetUserPassword,
  } = useUserManagement();

  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangeRole = (user: any) => {
    setSelectedUser(user);
    setRoleDialog({
      open: true,
      user: user,
      role: user.role,
    });
  };

  const confirmRoleChange = async () => {
    if (!roleDialog.user || !roleDialog.role) return;
    await updateUserRole(roleDialog.user._id, roleDialog.role);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setUserDeleteDialog({
      open: true,
      user: user,
    });
  };

  const confirmDeleteUser = async () => {
    if (!userDeleteDialog.user) return;
    await deleteUser(userDeleteDialog.user._id);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setResetPasswordDialog({
      open: true,
      user: user,
    });
  };

  const confirmResetPassword = async () => {
    if (!resetPasswordDialog.user) return;
    await resetUserPassword(resetPasswordDialog.user._id);
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        "http://localhost:5000/api/superadmin/user/status",
        {
          userId: user._id,
          isActive: user.isActive !== false ? false : true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `${user.username} ${
          user.isActive !== false ? "deactivated" : "activated"
        } successfully`
      );

      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return;

    if (searchQuery) {
      searchUsers(searchQuery, page);
    } else {
      fetchUsers(page);
    }
  };

  const filteredUsers =
    roleFilter === "all"
      ? users
      : users.filter((user: any) => user.role === roleFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search users..."
            className="border-none focus:ring-0 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          {/* 
            Use "all" for the "All Roles" option 
          */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="fuel">Fuel</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => fetchUsers()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage all users across the system</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Username</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && users.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell colSpan={7} className="h-16 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    {/* Created Date Column */}
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "superadmin"
                            ? "border-purple-500 text-purple-500"
                            : user.role === "admin"
                            ? "border-blue-500 text-blue-500"
                            : user.role === "manager"
                            ? "border-green-500 text-green-500"
                            : "border-orange-500 text-orange-500"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.agencyName || "N/A"}</TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never logged in"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.isActive !== false ? "default" : "secondary"
                        }
                        className={
                          user.isActive !== false
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }
                      >
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role !== "superadmin" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(user)}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(user)}
                              >
                                {user.isActive !== false ? (
                                  <XCircle className="mr-2 h-4 w-4" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {user.isActive !== false
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResetPassword(user)}
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="flex justify-center p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                {Array.from({ length: Math.min(pagination.pages, 5) }).map(
                  (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === pagination.page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Change Role Dialog */}
      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for user {roleDialog.user?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={roleDialog.role}
              onValueChange={(value) =>
                setRoleDialog({ ...roleDialog, role: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialog({ ...roleDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmRoleChange}
              disabled={!roleDialog.role || isLoading}
            >
              {isLoading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={userDeleteDialog.open}
        onOpenChange={(open) =>
          setUserDeleteDialog({ ...userDeleteDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{" "}
              {userDeleteDialog.user?.username}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteUser}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) =>
          setResetPasswordDialog({ ...resetPasswordDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the password for{" "}
              {resetPasswordDialog.user?.username}. They will need to set a new
              password on their next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-500 hover:bg-blue-600"
              onClick={confirmResetPassword}
            >
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
