"use client";

import React from "react";
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
} from "lucide-react";

interface AgencyViewProps {
  agency: any;
  onBack: () => void;
}

export default function AgencyView({ agency, onBack }: AgencyViewProps) {
  if (!agency) return null;

  const resources = agency.resources || {};
  const userStats = agency.userStats || { total: 0 };

  // FIXED: Changed how we access package status data to match the actual data structure
  // The data structure in superadminController.js shows that package counts are stored
  // directly in the resourceCounts object
  const packageData = {
    total: resources.packages || 0,
    delivered: resources.deliveredPackages || 0,
    inTransit: resources.inTransitPackages || 0,
    pending: resources.pendingPackages || 0,
    cancelled: resources.cancelledPackages || 0,
    returned: resources.returnedPackages || 0,
  };

  // Log the data structure to help with debugging
  console.log("Agency data:", agency);
  console.log("Resources data:", resources);
  console.log("Package data:", packageData);

  const hasDetailedPackageData =
    packageData.delivered > 0 ||
    packageData.inTransit > 0 ||
    packageData.pending > 0 ||
    packageData.cancelled > 0 ||
    packageData.returned > 0;

  const deliveryRate =
    packageData.total > 0
      ? ((packageData.delivered / packageData.total) * 100).toFixed(1)
      : "0";

  const fleetData = {
    buses: resources.buses || 0,
    drivers: resources.drivers || 0,
    fuelTransactions: resources.fuelTransactions || 0,
  };

  const driverBusRatio =
    fleetData.buses > 0
      ? (fleetData.drivers / fleetData.buses).toFixed(1)
      : "N/A";

  const operationsData = {
    shifts: resources.shifts || 0,
    activeShifts: resources.activeShifts || 0,
    feedback: resources.feedback || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Agencies
        </Button>
        <Badge
          variant={agency.isActive ? "default" : "secondary"}
          className={agency.isActive ? "bg-green-500" : "bg-gray-500"}
        >
          {agency.isActive ? "Active" : "Inactive"}
        </Badge>
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
                  {packageData.total} Total Packages
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Delivered</div>
                    <div className="text-xl font-semibold text-green-600">
                      {packageData.delivered}
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">In Transit</div>
                    <div className="text-xl font-semibold text-blue-600">
                      {packageData.inTransit}
                    </div>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Pending</div>
                    <div className="text-xl font-semibold text-yellow-600">
                      {packageData.pending}
                    </div>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Delivery Rate
                    </div>
                    <div className="text-xl font-semibold text-purple-600">
                      {deliveryRate}%
                    </div>
                  </div>
                </div>

                {(packageData.total === 0 || !hasDetailedPackageData) && (
                  <div className="mt-4 text-sm text-gray-500 italic text-center">
                    {packageData.total > 0
                      ? "Detailed package status data not available"
                      : "No package data available for this agency"}
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
                      {fleetData.fuelTransactions}
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
                    <div className="text-sm text-gray-600 mb-1">Shifts</div>
                    <div className="text-xl font-semibold text-amber-600">
                      {operationsData.shifts}
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Active Shifts
                    </div>
                    <div className="text-xl font-semibold text-emerald-600">
                      {operationsData.activeShifts}
                    </div>
                  </div>

                  <div className="rounded-lg bg-pink-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">Feedback</div>
                    <div className="text-xl font-semibold text-pink-600">
                      {operationsData.feedback}
                    </div>
                  </div>

                  <div className="rounded-lg bg-violet-50 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Activity Score
                    </div>
                    <div className="text-xl font-semibold text-violet-600">
                      {calculateActivityScore(agency)}
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
  if (!agency.resources) return "N/A";

  const {
    shifts = 0,
    packages = 0,
    feedback = 0,
    buses = 0,
    drivers = 0,
  } = agency.resources;

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
