import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building,
  Plus,
  Search,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Power,
  X,
  CheckCircle,
  Users,
  Shield,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema for agency creation/update
const agencySchema = z.object({
  agencyName: z.string().min(3, "Agency name must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

// Schema for admin creation
const adminSchema = z.object({
  agencyName: z.string().min(3, "Agency name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

type AgencyFormData = z.infer<typeof agencySchema>;
type AdminFormData = z.infer<typeof adminSchema>;

export default function SuperAdminPortal() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateAgency, setShowCreateAgency] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [agencyToEdit, setAgencyToEdit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    description: "",
    id: "",
    action: () => {},
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");
  const router = useRouter();

  const agencyForm = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      agencyName: "",
      location: "",
    },
  });

  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      agencyName: "",
      username: "",
      email: "",
      phone: "",
      location: "",
    },
  });

  useEffect(() => {
    // Verify user is superadmin, otherwise redirect
    if (user?.role !== "superadmin") {
      toast.error("Access denied. Superadmin permissions required.");
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [user, router]);

  useEffect(() => {
    if (agencyToEdit) {
      agencyForm.setValue("agencyName", agencyToEdit.agencyName);
      agencyForm.setValue("location", agencyToEdit.location);
    }
  }, [agencyToEdit, agencyForm]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Get agencies overview
      const agenciesResponse = await axios.get(
        "http://localhost:5000/api/superadmin/agencies",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAgencies(agenciesResponse.data || []);

      // Get system summary
      const systemResponse = await axios.get(
        "http://localhost:5000/api/superadmin/system-summary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSystemStats(systemResponse.data || {});

      // Get admin users
      const adminsResponse = await axios.get(
        "http://localhost:5000/api/auth/agency-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            role: "admin",
          },
        }
      );

      const adminUsers = adminsResponse.data.adminUsers || adminsResponse.data;
      setAdmins(Array.isArray(adminUsers) ? adminUsers : []);
    } catch (error) {
      console.error("Error fetching superadmin data:", error);
      toast.error("Failed to load superadmin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAgency = async (data: AgencyFormData) => {
    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:5000/api/agencies", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Agency created successfully");
      setShowCreateAgency(false);
      agencyForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Error creating agency:", error);
      toast.error(error.response?.data?.message || "Failed to create agency");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgency = async (data: AgencyFormData) => {
    try {
      setIsSubmitting(true);
      await axios.put(
        `http://localhost:5000/api/agencies/${agencyToEdit._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Agency updated successfully");
      setAgencyToEdit(null);
      agencyForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Error updating agency:", error);
      toast.error(error.response?.data?.message || "Failed to update agency");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (data: AdminFormData) => {
    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:5000/api/auth/create-admin", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Admin created successfully");
      setShowCreateAdmin(false);
      adminForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgency = async (agencyId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/agency`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          agencyName: agencies.find((a) => a._id === agencyId)?.agencyName,
        },
      });

      toast.success("Agency deleted successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting agency:", error);
      toast.error(error.response?.data?.message || "Failed to delete agency");
    }
  };

  const handleToggleAgencyStatus = async (
    agencyName: string,
    isActive: boolean
  ) => {
    try {
      await axios.patch(
        "http://localhost:5000/api/superadmin/agency-status",
        { agencyName, isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        `Agency ${isActive ? "activated" : "deactivated"} successfully`
      );
      fetchData();
    } catch (error: any) {
      console.error("Error updating agency status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update agency status"
      );
    }
  };

  const confirmDeleteAgency = (agencyId: string, agencyName: string) => {
    setAlertDialog({
      open: true,
      title: "Delete Agency",
      description: `Are you sure you want to delete the agency "${agencyName}"? This action cannot be undone.`,
      id: agencyId,
      action: () => handleDeleteAgency(agencyId),
    });
  };

  const confirmToggleAgencyStatus = (
    agencyName: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;
    setAlertDialog({
      open: true,
      title: newStatus ? "Activate Agency" : "Deactivate Agency",
      description: `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } the agency "${agencyName}"?`,
      id: agencyName,
      action: () => handleToggleAgencyStatus(agencyName, newStatus),
    });
  };

  const filteredAgencies = agencies.filter((agency) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      agency.agencyName?.toLowerCase().includes(query) ||
      agency.location?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            SuperAdmin Portal
          </h1>
          <p className="text-gray-600">
            Manage agencies and system administration
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="agencies" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="agencies">Manage Agencies</TabsTrigger>
          <TabsTrigger value="admins">Manage Admins</TabsTrigger>
          <TabsTrigger value="system">System Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 w-64 border border-gray-300 rounded-md px-3 py-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search agencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => {
                  agencyForm.reset();
                  setAgencyToEdit(null);
                  setShowCreateAgency(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Agency
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : filteredAgencies.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {searchQuery
                  ? "No agencies found matching your search"
                  : "No agencies found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agency Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgencies.map((agency) => (
                      <TableRow key={agency._id || agency.agencyName}>
                        <TableCell className="font-medium">
                          {agency.agencyName}
                        </TableCell>
                        <TableCell>{agency.location}</TableCell>
                        <TableCell>
                          {agency.userStats?.total ||
                            agency.totalUsers ||
                            "N/A"}
                        </TableCell>
                        <TableCell>{formatDate(agency.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              agency.isActive === false ? "outline" : "default"
                            }
                            className={
                              agency.isActive === false
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {agency.isActive === false ? "Inactive" : "Active"}
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
                              <DropdownMenuItem
                                onClick={() => {
                                  router.push(
                                    `/dashboard?feature=agencies&id=${agency._id}`
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setAgencyToEdit(agency);
                                  setShowCreateAgency(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Agency
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  confirmToggleAgencyStatus(
                                    agency.agencyName,
                                    agency.isActive !== false
                                  )
                                }
                              >
                                <Power className="mr-2 h-4 w-4" />
                                {agency.isActive === false
                                  ? "Activate"
                                  : "Deactivate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  confirmDeleteAgency(
                                    agency._id,
                                    agency.agencyName
                                  )
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Agency
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Agency Administrators
              </h2>
              <Button
                onClick={() => {
                  adminForm.reset();
                  setShowCreateAdmin(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add Admin
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No admin users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin._id || admin.id}>
                        <TableCell className="font-medium">
                          {admin.username}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.agencyName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              admin.isActive === false ? "outline" : "default"
                            }
                            className={
                              admin.isActive === false
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {admin.isActive === false ? "Inactive" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin.lastLogin
                            ? formatDate(admin.lastLogin)
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  toast.info(
                                    "Password reset link sent to admin"
                                  );
                                }}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  toast.success(
                                    `Admin ${
                                      admin.isActive === false
                                        ? "activated"
                                        : "deactivated"
                                    } successfully`
                                  );
                                  fetchData();
                                }}
                              >
                                <Power className="mr-2 h-4 w-4" />
                                {admin.isActive === false
                                  ? "Activate"
                                  : "Deactivate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">System Statistics</h2>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Total Agencies</span>
                    <span className="font-medium">
                      {systemStats.totalAgencies || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-medium">
                      {systemStats.userDistribution?.reduce(
                        (sum: any, role: { count: any }) => sum + role.count,
                        0
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Admin Users</span>
                    <span className="font-medium">
                      {systemStats.userDistribution?.find(
                        (r: { role: string }) => r.role === "admin"
                      )?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">System Launch Date</span>
                    <span className="font-medium">
                      {formatDate(systemStats.timespan?.firstAgencyCreated) ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : systemStats.recentAgencies?.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Newest Agencies</h3>
                  {systemStats.recentAgencies.map(
                    (
                      agency: {
                        agencyName:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        location:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        createdAt: string;
                      },
                      index: React.Key | null | undefined
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{agency.agencyName}</p>
                          <p className="text-sm text-gray-500">
                            {agency.location}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(agency.createdAt)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No recent activities
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showCreateAgency}
        onOpenChange={(open) => {
          if (!open) {
            setAgencyToEdit(null);
            agencyForm.reset();
          }
          setShowCreateAgency(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {agencyToEdit ? "Edit Agency" : "Create New Agency"}
            </DialogTitle>
            <DialogDescription>
              {agencyToEdit
                ? "Update the agency information"
                : "Add a new transport agency to the system"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={agencyForm.handleSubmit(
              agencyToEdit ? handleUpdateAgency : handleCreateAgency
            )}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                {...agencyForm.register("agencyName")}
                placeholder="Enter agency name"
                readOnly={!!agencyToEdit}
                className={agencyToEdit ? "bg-gray-50" : ""}
              />
              {agencyForm.formState.errors.agencyName && (
                <p className="text-red-500 text-sm">
                  {agencyForm.formState.errors.agencyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...agencyForm.register("location")}
                placeholder="Enter agency location"
              />
              {agencyForm.formState.errors.location && (
                <p className="text-red-500 text-sm">
                  {agencyForm.formState.errors.location.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateAgency(false);
                  setAgencyToEdit(null);
                  agencyForm.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : agencyToEdit
                  ? "Update Agency"
                  : "Create Agency"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog
        open={showCreateAdmin}
        onOpenChange={(open) => {
          if (!open) {
            adminForm.reset();
          }
          setShowCreateAdmin(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>
              Add an administrator for an agency
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={adminForm.handleSubmit(handleCreateAdmin)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="admin-agencyName">Agency Name</Label>
              <Input
                id="admin-agencyName"
                {...adminForm.register("agencyName")}
                placeholder="Enter agency name"
              />
              {adminForm.formState.errors.agencyName && (
                <p className="text-red-500 text-sm">
                  {adminForm.formState.errors.agencyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                {...adminForm.register("username")}
                placeholder="Enter username"
              />
              {adminForm.formState.errors.username && (
                <p className="text-red-500 text-sm">
                  {adminForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                {...adminForm.register("email")}
                placeholder="Enter email"
              />
              {adminForm.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {adminForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-phone">Phone Number</Label>
              <Input
                id="admin-phone"
                {...adminForm.register("phone")}
                placeholder="Enter phone number"
              />
              {adminForm.formState.errors.phone && (
                <p className="text-red-500 text-sm">
                  {adminForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-location">Location</Label>
              <Input
                id="admin-location"
                {...adminForm.register("location")}
                placeholder="Enter location"
              />
              {adminForm.formState.errors.location && (
                <p className="text-red-500 text-sm">
                  {adminForm.formState.errors.location.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateAdmin(false);
                  adminForm.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Admin"}
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
              className={
                alertDialog.title.includes("Delete")
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {alertDialog.title.includes("Delete") ? "Delete" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
