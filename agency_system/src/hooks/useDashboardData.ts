"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

// ========= Enhanced Types =========
export interface ActivitySummary {
  totalShifts: number;
  upcomingShifts: number;
  activeDrivers: number;
  availableVehicles: number;
}

export interface Package {
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

export interface PackageStatusCounts {
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  returned: number;
  total: number;
}

export interface RecentShift {
  _id: string;
  plateNumber: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  actualEndTime?: string;
  destination: string;
  origin: string;
  Date: string;
  fined?: boolean;
  fineAmount?: number;
  fineReason?: string;
}

export const useManagerProfile = () => {
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
      } else if (
        shiftsResponse.data &&
        Array.isArray(shiftsResponse.data.shifts)
      ) {
        shifts = shiftsResponse.data.shifts;
      } else {
        console.error("Shifts response is not an array:", shiftsResponse.data);
        toast.error("Invalid shifts data format");
        shifts = [];
      }

      if (shifts.length > 0) {
        shifts.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setAllShifts(shifts);
        filterShifts(shifts, statusFilter);
      } else {
        setAllShifts([]);
        setDisplayedShifts([]);
      }

      const driversResponse = await axios.get(
        "http://localhost:5000/api/drivers",
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
        : vehiclesResponse.data && vehiclesResponse.data.buses
        ? vehiclesResponse.data.buses
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
        availableVehicles: vehicles.filter(
          (v: { status: string }) => v.status === "Available"
        ).length,
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

  const getShiftStatus = (shift: RecentShift) => {
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
  };

  const filterShifts = (shifts: RecentShift[], status: string) => {
    if (status === "all") {
      setDisplayedShifts(shifts);
      return;
    }

    const filtered = shifts.filter((shift) => getShiftStatus(shift) === status);
    setDisplayedShifts(filtered);
  };

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

  // Modified to include fine information
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

  const getBadgeClasses = (status: string) => {
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
  };

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

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    filterShifts(allShifts, status);
  };

  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const getPackageStatusIcon = (status: string) => {
    return status;
  };

  const getPackageStatusColor = (status: string) => {
    return status;
  };

  return {
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

    fetchManagerData,

    completeShift,
    updateActualEndTime,
    getShiftStatus,
    filterShifts,

    getBadgeClasses,
    formatDate,
    formatTime,
    getInitials,
    getColorForDriver,
    handleFilterChange,
    handleRefresh,
    getPackageStatusIcon,
    getPackageStatusColor,
  };
};

export default useManagerProfile;
