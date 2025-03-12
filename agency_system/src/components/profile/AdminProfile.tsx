"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { toast } from "sonner";
import UserProfile from "./UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MoreVertical,
  UserPlus,
  RefreshCw,
  Ban,
  CheckCircle2,
  Search,
  Building,
  Users,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const newUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  role: z.enum(["manager", "fuel"], {
    required_error: "Please select a role",
  }),
});
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com"

type NewUserFormData = z.infer<typeof newUserSchema>;

export default function AdminProfile() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agencyInfo, setAgencyInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    description: "",
    userId: "",
    action: () => {},
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
  });

  useEffect(() => {
    fetchUsers();
    fetchAgencyInfo();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/agency-users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.error("API did not return an array:", response.data);
        setUsers([]);
        toast.error("Failed to load users: Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgencyInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/agencies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.length > 0) {
        setAgencyInfo(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching agency info:", error);
    }
  };

  const onAddUser = async (data: NewUserFormData) => {
    try {
      setIsAddingUser(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/create-user`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "User created successfully");
      setIsAddUserDialogOpen(false);
      reset();
      fetchUsers(); 
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsAddingUser(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/auth/user-status`,
        { userId, isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        `User ${isActive ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  };

  const resendSetupEmail = async (userId: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/resend-setup-email`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Setup email has been resent");
    } catch (error: any) {
      console.error("Error resending setup email:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend setup email"
      );
    }
  };

  const handleResendSetupEmail = (userId: string) => {
    setAlertDialog({
      open: true,
      title: "Resend Setup Email",
      description:
        "Are you sure you want to resend the password setup email to this user?",
      userId,
      action: () => resendSetupEmail(userId),
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    setAlertDialog({
      open: true,
      title: newStatus ? "Activate User" : "Deactivate User",
      description: `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } this user?`,
      userId,
      action: () => toggleUserStatus(userId, newStatus),
    });
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="agency">Agency</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>

        <TabsContent value="agency">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Agency Information</CardTitle>
                  <CardDescription>
                    Details about your transport agency
                  </CardDescription>
                </div>
                <Building className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-40 pt-10">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Agency Name</Label>
                      <div className=" font-medium">
                        {agencyInfo?.agencyName || user?.agencyName}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Location</Label>
                      <div className=" font-medium">
                        {agencyInfo?.location || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Created At</Label>
                      <div className="font-medium">
                        {agencyInfo?.createdAt
                          ? new Date(agencyInfo.createdAt).toLocaleDateString()
                          : "Not available"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Agency Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-10">
                    <Card className="bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-500">
                          {users.length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="p-4 text-center">
                        <Mail className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-green-700">
                          {users.filter((u) => u.isActive).length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4">
                <div className="py-4">
                  <CardTitle className="text-xl">User Management</CardTitle>
                  <CardDescription>
                    Manage users within your agency
                  </CardDescription>
                </div>
                <div className="flex items-center gap-10 py-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => setIsAddUserDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6 min-w-40 px-4">
                        Username
                      </TableHead>
                      <TableHead className="w-1/2 min-w-60 px-4">
                        Email
                      </TableHead>
                      <TableHead className="w-1/6 min-w-36 px-4">
                        Role
                      </TableHead>
                      <TableHead className="w-1/6 min-w-36 px-4">
                        Status
                      </TableHead>
                      <TableHead className="w-1/3 min-w-48">
                        Last Login
                      </TableHead>
                      <TableHead className="w-1/12 min-w-24 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-gray-500"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u._id}>
                          <TableCell className="font-medium">
                            {u.username}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                u.role === "admin"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : u.role === "manager"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                              }
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.isActive ? "default" : "destructive"}
                              className={
                                u.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : ""
                              }
                            >
                              {u.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(u.lastLogin)}</TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleResendSetupEmail(u._id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Resend Setup Email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleStatus(u._id, u.isActive)
                                  }
                                >
                                  {u.isActive ? (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. An email will be sent to the user to
              set their password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddUser)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("role", value as "manager" | "fuel")
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="fuel">Fuel Manager</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isAddingUser}
              >
                {isAddingUser ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                alertDialog.action();
                setAlertDialog({ ...alertDialog, open: false });
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
