"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { toast } from "sonner";
import { format, parseISO, subDays, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartBarIcon,
  ClockIcon,
  TheaterIcon,
  RefreshCwIcon,
  TruckIcon,
  GroupIcon,
  CalendarDaysIcon,
  FuelIcon,
  GaugeIcon,
} from "lucide-react";

export default function Insights() {
  const [timeFrame, setTimeFrame] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<any>({
    vehicles: [],
    drivers: [],
    shifts: [],
    fuels: [],
  });
  const [metrics, setMetrics] = useState<any>({
    vehicleMetrics: {},
    driverMetrics: {},
    fuelMetrics: {},
    shiftMetrics: {},
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [timeFrame]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get data from various endpoints
      const [vehiclesRes, driversRes, shiftsRes, fuelsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/buses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/drivers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/shifts", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/fuel-management", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Filter data by date range if needed
      const days = parseInt(timeFrame);
      const cutoffDate = subDays(new Date(), days);

      const vehicles = vehiclesRes.data || [];
      const drivers = driversRes.data.drivers || [];

      const shifts = (shiftsRes.data || []).filter((shift: any) => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate >= cutoffDate;
      });

      const fuels = (fuelsRes.data || []).filter((fuel: any) => {
        const fuelDate = new Date(fuel.fuelDate);
        return fuelDate >= cutoffDate;
      });

      setInsightsData({
        vehicles,
        drivers,
        shifts,
        fuels,
      });

      // Calculate metrics
      calculateMetrics({
        vehicles,
        drivers,
        shifts,
        fuels,
      });
    } catch (err) {
      console.error("Error fetching insights data:", err);
      setError("Failed to load insights data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (data: any) => {
    const { vehicles, drivers, shifts, fuels } = data;

    // Vehicle Metrics
    const vehicleStatuses = vehicles.reduce((acc: any, vehicle: any) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});

    const vehicleStatusData = Object.keys(vehicleStatuses).map((status) => ({
      name: status,
      value: vehicleStatuses[status],
    }));

    // Driver Metrics
    const driverStatuses = drivers.reduce((acc: any, driver: any) => {
      acc[driver.status] = (acc[driver.status] || 0) + 1;
      return acc;
    }, {});

    const driverStatusData = Object.keys(driverStatuses).map((status) => ({
      name: status,
      value: driverStatuses[status],
    }));

    // Shift Metrics
    const shiftsByDay: any = {};
    const today = new Date();

    for (let i = 0; i < parseInt(timeFrame); i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      shiftsByDay[dateStr] = 0;
    }

    shifts.forEach((shift: any) => {
      const date = format(new Date(shift.startTime), "yyyy-MM-dd");
      if (shiftsByDay[date] !== undefined) {
        shiftsByDay[date]++;
      }
    });

    const shiftTrend = Object.keys(shiftsByDay)
      .sort()
      .map((date) => ({
        date,
        shifts: shiftsByDay[date],
      }));

    // Fuel Metrics
    const fuelByDay: any = {};
    const fuelCostByDay: any = {};

    for (let i = 0; i < parseInt(timeFrame); i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      fuelByDay[dateStr] = 0;
      fuelCostByDay[dateStr] = 0;
    }

    fuels.forEach((fuel: any) => {
      const date = format(new Date(fuel.fuelDate), "yyyy-MM-dd");
      if (fuelByDay[date] !== undefined) {
        fuelByDay[date] += fuel.amount || 0;
        fuelCostByDay[date] += fuel.amount * fuel.amountPrice || 0;
      }
    });

    const fuelTrend = Object.keys(fuelByDay)
      .sort()
      .map((date) => ({
        date,
        amount: fuelByDay[date],
        cost: fuelCostByDay[date].toFixed(2),
      }));

    // Vehicle utilization from shifts
    const vehicleUtilization = shifts.reduce((acc: any, shift: any) => {
      acc[shift.plateNumber] = (acc[shift.plateNumber] || 0) + 1;
      return acc;
    }, {});

    const topVehicles = Object.keys(vehicleUtilization)
      .map((plate) => ({
        plateNumber: plate,
        trips: vehicleUtilization[plate],
      }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 5);

    // Driver activity from shifts
    const driverActivity = shifts.reduce((acc: any, shift: any) => {
      acc[shift.driverName] = (acc[shift.driverName] || 0) + 1;
      return acc;
    }, {});

    const topDrivers = Object.keys(driverActivity)
      .map((name) => ({
        driverName: name,
        shifts: driverActivity[name],
      }))
      .sort((a, b) => b.shifts - a.shifts)
      .slice(0, 5);

    setMetrics({
      vehicleMetrics: {
        total: vehicles.length,
        available: vehicles.filter((v: any) => v.status === "Available").length,
        assigned: vehicles.filter((v: any) => v.status === "Assigned").length,
        maintenance: vehicles.filter(
          (v: any) => v.status === "Under Maintenance"
        ).length,
        statusDistribution: vehicleStatusData,
        topUtilized: topVehicles,
      },
      driverMetrics: {
        total: drivers.length,
        onShift: drivers.filter((d: any) => d.status === "On Shift").length,
        offShift: drivers.filter((d: any) => d.status === "Off shift").length,
        onLeave: drivers.filter((d: any) => d.status === "On leave").length,
        statusDistribution: driverStatusData,
        topActive: topDrivers,
      },
      shiftMetrics: {
        total: shifts.length,
        daily: shiftTrend,
        averagePerDay:
          shifts.length / Math.min(parseInt(timeFrame), shifts.length || 1),
      },
      fuelMetrics: {
        totalVolume: fuels.reduce(
          (sum: number, fuel: any) => sum + (fuel.amount || 0),
          0
        ),
        totalCost: fuels.reduce(
          (sum: number, fuel: any) =>
            sum + (fuel.amount * fuel.amountPrice || 0),
          0
        ),
        trend: fuelTrend,
        averagePrice:
          fuels.length > 0
            ? fuels.reduce(
                (sum: number, fuel: any) => sum + (fuel.amountPrice || 0),
                0
              ) / fuels.length
            : 0,
      },
    });
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 20}
          dy={8}
          textAnchor="middle"
          fill="#999"
        >{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
      </g>
    );
  };

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
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-medium text-green-500">Insights</p>
        <h1 className="text-xl font-semibold">Operations Analytics</h1>
        <p className="text-gray-700 font-medium text-sm">
          Comprehensive analytics to help you make informed decisions
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-medium">Time Period:</p>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCwIcon className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Vehicles</p>
                <p className="text-2xl font-bold">
                  {metrics.vehicleMetrics.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="text-green-600 font-medium">
                  {metrics.vehicleMetrics.available}
                </span>{" "}
                Available
              </div>
              <div>
                <span className="text-amber-600 font-medium">
                  {metrics.vehicleMetrics.maintenance}
                </span>{" "}
                Maintenance
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Drivers</p>
                <p className="text-2xl font-bold">
                  {metrics.driverMetrics.total}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <GroupIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="text-green-600 font-medium">
                  {metrics.driverMetrics.onShift}
                </span>{" "}
                On Shift
              </div>
              <div>
                <span className="text-blue-600 font-medium">
                  {metrics.driverMetrics.offShift}
                </span>{" "}
                Off Shift
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Shifts
                </p>
                <p className="text-2xl font-bold">
                  {metrics.shiftMetrics.total}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="text-purple-600 font-medium">
                  {metrics.shiftMetrics.averagePerDay.toFixed(1)}
                </span>{" "}
                Avg per day
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fuel Consumption
                </p>
                <p className="text-2xl font-bold">
                  {metrics.fuelMetrics.totalVolume.toFixed(1)}L
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <FuelIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="text-amber-600 font-medium">
                  RWF{metrics.fuelMetrics.totalCost.toFixed(2)}
                </span>{" "}
                Total cost
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Vehicle Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.vehicleMetrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderActiveShape}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.vehicleMetrics.statusDistribution.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GaugeIcon className="h-5 w-5" />
              Fuel Consumption Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.fuelMetrics.trend.slice(-14)}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Liters"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Cost ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TruckIcon className="h-5 w-5" />
              Top Utilized Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.vehicleMetrics.topUtilized}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plateNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trips" fill="#3b82f6" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Daily Shift Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metrics.shiftMetrics.daily.slice(-14)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="shifts"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Number of Shifts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GroupIcon className="h-5 w-5" />
              Driver Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.driverMetrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderActiveShape}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.driverMetrics.statusDistribution.map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TheaterIcon className="h-5 w-5" />
              Most Active Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.driverMetrics.topActive}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="driverName" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="shifts"
                    fill="#10b981"
                    name="Number of Shifts"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
