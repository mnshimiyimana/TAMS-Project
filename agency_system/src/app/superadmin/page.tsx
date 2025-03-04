"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Building2,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  RefreshCw,
  UserPlus,
  Search,
  ArrowLeft,
  Bus,
  User,
  Clock,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

// Import custom hooks
import { useAuthCheck } from "@/hooks/superadmin/useAuthCheck";
import { useDashboard } from "@/hooks/superadmin/useDashboard";
import { useAgencies } from "@/hooks/superadmin/useAgencies";
import { useAuditLogs } from "@/hooks/superadmin/useAuditLogs";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { signOut } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function SuperAdminPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthorized, isLoading: authLoading } = useAuthCheck();
  const [activeTab, setActiveTab] = useState("system");

  // Initialize hooks
  const {
    summary,
    isLoading: dashboardLoading,
    fetchSystemSummary,
  } = useDashboard();

  const {
    agencies,
    isLoading: agenciesLoading,
    searchQuery,
    setSearchQuery,
    deleteDialog,
    setDeleteDialog,
    createAdminDialog,
    setCreateAdminDialog,
    formData,
    handleInputChange,
    fetchAgencies,
    createAdmin,
    deleteAgency,
    toggleAgencyStatus,
  } = useAgencies();

  const { logs, isLoading: logsLoading, fetchLogs } = useAuditLogs();

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "system") {
      fetchSystemSummary();
    } else if (activeTab === "agencies") {
      fetchAgencies();
    } else if (activeTab === "users") {
      fetchLogs();
    }
  }, [activeTab, fetchSystemSummary, fetchAgencies, fetchLogs]);

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully");
    router.push("/auth/sign-in");
  };

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold">SuperAdmin</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <Button
            variant={activeTab === "system" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "system" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("system")}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            System Overview
          </Button>

          <Button
            variant={activeTab === "agencies" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "agencies" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("agencies")}
          >
            <Building2 className="mr-2 h-5 w-5" />
            Agencies
          </Button>

          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "users" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-5 w-5" />
            User Management
          </Button>

          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "settings" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            System Settings
          </Button>
        </nav>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start mt-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white p-4 border-b shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {activeTab === "system" && "System Overview"}
              {activeTab === "agencies" && "Agency Management"}
              {activeTab === "users" && "User Management"}
              {activeTab === "settings" && "System Settings"}
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500">SuperAdmin</Badge>
              <span className="font-medium">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* System Overview */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Agencies
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardLoading
                        ? "..."
                        : summary?.agencyStats?.totalAgencies || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {dashboardLoading
                        ? "..."
                        : summary?.agencyStats?.activeAgencies || 0}{" "}
                      active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardLoading
                        ? "..."
                        : summary?.userStats?.totalUsers || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      {dashboardLoading
                        ? "..."
                        : summary?.recentActivity?.newUsersLast30Days || 0}{" "}
                      new in last 30 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Resources
                    </CardTitle>
                    <Bus className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardLoading
                        ? "..."
                        : (summary?.resourceStats?.totalBuses || 0) +
                          (summary?.resourceStats?.totalDrivers || 0)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Vehicles and Drivers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      System Status
                    </CardTitle>
                    <Settings className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-medium text-green-600">
                      Active
                    </div>
                    <p className="text-xs text-gray-500">
                      All services running
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Agencies</CardTitle>
                    <CardDescription>
                      Latest agencies added to the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div>
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
                            </div>
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : summary?.recentAgencies?.length > 0 ? (
                      <div className="space-y-4">
                        {summary.recentAgencies.map(
                          (agency: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center justify-between border-b pb-2 last:border-0"
                            >
                              <div>
                                <p className="font-medium">
                                  {agency.agencyName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {agency.location}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  agency.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-gray-500">
                        No agencies found
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest user logins and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div>
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
                            </div>
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : summary?.recentLogins?.length > 0 ? (
                      <div className="space-y-4">
                        {summary.recentLogins.map((login: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b pb-2 last:border-0"
                          >
                            <div>
                              <p className="font-medium">{login.username}</p>
                              <p className="text-sm text-gray-500">
                                {login.role}{" "}
                                {login.agencyName
                                  ? `at ${login.agencyName}`
                                  : ""}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(login.lastLogin).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-gray-500">
                        No recent activity
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Key metrics and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">User Distribution</h3>
                      {dashboardLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ) : summary?.userStats?.userDistribution ? (
                        <div className="space-y-2">
                          {summary.userStats.userDistribution.map(
                            (role: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm">{role.role}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {role.count}
                                  </span>
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-500"
                                      style={{
                                        width: `${
                                          (role.count /
                                            summary?.userStats?.totalUsers) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No data available
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">
                        Resource Statistics
                      </h3>
                      {dashboardLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Buses</span>
                            <span className="text-sm font-medium">
                              {summary?.resourceStats?.totalBuses || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Drivers</span>
                            <span className="text-sm font-medium">
                              {summary?.resourceStats?.totalDrivers || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Shifts</span>
                            <span className="text-sm font-medium">
                              {summary?.resourceStats?.totalShifts || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Feedback</span>
                            <span className="text-sm font-medium">
                              {summary?.resourceStats?.totalFeedback || 0}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">System Timeline</h3>
                      {dashboardLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>First Agency Created</span>
                            <span className="font-medium">
                              {summary?.timespan?.firstAgencyCreated
                                ? new Date(
                                    summary.timespan.firstAgencyCreated
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Latest Agency Created</span>
                            <span className="font-medium">
                              {summary?.timespan?.lastAgencyCreated
                                ? new Date(
                                    summary.timespan.lastAgencyCreated
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Agencies Tab */}
          {activeTab === "agencies" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
                  <Search className="w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search agencies..."
                    className="border-none focus:ring-0 focus:outline-none w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setCreateAdminDialog(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Add Agency Admin
                  </Button>
                  <Button variant="outline" onClick={fetchAgencies}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead>Agency Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Resources</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agenciesLoading && agencies.length === 0 ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={`loading-${i}`}>
                            <TableCell colSpan={7} className="h-16 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : agencies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No agencies found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        agencies.map((agency: any) => (
                          <TableRow key={agency._id}>
                            <TableCell className="font-medium">
                              {agency.agencyName}
                            </TableCell>
                            <TableCell>{agency.location}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  agency.isActive ? "default" : "secondary"
                                }
                                className={
                                  agency.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }
                              >
                                {agency.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {agency.userStats?.total || 0} users
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center">
                                  <Bus className="h-3 w-3 mr-1" />
                                  {agency.resources?.buses || 0}
                                </span>
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {agency.resources?.drivers || 0}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {agency.resources?.shifts || 0}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(agency.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleAgencyStatus(
                                        agency.agencyName,
                                        agency.isActive
                                      )
                                    }
                                  >
                                    {agency.isActive ? (
                                      <XCircle className="mr-2 h-4 w-4" />
                                    ) : (
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                    )}
                                    {agency.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() =>
                                      setDeleteDialog({
                                        open: true,
                                        agencyId: agency._id,
                                        agencyName: agency.agencyName,
                                      })
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
                  <Search className="w-5 h-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="border-none focus:ring-0 focus:outline-none w-full"
                  />
                </div>
                <Button variant="outline" onClick={fetchLogs}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>All users across the system</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsLoading && logs.length === 0 ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={`loading-${i}`}>
                            <TableCell colSpan={6} className="h-16 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((user: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {user.username}
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
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.isActive !== false
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  user.isActive !== false
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }
                              >
                                {user.isActive !== false
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Email Configuration</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emailService">Email Service</Label>
                          <Input
                            id="emailService"
                            value="Gmail"
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailUser">Email User</Label>
                          <Input
                            id="emailUser"
                            value="system@tams.com"
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">System Maintenance</h3>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="justify-start">
                          <RefreshCw className="mr-2 h-4 w-4" /> Rebuild System
                          Cache
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <FileText className="mr-2 h-4 w-4" /> Export System
                          Logs
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">API Configuration</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="apiUrl">API Base URL</Label>
                          <Input
                            id="apiUrl"
                            value="http://localhost:5000/api"
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="apiTimeout">API Timeout (ms)</Label>
                          <Input
                            id="apiTimeout"
                            type="number"
                            value="30000"
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Delete Agency Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the agency "
              {deleteDialog.agencyName}" and cannot be undone. All associated
              data including users, vehicles, and shifts will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAgency}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Admin Dialog */}
      <Dialog open={createAdminDialog} onOpenChange={setCreateAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Agency Admin</DialogTitle>
            <DialogDescription>
              Create a new admin user for an agency
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createAdmin}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="agencyName" className="text-right text-sm">
                  Agency Name
                </label>
                <Input
                  id="agencyName"
                  name="agencyName"
                  placeholder="Enter agency name"
                  className="col-span-3"
                  required
                  value={formData.agencyName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="username" className="text-right text-sm">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  className="col-span-3"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  className="col-span-3"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right text-sm">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  className="col-span-3"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="location" className="text-right text-sm">
                  Location
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter location"
                  className="col-span-3"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateAdminDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {agenciesLoading ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
