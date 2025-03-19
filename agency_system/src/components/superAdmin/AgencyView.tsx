"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  User,
  Clock,
  Package,
  MessageSquare,
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Fuel,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AgencyViewProps {
  agency: any;
  onBack: () => void;
}

export default function AgencyView({ agency, onBack }: AgencyViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [packageStats, setPackageStats] = useState({
    total: agency?.resources?.packages || 0,
    delivered: 0,
    inTransit: 0,
    pending: 0,
    cancelled: 0,
    returned: 0,
  });

  const [shiftStats, setShiftStats] = useState({
    total: agency?.resources?.shifts || 0,
    active: 0,
    scheduled: 0,
    completed: 0,
  });

  const [fuelStats, setFuelStats] = useState({
    total: 0,
  });

  const fetchAllStats = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchPackageStats(),
      fetchShiftStats(),
      fetchFuelStats(),
    ]);
    setIsLoading(false);
  };

  // Fetch package stats for this specific agency
  const fetchPackageStats = async () => {
    if (!agency?.agencyName) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";

      // Make a direct call to get package stats for this agency
      const response = await axios.get(
        `${API_URL}/api/packages/stats?agencyName=${encodeURIComponent(
          agency.agencyName
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Package stats API response:", response.data);

      // Handle different response formats
      const stats = response.data.stats || response.data || {};

      const totalDelivered =
        stats.totals?.totalDelivered || stats.totalDelivered || 0;
      const totalInTransit =
        stats.totals?.totalInTransit || stats.totalInTransit || 0;
      const totalPending =
        stats.totals?.totalPending || stats.totalPending || 0;
      const totalCancelled =
        stats.totals?.totalCancelled || stats.totalCancelled || 0;
      const totalReturned =
        stats.totals?.totalReturned || stats.totalReturned || 0;
      const totalPackages =
        stats.totals?.total || stats.total || agency?.resources?.packages || 0;

      setPackageStats({
        total: totalPackages,
        delivered: totalDelivered,
        inTransit: totalInTransit,
        pending: totalPending,
        cancelled: totalCancelled,
        returned: totalReturned,
      });
    } catch (error) {
      console.error("Error fetching package stats:", error);
    }
  };

  // Fetch shift statistics for this agency
  const fetchShiftStats = async () => {
    if (!agency?.agencyName) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";

      // For shift stats, we need to get all shifts and calculate ourselves
      const response = await axios.get(
        `${API_URL}/api/shifts?agencyName=${encodeURIComponent(
          agency.agencyName
        )}&limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Shifts API response:", response.data);

      const shifts = response.data.shifts || [];

      // Calculate actual statistics by analyzing the shifts with correct time categorization
      const now = new Date();
      let activeCount = 0;
      let scheduledCount = 0;
      let completedCount = 0;

      shifts.forEach((shift: { actualEndTime: any; startTime: string | number | Date; }) => {
        // If it has an actualEndTime, it's completed
        if (shift.actualEndTime) {
          completedCount++;
          return;
        }

        const startTime = new Date(shift.startTime);

        // If start time is in the future, it's scheduled
        if (startTime > now) {
          scheduledCount++;
        }
        // If start time is in the past and no actualEndTime, it's active/ongoing
        else {
          activeCount++;
        }
      });

      setShiftStats({
        total: shifts.length || agency?.resources?.shifts || 0,
        active: activeCount,
        scheduled: scheduledCount,
        completed: completedCount,
      });
    } catch (error) {
      console.error("Error fetching shift stats:", error);
    }
  };

  // Fetch fuel records for this agency
  const fetchFuelStats = async () => {
    if (!agency?.agencyName) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";

      // Looking at the controller, the correct endpoint is /api/fuel-management
      const response = await axios.get(
        `${API_URL}/api/fuel-management?agencyName=${encodeURIComponent(
          agency.agencyName
        )}&limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fuel API response:", response.data);

      // Determine total fuel transactions from different response formats
      let totalFuelRecords = 0;

      if (
        response.data?.fuelTransactions &&
        Array.isArray(response.data.fuelTransactions)
      ) {
        totalFuelRecords = response.data.fuelTransactions.length;
      } else if (response.data?.totalTransactions) {
        totalFuelRecords = response.data.totalTransactions;
      } else if (Array.isArray(response.data)) {
        totalFuelRecords = response.data.length;
      }

      setFuelStats({
        total: totalFuelRecords,
      });
    } catch (error) {
      console.error("Error fetching fuel stats:", error);
      try {
        // Try alternate endpoint as a fallback
        const token = localStorage.getItem("token");
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://tams-project.onrender.com";

        const response = await axios.get(
          `${API_URL}/api/fuel?agencyName=${encodeURIComponent(
            agency.agencyName
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Alternative fuel API response:", response.data);

        let totalFuelRecords = 0;
        if (response.data?.total) {
          totalFuelRecords = response.data.total;
        } else if (Array.isArray(response.data)) {
          totalFuelRecords = response.data.length;
        }

        setFuelStats({
          total: totalFuelRecords,
        });
      } catch (altError) {
        console.error(
          "Error fetching fuel stats from alternative endpoint:",
          altError
        );
      }
    }
  };

  // Fetch all stats when the component mounts
  useEffect(() => {
    fetchAllStats();
  }, [agency?.agencyName]);

  if (!agency) return null;

  const resources = agency.resources || {};
  const userStats = agency.userStats || { total: 0 };

  const hasDetailedPackageData =
    packageStats.delivered > 0 ||
    packageStats.inTransit > 0 ||
    packageStats.pending > 0 ||
    packageStats.cancelled > 0 ||
    packageStats.returned > 0;

  const deliveryRate =
    packageStats.total > 0
      ? ((packageStats.delivered / packageStats.total) * 100).toFixed(1)
      : "0";

  const fleetData = {
    buses: resources.buses || 0,
    drivers: resources.drivers || 0,
    fuelTransactions: fuelStats.total || 0,
  };

  const driverBusRatio =
    fleetData.buses > 0
      ? (fleetData.drivers / fleetData.buses).toFixed(1)
      : "N/A";

  // Combined active + scheduled count for display
  const totalActiveCount = shiftStats.active + shiftStats.scheduled;

  const operationsData = {
    shifts: shiftStats.total || resources.shifts || 0,
    activeShifts: totalActiveCount,
    completedShifts: shiftStats.completed || 0,
    feedback: resources.feedback || 0,
  };

  const refreshStats = () => {
    fetchAllStats();
    toast.success("Statistics refreshed");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Agencies
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh Stats
          </Button>
          <Badge
            variant={agency.isActive ? "default" : "secondary"}
            className={agency.isActive ? "bg-green-500" : "bg-gray-500"}
          >
            {agency.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              <CardTitle>{agency.agencyName}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{agency.location}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(agency.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Users Section */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {userStats.total} Total Users
                </div>

                <div className="space-y-2">
                  {userStats.roleDistribution?.map((role: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{role.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {role.count}
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(role.count / userStats.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!userStats.roleDistribution ||
                    userStats.roleDistribution.length === 0) && (
                    <div className="text-sm text-gray-500 italic">
                      No user role distribution data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Packages Section */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {packageStats.total} Total Packages
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Delivered</div>
                    <div className="text-xl font-semibold text-green-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                      ) : (
                        packageStats.delivered
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">In Transit</div>
                    <div className="text-xl font-semibold text-blue-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      ) : (
                        packageStats.inTransit
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Pending</div>
                    <div className="text-xl font-semibold text-yellow-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500"></div>
                      ) : (
                        packageStats.pending
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Delivery Rate
                    </div>
                    <div className="text-xl font-semibold text-purple-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                      ) : (
                        `${deliveryRate}%`
                      )}
                    </div>
                  </div>
                </div>

                {packageStats.total === 0 && !isLoading && (
                  <div className="mt-4 text-sm text-gray-500 italic text-center">
                    No package data available for this agency
                  </div>
                )}

                {packageStats.total > 0 &&
                  !hasDetailedPackageData &&
                  !isLoading && (
                    <div className="mt-4 text-sm text-gray-500 italic text-center">
                      No detailed package status data available
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bus className="h-5 w-5 text-red-500" />
                  Fleet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Buses</div>
                    <div className="text-xl font-semibold text-red-600">
                      {fleetData.buses}
                    </div>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Drivers</div>
                    <div className="text-xl font-semibold text-orange-600">
                      {fleetData.drivers}
                    </div>
                  </div>

                  <div className="rounded-lg bg-cyan-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Driver:Bus Ratio
                    </div>
                    <div className="text-xl font-semibold text-cyan-600">
                      {driverBusRatio}
                    </div>
                  </div>

                  <div className="rounded-lg bg-indigo-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Fuel Records
                    </div>
                    <div className="text-xl font-semibold text-indigo-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                      ) : (
                        fleetData.fuelTransactions
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operations Section */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-amber-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Total Shifts
                    </div>
                    <div className="text-xl font-semibold text-amber-600">
                      {operationsData.shifts}
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Active Shifts
                    </div>
                    <div className="text-xl font-semibold text-emerald-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-500"></div>
                      ) : (
                        operationsData.activeShifts
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {!isLoading && (
                        <>
                          {shiftStats.active} ongoing, {shiftStats.scheduled}{" "}
                          scheduled
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Completed Shifts
                    </div>
                    <div className="text-xl font-semibold text-green-600">
                      {isLoading ? (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                      ) : (
                        operationsData.completedShifts
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-pink-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Feedback</div>
                    <div className="text-xl font-semibold text-pink-600">
                      {operationsData.feedback}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateActivityScore(agency: any): string {
  const resources = agency.resources || {};

  const shifts = resources.shifts || 0;
  const packages = resources.packages || 0;
  const feedback = resources.feedback || 0;
  const buses = resources.buses || 0;
  const drivers = resources.drivers || 0;

  const totalUsers = agency.userStats?.total || 0;

  if (totalUsers === 0 || (shifts === 0 && packages === 0 && feedback === 0))
    return "Inactive";

  const score =
    shifts * 0.3 +
    packages * 0.3 +
    feedback * 0.1 +
    buses * 0.15 +
    drivers * 0.15;

  if (score > 50) return "Very High";
  if (score > 20) return "High";
  if (score > 10) return "Medium";
  if (score > 5) return "Low";
  return "Very Low";
}
