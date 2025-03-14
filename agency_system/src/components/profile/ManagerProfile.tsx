"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useManagerProfile } from "@/hooks/useDashboardData";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Package,
  Truck,
  CheckSquare,
  XCircle,
  RotateCcw,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { RecentShift } from "@/hooks/useDashboardData";

export default function ManagerProfile() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    activitySummary,
    packageCounts,
    allShifts,
    displayedShifts,
    topDrivers,
    isLoading,
    isCompletingShift,
    editingShift,
    actualEndTime,
    isUpdatingEndTime,
    statusFilter,
    setEditingShift,
    setActualEndTime,
    completeShift,
    updateActualEndTime,
    getShiftStatus,
    getBadgeClasses,
    formatDate,
    formatTime,
    getInitials,
    getColorForDriver,
    handleFilterChange,
    handleRefresh,
    fetchManagerData,
  } = useManagerProfile();

  const [shiftPackages, setShiftPackages] = useState<{ [key: string]: number }>(
    {}
  );
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";
  const [isFined, setIsFined] = useState(false);
  const [fineAmount, setFineAmount] = useState("");
  const [fineReason, setFineReason] = useState("");
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  const fetchShiftPackages = async () => {
    if (displayedShifts.length === 0) return;

    try {
      setIsLoadingPackages(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const shiftPackageCounts: { [key: string]: number } = {};

      await Promise.all(
        displayedShifts.map(async (shift) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/api/packages?shiftId=${shift._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            let packages = [];
            if (Array.isArray(response.data)) {
              packages = response.data;
            } else if (response.data && Array.isArray(response.data.packages)) {
              packages = response.data.packages;
            }

            shiftPackageCounts[shift._id] = packages.length;
          } catch (error) {
            console.error(
              `Error fetching packages for shift ${shift._id}:`,
              error
            );
            shiftPackageCounts[shift._id] = 0;
          }
        })
      );

      setShiftPackages(shiftPackageCounts);
    } catch (error) {
      console.error("Error fetching shift packages:", error);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (editingShift) {
      setIsFined(editingShift.fined || false);
      setFineAmount(
        editingShift.fineAmount ? String(editingShift.fineAmount) : ""
      );
      setFineReason(editingShift.fineReason || "");
    }
  }, [editingShift]);

  useEffect(() => {
    if (displayedShifts.length > 0 && !isLoading) {
      fetchShiftPackages();
    }
  }, [displayedShifts, isLoading]);

  const updateShiftWithEndTimeAndFine = async () => {
    if (!editingShift) return;

    // Validate all required fields before proceeding
    if (!actualEndTime) {
      toast.error("Please select an actual end time");
      return;
    }

    if (isFined && (!fineAmount || !fineReason)) {
      toast.error("Please complete all fine information");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const actualEndTimeValue = new Date(actualEndTime).toISOString();

      const updatePayload: any = {
        actualEndTime: actualEndTimeValue,
      };

      if (isFined) {
        updatePayload.fined = true;
        updatePayload.fineAmount = parseFloat(fineAmount) || 0;
        updatePayload.fineReason = fineReason;
      }

      await axios.patch(
        `${API_BASE_URL}/api/shifts/${editingShift._id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update resource statuses
      try {
        // Update vehicle status
        const vehiclesResponse = await axios.get(
          `${API_BASE_URL}/api/buses?plateNumber=${editingShift.plateNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const vehicles = Array.isArray(vehiclesResponse.data)
          ? vehiclesResponse.data
          : vehiclesResponse.data && vehiclesResponse.data.buses
          ? vehiclesResponse.data.buses
          : [];

        const vehicleToUpdate = vehicles.find(
          (v: { plateNumber: string; }) => v.plateNumber === editingShift.plateNumber
        );

        if (vehicleToUpdate && vehicleToUpdate.status === "Assigned") {
          await axios.patch(
            `${API_BASE_URL}/api/buses/${vehicleToUpdate._id}`,
            { status: "Available" },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        // Update driver status
        const driversResponse = await axios.get(
          `${API_BASE_URL}/api/drivers?names=${editingShift.driverName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const drivers =
          driversResponse.data && driversResponse.data.drivers
            ? driversResponse.data.drivers
            : [];

        const driverToUpdate = drivers.find(
          (d: { names: string; }) => d.names === editingShift.driverName
        );

        if (driverToUpdate && driverToUpdate.status === "On Shift") {
          await axios.patch(
            `${API_BASE_URL}/api/drivers/${driverToUpdate._id}`,
            {
              status: "Off shift",
              lastShift: new Date().toISOString(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      } catch (resourceError) {
        console.error("Error updating resource statuses:", resourceError);
        // Continue with the function even if resource updates fail
      }

      toast.success("Shift end time and details recorded successfully");

      setEditingShift(null);
      setActualEndTime("");
      setIsFined(false);
      setFineAmount("");
      setFineReason("");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("shift_updated"));
      }

      fetchManagerData();
    } catch (error: any) {
      console.error("Error recording actual end time:", error);
      toast.error(
        error.message || "Failed to record shift details. Please try again."
      );
    }
  };

  const navigateToDashboard = () => {
    router.push("/dashboard?feature=shifts");
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
              {/* Activity Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                <Card className="bg-blue-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Total Shifts
                        </p>
                        <p className="text-3xl font-bold text-blue-900 mt-1">
                          {activitySummary.totalShifts}
                        </p>
                      </div>
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Upcoming Shifts
                        </p>
                        <p className="text-3xl font-bold text-green-900 mt-1">
                          {activitySummary.upcomingShifts}
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-purple-800">
                          Active Drivers
                        </p>
                        <p className="text-3xl font-bold text-purple-900 mt-1">
                          {activitySummary.activeDrivers}
                        </p>
                      </div>
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-10">
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Available Vehicles
                        </p>
                        <p className="text-3xl font-bold text-amber-900 mt-1">
                          {activitySummary.availableVehicles}
                        </p>
                      </div>
                      <Car className="h-6 w-6 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Package Status Summary */}
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

                {/* Package summary content */}
                <div className="px-6 pb-4">
                  <div className="space-y-5">
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

              {/* Shifts and Drivers Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Shifts</CardTitle>
                        <CardDescription>
                          View and manage your shifts
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>

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
                          const packageCount = shiftPackages[shift._id] || 0;
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
                                {/* Display packages for this shift */}
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span>
                                    {isLoadingPackages ? (
                                      "Loading packages..."
                                    ) : packageCount > 0 ? (
                                      <span className="text-green-700 font-medium">
                                        {packageCount} package
                                        {packageCount !== 1 && "s"}
                                      </span>
                                    ) : (
                                      "No packages"
                                    )}
                                  </span>
                                </div>
                                {shift.fined && (
                                  <div className="flex items-center gap-2 mt-2 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>
                                      Fined: ${shift.fineAmount} -{" "}
                                      {shift.fineReason}
                                    </span>
                                  </div>
                                )}
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

                <Card className="shadow-sm">
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

      {/* Enhanced Dialog for recording end time with fine information */}
      <Dialog
        open={editingShift !== null}
        onOpenChange={(open) => !open && setEditingShift(null)}
      >
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-green-700">
              Record Shift Completion Details
            </DialogTitle>
            <DialogDescription>
              Enter the actual end time and record any fines if applicable
            </DialogDescription>
          </DialogHeader>

          {/* Validation alert for fine information */}
          {isFined && (!fineAmount || !fineReason) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>
                  <strong>Required information missing:</strong> Please complete
                  all fine information to save.
                </span>
              </div>
            </div>
          )}

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
                  <p className="text-sm font-medium text-gray-600">Vehicle:</p>
                  <p className="col-span-2">{editingShift.plateNumber}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-600">Packages:</p>
                  <p className="col-span-2">
                    {isLoadingPackages ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : (
                      <span
                        className={
                          shiftPackages[editingShift._id] > 0
                            ? "text-green-700 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {shiftPackages[editingShift._id] || 0} package
                        {(shiftPackages[editingShift._id] || 0) !== 1 && "s"}
                      </span>
                    )}
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
                    Actual End Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="actualEndTime"
                    type="datetime-local"
                    value={actualEndTime}
                    onChange={(e) => setActualEndTime(e.target.value)}
                    className="border-green-200 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  {!actualEndTime && (
                    <p className="text-xs text-red-500 mt-1">
                      Please select an actual end time
                    </p>
                  )}
                </div>

                {/* Fine information section with improved validation */}
                <div className="p-4 border border-gray-200 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="fined"
                      className="text-sm font-medium flex items-center"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      Was the driver/vehicle fined?
                    </Label>
                    <Switch
                      id="fined"
                      checked={isFined}
                      onCheckedChange={setIsFined}
                    />
                  </div>

                  {isFined && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <Label
                          htmlFor="fineAmount"
                          className="text-sm font-medium"
                        >
                          Fine Amount ($){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="fineAmount"
                            type="number"
                            placeholder="0.00"
                            value={fineAmount}
                            onChange={(e) => setFineAmount(e.target.value)}
                            className={`pl-8 border-${
                              !fineAmount && isFined ? "red-500" : "red-200"
                            } focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50`}
                          />
                          {!fineAmount && isFined && (
                            <p className="text-xs text-red-500 mt-1">
                              Please enter the fine amount
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="fineReason"
                          className="text-sm font-medium"
                        >
                          Reason for Fine{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="fineReason"
                          placeholder="Describe why the fine was issued..."
                          value={fineReason}
                          onChange={(e) => setFineReason(e.target.value)}
                          className={`border-${
                            !fineReason && isFined ? "red-500" : "red-200"
                          } focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50`}
                          rows={3}
                        />
                        {!fineReason && isFined && (
                          <p className="text-xs text-red-500 mt-1">
                            Please provide a reason for the fine
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer with improved styling */}
          <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100">
            <div className="w-full flex flex-col sm:flex-row-reverse sm:justify-between sm:space-x-2">
              <Button
                onClick={updateShiftWithEndTimeAndFine}
                disabled={
                  !actualEndTime ||
                  isUpdatingEndTime ||
                  (isFined && (!fineAmount || !fineReason))
                }
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto mb-2 sm:mb-0"
              >
                {isUpdatingEndTime ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Save Shift Details
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingShift(null)}
                disabled={isUpdatingEndTime}
                className="border-gray-300 w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
