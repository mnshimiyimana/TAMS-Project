"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersRound,
  BusFront,
  Blinds,
  Fuel,
  ChartColumnIncreasing,
} from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";

interface DashboardStats {
  agencyStats?: {
    userCount: number;
    busCount: number;
    driverCount: number;
    activeShiftsCount: number;
  };
  users?: any[];
  buses?: any[];
  drivers?: any[];
  activeShifts?: any[];
  fuelTransactions?: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com"

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Admin Dashboard</p>
        <h1 className="text-xl font-semibold">Welcome, {user?.username}</h1>
        <p className="text-gray-700 font-medium text-sm">
          Here's an overview of your agency's activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <UsersRound className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.agencyStats?.driverCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {stats.drivers?.filter((d: any) => d.status === "On Shift")
                .length || 0}{" "}
              currently on shift
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <BusFront className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.agencyStats?.busCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {stats.buses?.filter((b: any) => b.status === "Available")
                .length || 0}{" "}
              available for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Blinds className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.agencyStats?.activeShiftsCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {stats.activeShifts?.length || 0} shifts today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Fuel Operations
            </CardTitle>
            <Fuel className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.fuelTransactions?.length || 0}
            </div>
            <p className="text-xs text-gray-500">Recent transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-10">
        <h2 className="text-lg font-medium mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLinkCard
            title="Manage Drivers"
            description="View and manage all drivers"
            icon={<UsersRound className="h-6 w-6" />}
            onClick={() => {}}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <QuickLinkCard
            title="Manage Vehicles"
            description="View and manage all vehicles"
            icon={<BusFront className="h-6 w-6" />}
            onClick={() => {}}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <QuickLinkCard
            title="Manage Shifts"
            description="Schedule and view shifts"
            icon={<Blinds className="h-6 w-6" />}
            onClick={() => {}}
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          />
          <QuickLinkCard
            title="Fuel Management"
            description="View fuel transactions"
            icon={<Fuel className="h-6 w-6" />}
            onClick={() => {}}
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
          <QuickLinkCard
            title="View Insights"
            description="Analytics and reports"
            icon={<ChartColumnIncreasing className="h-6 w-6" />}
            onClick={() => {}}
            bgColor="bg-rose-50"
            textColor="text-rose-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            {stats.activeShifts?.length ? (
              <div className="space-y-4">
                {stats.activeShifts
                  .slice(0, 3)
                  .map((shift: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{shift.driverName}</p>
                        <p className="text-sm text-gray-500">
                          {shift.origin} to {shift.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(shift.startTime).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {shift.plateNumber}
                        </p>
                      </div>
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
    </div>
  );
}

interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
  textColor: string;
}

function QuickLinkCard({
  title,
  description,
  icon,
  onClick,
  bgColor,
  textColor,
}: QuickLinkCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`${bgColor} ${textColor} p-3 rounded-full`}>{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
