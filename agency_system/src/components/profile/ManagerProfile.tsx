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
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  TrendingUp, 
  MapPin, 
  RefreshCw 
} from "lucide-react";

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
  destination: string;
  origin: string;
  Date: string;
}

export default function ManagerProfile() {
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    totalShifts: 0,
    upcomingShifts: 0,
    activeDrivers: 0,
    availableVehicles: 0,
  });
  const [recentShifts, setRecentShifts] = useState<RecentShift[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setIsLoading(true);
      
      // Get shifts data
      const shiftsResponse = await axios.get("http://localhost:5000/api/shifts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (Array.isArray(shiftsResponse.data)) {
        setRecentShifts(shiftsResponse.data.slice(0, 5));
      }
      
      // Get drivers data
      const driversResponse = await axios.get("http://localhost:5000/api/drivers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const drivers = driversResponse.data.drivers || [];
      
      // Get vehicles data
      const vehiclesResponse = await axios.get("http://localhost:5000/api/buses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const vehicles = Array.isArray(vehiclesResponse.data) 
        ? vehiclesResponse.data 
        : [];
      
      // Calculate summary
      const today = new Date();
      const shifts = Array.isArray(shiftsResponse.data) ? shiftsResponse.data : [];
      
      const summary = {
        totalShifts: shifts.length,
        upcomingShifts: shifts.filter(s => new Date(s.startTime) > today).length,
        activeDrivers: drivers.filter((d: { status: string; }) => d.status === "On Shift").length,
        availableVehicles: vehicles.filter(v => v.status === "Available").length,
      };
      
      setActivitySummary(summary);
      
      // Calculate top drivers (by number of shifts)
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Shifts</p>
                        <p className="text-3xl font-bold text-blue-900">{activitySummary.totalShifts}</p>
                      </div>
                      <Calendar className="h-6 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-green-800">Upcoming Shifts</p>
                        <p className="text-3xl font-bold text-green-900">{activitySummary.upcomingShifts}</p>
                      </div>
                      <Clock className="h-6 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Active Drivers</p>
                        <p className="text-3xl font-bold text-purple-900">{activitySummary.activeDrivers}</p>
                      </div>
                      <Users className="h-6 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-amber-50">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start gap-6">
                      <div>
                        <p className="text-sm font-medium text-amber-800">Available Vehicles</p>
                        <p className="text-3xl font-bold text-amber-900">{activitySummary.availableVehicles}</p>
                      </div>
                      <Car className="h-6 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent shifts */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Shifts</CardTitle>
                        <CardDescription>Latest shift activities</CardDescription>
                      </div>
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentShifts.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No recent shifts found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentShifts.map((shift) => (
                          <div key={shift._id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{shift.driverName}</span>
                              <Badge 
                                variant="outline"
                                className={shift.endTime ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                              >
                                {shift.endTime ? "Completed" : "Active"}
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
                                  {shift.endTime ? ` - ${formatTime(shift.endTime)}` : " (Ongoing)"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span>{shift.plateNumber}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top drivers */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Top Drivers</CardTitle>
                        <CardDescription>Drivers with most shifts</CardDescription>
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
                            <Avatar className={`h-10 w-10 ${getColorForDriver(index)}`}>
                              <AvatarFallback>
                                {getInitials(driver.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{driver.name}</span>
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
                  onClick={() => window.location.href = '/dashboard'} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}