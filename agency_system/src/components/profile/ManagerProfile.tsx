"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { toast } from "sonner";
import UserProfile from "./UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  Car,
  TrendingUp,
  MapPin,
  RefreshCw,
  CheckCircle,
  X,
  ClipboardCheck,
  Filter,
  Package,
  Truck,
  CheckSquare,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActivitySummary {
  totalShifts: number;
  upcomingShifts: number;
  activeDrivers: number;
  availableVehicles: number;
}

interface Package {
  _id: string;
  packageId: string;
  status: string;
  description: string;
  weight: number;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverId?: string;
  pickupLocation: string;
  deliveryLocation: string;
  driverName?: string;
  plateNumber?: string;
  notes?: string;
  createdAt?: string;
  deliveredAt?: string;
}

interface PackageStatusCounts {
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  returned: number;
  total: number;
}

interface RecentShift {
  _id: string;
  plateNumber: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  actualEndTime?: string;
  destination: string;
  origin: string;
  Date: string;
}

export default function ManagerProfile() {
  const router = useRouter();
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    totalShifts: 0,
    upcomingShifts: 0,
    activeDrivers: 0,
    availableVehicles: 0,
  });
  const [packageCounts, setPackageCounts] = useState<PackageStatusCounts>({
    pending: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    total: 0,
  });
  const [allShifts, setAllShifts] = useState<RecentShift[]>([]);
  const [displayedShifts, setDisplayedShifts] = useState<RecentShift[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingShift, setIsCompletingShift] = useState<string | null>(
    null
  );
  const [editingShift, setEditingShift] = useState<RecentShift | null>(null);
  const [actualEndTime, setActualEndTime] = useState<string>("");
  const [isUpdatingEndTime, setIsUpdatingEndTime] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshCounter, setRefreshCounter] = useState(0);

  const user = useSelector((state: RootState) => state.auth.user);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshCounter((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchManagerData();
  }, [refreshCounter]);

  const fetchManagerData = async () => {
    try {
      setIsLoading(true);

      const shiftsResponse = await axios.get(
        "http://localhost:5000/api/shifts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let shifts: RecentShift[] = [];

      if (Array.isArray(shiftsResponse.data)) {
        shifts = shiftsResponse.data;
        shifts.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setAllShifts(shifts);
        filterShifts(shifts, statusFilter);
      } else {
        console.error("Shifts response is not an array:", shiftsResponse.data);
        toast.error("Invalid shifts data format");
      }

      const driversResponse = await axios.get(
        "http://localhost:5000/api/drivers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const drivers = driversResponse.data.drivers || [];

      const vehiclesResponse = await axios.get(
        "http://localhost:5000/api/buses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const vehicles = Array.isArray(vehiclesResponse.data)
        ? vehiclesResponse.data
        : [];

      const packagesResponse = await axios.get(
        "http://localhost:5000/api/packages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let packages: Package[] = [];
      if (Array.isArray(packagesResponse.data)) {
        packages = packagesResponse.data;
      } else if (
        packagesResponse.data &&
        Array.isArray(packagesResponse.data.packages)
      ) {
        packages = packagesResponse.data.packages;
      } else {
        console.error(
          "Packages response invalid format:",
          packagesResponse.data
        );
        packages = [];
      }

      const packageStatusCounts = {
        pending: packages.filter((pkg: Package) => pkg.status === "Pending")
          .length,
        inTransit: packages.filter(
          (pkg: Package) => pkg.status === "In Transit"
        ).length,
        delivered: packages.filter((pkg: Package) => pkg.status === "Delivered")
          .length,
        cancelled: packages.filter((pkg: Package) => pkg.status === "Cancelled")
          .length,
        returned: packages.filter((pkg: Package) => pkg.status === "Returned")
          .length,
        total: packages.length,
      };

      setPackageCounts(packageStatusCounts);

      const today = new Date();

      const summary = {
        totalShifts: shifts.length,
        upcomingShifts: shifts.filter((s) => new Date(s.startTime) > today)
          .length,
        activeDrivers: drivers.filter(
          (d: { status: string }) => d.status === "On Shift"
        ).length,
        availableVehicles: vehicles.filter((v) => v.status === "Available")
          .length,
      };

      setActivitySummary(summary);

      const driverShiftCount = shifts.reduce((acc: any, shift: any) => {
        acc[shift.driverName] = (acc[shift.driverName] || 0) + 1;
        return acc;
      }, {});

      const topDriversList = Object.entries(driverShiftCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      setTopDrivers(topDriversList);
    } catch (error) {
      console.error("Error fetching manager data:", error);
      toast.error("Failed to load manager dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  function getShiftStatus(shift: RecentShift) {
    try {
      const now = new Date();
      const start = new Date(shift.startTime);

      if (isNaN(start.getTime())) {
        console.error("Invalid start time for shift:", shift);
        return "Unknown";
      }

      if (start > now) {
        return "Scheduled";
      }

      if (shift.endTime && !isNaN(new Date(shift.endTime).getTime())) {
        const end = new Date(shift.endTime);
        if (now >= end) {
          return "Completed";
        }
      }

      return "In Progress";
    } catch (error) {
      console.error("Error determining shift status:", error, shift);
      return "Unknown";
    }
  }

  function filterShifts(shifts: RecentShift[], status: string) {
    if (status === "all") {
      setDisplayedShifts(shifts);
      return;
    }

    const filtered = shifts.filter((shift) => getShiftStatus(shift) === status);
    setDisplayedShifts(filtered);
  }

  function getBadgeClasses(status: string) {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const completeShift = async (shiftId: string) => {
    try {
      setIsCompletingShift(shiftId);

      const endTime = new Date().toISOString();

      await axios.patch(
        `http://localhost:5000/api/shifts/${shiftId}`,
        { endTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Shift completed successfully");

      setAllShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift._id === shiftId ? { ...shift, endTime } : shift
        )
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("shift_updated"));
      }

      fetchManagerData();
    } catch (error) {
      console.error("Error completing shift:", error);
      toast.error("Failed to complete shift. Please try again.");
    } finally {
      setIsCompletingShift(null);
    }
  };

  const updateActualEndTime = async () => {
    if (!editingShift) return;
    try {
      setIsUpdatingEndTime(true);

      const actualEndTimeValue = new Date(actualEndTime).toISOString();

      await axios.patch(
        `http://localhost:5000/api/shifts/${editingShift._id}`,
        { actualEndTime: actualEndTimeValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Actual end time recorded successfully");

      setAllShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift._id === editingShift._id
            ? { ...shift, actualEndTime: actualEndTimeValue }
            : shift
        )
      );

      setEditingShift(null);
      setActualEndTime("");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("shift_updated"));
      }

      fetchManagerData();
    } catch (error) {
      console.error("Error recording actual end time:", error);
      toast.error("Failed to record actual end time. Please try again.");
    } finally {
      setIsUpdatingEndTime(false);
    }
  };

  useEffect(() => {
    if (editingShift) {
      let timeToUse = editingShift.actualEndTime || editingShift.endTime;
      if (timeToUse) {
        const endDate = new Date(timeToUse);
        const formattedDate = endDate.toISOString().slice(0, 16);
        setActualEndTime(formattedDate);
      } else {
        const now = new Date();
        const formattedNow = now.toISOString().slice(0, 16);
        setActualEndTime(formattedNow);
      }
    }
  }, [editingShift]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getColorForDriver = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
    ];
    return colors[index % colors.length];
  };

  const navigateToDashboard = () => {
    router.push("/dashboard?feature=shifts");
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    filterShifts(allShifts, status);
  };

  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const getPackageStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "inTransit":
        return <Truck className="h-5 w-5 text-yellow-600" />;
      case "delivered":
        return <CheckSquare className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "returned":
        return <RotateCcw className="h-5 w-5 text-purple-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPackageStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-50 text-blue-800";
      case "inTransit":
        return "bg-yellow-50 text-yellow-800";
      case "delivered":
        return "bg-green-50 text-green-800";
      case "cancelled":
        return "bg-red-50 text-red-800";
      case "returned":
        return "bg-purple-50 text-purple-800";
      default:
        return "bg-gray-50 text-gray-800";
    }
  };

  return (
    <div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>

        <TabsContent value="activity">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-10 w-10 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-16">
              {/* Activity summary cards - First row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <Card className="bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Total Shifts
                        </p>
                        <p className="text-3xl font-bold text-blue-900">
                          {activitySummary.totalShifts}
                        </p>
                      </div>
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Upcoming Shifts
                        </p>
                        <p className="text-3xl font-bold text-green-900">
                          {activitySummary.upcomingShifts}
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-purple-800">
                          Active Drivers
                        </p>
                        <p className="text-3xl font-bold text-purple-900">
                          {activitySummary.activeDrivers}
                        </p>
                      </div>
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-10">
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Available Vehicles
                        </p>
                        <p className="text-3xl font-bold text-amber-900">
                          {activitySummary.availableVehicles}
                        </p>
                      </div>
                      <Car className="h-6 w-6 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Package Status Cards */}
              {/* Package Status Summary - Minimal, Elegant Design */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Package Status Summary
                      </h3>
                      <p className="text-sm text-gray-500">
                        Overview of packages by status
                      </p>
                    </div>
                    <Package className="h-5 w-5" />
                  </div>
                </div>

                {/* Package Totals */}
                <div className="p-6 pb-2">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold text-gray-800">
                      {packageCounts.total}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">
                      total packages
                    </span>
                  </div>
                </div>

                {/* Status List - Minimal Design */}
                <div className="px-6 pb-4">
                  <div className="space-y-5">
                    {/* Pending Packages */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">
                            Pending
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {packageCounts.pending}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-400"
                          style={{
                            width:
                              packageCounts.total > 0
                                ? `${
                                    (packageCounts.pending /
                                      packageCounts.total) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* In Transit Packages */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">
                            In Transit
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {packageCounts.inTransit}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-600"
                          style={{
                            width:
                              packageCounts.total > 0
                                ? `${
                                    (packageCounts.inTransit /
                                      packageCounts.total) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Delivered Packages */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-800 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">
                            Delivered
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {packageCounts.delivered}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-800"
                          style={{
                            width:
                              packageCounts.total > 0
                                ? `${
                                    (packageCounts.delivered /
                                      packageCounts.total) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Other Statuses (Combined) */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">
                            Other
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {packageCounts.cancelled + packageCounts.returned}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-300"
                          style={{
                            width:
                              packageCounts.total > 0
                                ? `${
                                    ((packageCounts.cancelled +
                                      packageCounts.returned) /
                                      packageCounts.total) *
                                    100
                                  }%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Details Table */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Pending</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">
                            {packageCounts.pending}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          In Transit
                        </span>
                        <div className="flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-800">
                            {packageCounts.inTransit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Delivered</span>
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5 text-gray-800" />
                          <span className="text-sm font-medium text-gray-800">
                            {packageCounts.delivered}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Cancelled</span>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {packageCounts.cancelled}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Returned</span>
                        <div className="flex items-center gap-1">
                          <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {packageCounts.returned}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pt-2 pb-4 border-t border-gray-100">
                  <div className="mb-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Package Flow
                    </span>
                    {packageCounts.total > 0 && (
                      <span className="text-xs text-gray-500">
                        {Math.round(
                          (packageCounts.delivered / packageCounts.total) * 100
                        )}
                        % delivered
                      </span>
                    )}
                  </div>
                  <div className="h-2 flex rounded-full overflow-hidden bg-gray-100">
                    {/* Pending segment */}
                    {packageCounts.pending > 0 && (
                      <div
                        className="h-full bg-gray-400"
                        style={{
                          width:
                            packageCounts.total > 0
                              ? `${
                                  (packageCounts.pending /
                                    packageCounts.total) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    )}

                    {/* In Transit segment */}
                    {packageCounts.inTransit > 0 && (
                      <div
                        className="h-full bg-gray-600"
                        style={{
                          width:
                            packageCounts.total > 0
                              ? `${
                                  (packageCounts.inTransit /
                                    packageCounts.total) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    )}

                    {/* Delivered segment */}
                    {packageCounts.delivered > 0 && (
                      <div
                        className="h-full bg-gray-800"
                        style={{
                          width:
                            packageCounts.total > 0
                              ? `${
                                  (packageCounts.delivered /
                                    packageCounts.total) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    )}

                    {/* Other segment */}
                    {packageCounts.cancelled + packageCounts.returned > 0 && (
                      <div
                        className="h-full bg-gray-300"
                        style={{
                          width:
                            packageCounts.total > 0
                              ? `${
                                  ((packageCounts.cancelled +
                                    packageCounts.returned) /
                                    packageCounts.total) *
                                  100
                                }%`
                              : "0%",
                        }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Updated {new Date().toLocaleTimeString()}
                  </span>
                  <Button
                    onClick={() => router.push("/dashboard?feature=packages")}
                    variant="outline"
                    className="h-8 text-xs flex items-center gap-1.5 border-gray-300 text-gray-700"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>View All Packages</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Shifts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Shifts</CardTitle>
                        <CardDescription>
                          View and manage your shifts
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Filters Row */}
                  <div className="px-6 pb-2 flex flex-wrap gap-2">
                    <Badge
                      variant={statusFilter === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange("all")}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "Scheduled" ? "default" : "outline"
                      }
                      className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                      onClick={() => handleFilterChange("Scheduled")}
                    >
                      Scheduled
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "In Progress" ? "default" : "outline"
                      }
                      className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      onClick={() => handleFilterChange("In Progress")}
                    >
                      In Progress
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "Completed" ? "default" : "outline"
                      }
                      className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                      onClick={() => handleFilterChange("Completed")}
                    >
                      Completed
                    </Badge>
                  </div>

                  <CardContent>
                    {displayedShifts.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No shifts found matching the current filter
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {displayedShifts.map((shift, idx) => {
                          const status = getShiftStatus(shift);
                          return (
                            <div
                              key={shift._id}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">
                                  {shift.driverName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={getBadgeClasses(status)}
                                >
                                  {status}
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {shift.origin} → {shift.destination}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {formatTime(shift.startTime)}
                                    {shift.endTime
                                      ? ` - ${formatTime(shift.endTime)}`
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(shift.Date)}</span>
                                </div>
                                {shift.actualEndTime && (
                                  <div className="flex items-center gap-2">
                                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-green-700 font-medium">
                                      Actual end:{" "}
                                      {formatTime(shift.actualEndTime)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  <span>{shift.plateNumber}</span>
                                </div>
                              </div>


                              <div className="mt-3 pt-2 border-t border-gray-200">
                                {status === "Scheduled" && (

                                  <p className="text-sm text-gray-500 italic">
                                    Shift not started yet.
                                  </p>
                                )}

                                {status === "In Progress" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 focus:ring-green-500 transition-colors duration-200"
                                    onClick={() => completeShift(shift._id)}
                                    disabled={isCompletingShift === shift._id}
                                  >
                                    {isCompletingShift === shift._id ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Completing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Complete Shift
                                      </>
                                    )}
                                  </Button>
                                )}

                                {status === "Completed" &&
                                  !shift.actualEndTime && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 focus:ring-green-500"
                                      onClick={() => setEditingShift(shift)}
                                    >
                                      <ClipboardCheck className="h-4 w-4 mr-1" />
                                      Record End Time
                                    </Button>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="justify-center pt-2">
                    <p className="text-sm text-gray-500">
                      Showing {displayedShifts.length} of {allShifts.length}{" "}
                      shifts
                    </p>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Top Drivers</CardTitle>
                        <CardDescription>
                          Drivers with most shifts
                        </CardDescription>
                      </div>
                      <TrendingUp className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {topDrivers.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No driver data available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {topDrivers.map((driver, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <Avatar
                              className={`h-10 w-10 ${getColorForDriver(
                                index
                              )}`}
                            >
                              <AvatarFallback>
                                {getInitials(driver.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">
                                  {driver.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {driver.count} shifts
                                </span>
                              </div>
                              <Progress
                                value={driver.count * 10}
                                className="h-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={navigateToDashboard}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for editing the actual end time */}
      <Dialog
        open={editingShift !== null}
        onOpenChange={(open) => !open && setEditingShift(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-green-700">
              Record Actual End Time
            </DialogTitle>
            <DialogDescription>
              Enter the actual time when the shift ended
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editingShift && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600">Driver:</p>
                  <p className="col-span-2 font-medium">
                    {editingShift.driverName}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600">Route:</p>
                  <p className="col-span-2">
                    {editingShift.origin} → {editingShift.destination}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600">
                    System End Time:
                  </p>
                  <p className="col-span-2">
                    {editingShift.endTime
                      ? new Date(editingShift.endTime).toLocaleString()
                      : "Not set"}
                  </p>
                </div>

                {editingShift.actualEndTime && (
                  <div className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-600">
                      Current Actual End:
                    </p>
                    <p className="col-span-2 text-green-700 font-medium">
                      {new Date(editingShift.actualEndTime).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Label
                    htmlFor="actualEndTime"
                    className="text-sm font-medium"
                  >
                    Actual End Time
                  </Label>
                  <Input
                    id="actualEndTime"
                    type="datetime-local"
                    value={actualEndTime}
                    onChange={(e) => setActualEndTime(e.target.value)}
                    className="border-green-200 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setEditingShift(null)}
              disabled={isUpdatingEndTime}
              className="border-gray-300"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={updateActualEndTime}
              disabled={!actualEndTime || isUpdatingEndTime}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingEndTime ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Save Actual End Time
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
