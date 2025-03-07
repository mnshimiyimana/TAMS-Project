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
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActivitySummary {
  totalShifts: number;
  upcomingShifts: number;
  activeDrivers: number;
  availableVehicles: number;
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

  // Refresh data every 30 seconds to update statuses
  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshCounter((prev) => prev + 1);
    }, 30000); // 30 seconds

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
        // Sort shifts by start time, most recent first
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

      // Debug check - log any invalid dates
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

      // If start time has passed but no end time or end time is in future
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

      // Update the shift in our state
      setAllShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift._id === shiftId ? { ...shift, endTime } : shift
        )
      );

      // Also dispatch a global shift updated event to update other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("shift_updated"));
      }

      // Refresh all data
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

      // Trigger a global shift updated event
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
            <div className="space-y-8">
              {/* Activity summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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
                      <Calendar className="h-6 w-8 text-blue-600" />
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
                      <Clock className="h-6 w-8 text-green-600" />
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
                      <Users className="h-6 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start gap-6">
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Available Vehicles
                        </p>
                        <p className="text-3xl font-bold text-amber-900">
                          {activitySummary.availableVehicles}
                        </p>
                      </div>
                      <Car className="h-6 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
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

                              {/* Buttons */}
                              <div className="mt-3 pt-2 border-t border-gray-200">
                                {status === "Scheduled" && (
                                  // If shift is scheduled for future, no action
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
