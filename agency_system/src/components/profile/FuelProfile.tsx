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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  BarChart3,
  Droplets,
  Fuel,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  Car,
  DollarSign,
} from "lucide-react";

// Import Recharts components
import {
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FuelTransaction {
  _id: string;
  plateNumber: string;
  driverName: string;
  fuelDate: string;
  amount: number;
  amountPrice: number;
  lastFill: number;
  lastFillPrice: number;
}

interface VehicleFuelSummary {
  plateNumber: string;
  totalFuel: number;
  averageCost: number;
  transactions: number;
}

interface FuelStats {
  totalSpent: number;
  totalVolume: number;
  averagePrice: number;
  transactionsCount: number;
}

interface ChartData {
  name: string;
  volume: number;
  cost: number;
}

export default function FuelProfile() {
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [vehicleSummaries, setVehicleSummaries] = useState<
    VehicleFuelSummary[]
  >([]);
  const [fuelStats, setFuelStats] = useState<FuelStats>({
    totalSpent: 0,
    totalVolume: 0,
    averagePrice: 0,
    transactionsCount: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFuelData();
  }, []);

  const fetchFuelData = async () => {
    try {
      setIsLoading(true);

      // Get fuel transactions
      const response = await axios.get(
        "http://localhost:5000/api/fuel-management",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fuelData = Array.isArray(response.data) ? response.data : [];
      setTransactions(fuelData);

      // Calculate statistics
      if (fuelData.length > 0) {
        // Overall stats
        const totalVolume = fuelData.reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = fuelData.reduce(
          (sum, t) => sum + t.amount * t.amountPrice,
          0
        );

        setFuelStats({
          totalSpent,
          totalVolume,
          averagePrice: totalSpent / totalVolume,
          transactionsCount: fuelData.length,
        });

        // Per vehicle summaries
        const vehicleMap = new Map<string, VehicleFuelSummary>();

        fuelData.forEach((tx) => {
          if (!vehicleMap.has(tx.plateNumber)) {
            vehicleMap.set(tx.plateNumber, {
              plateNumber: tx.plateNumber,
              totalFuel: 0,
              averageCost: 0,
              transactions: 0,
            });
          }

          const summary = vehicleMap.get(tx.plateNumber)!;
          summary.totalFuel += tx.amount;
          summary.transactions += 1;
        });

        vehicleMap.forEach((summary) => {
          const vehicleTxs = fuelData.filter(
            (tx) => tx.plateNumber === summary.plateNumber
          );
          const totalCost = vehicleTxs.reduce(
            (sum, tx) => sum + tx.amount * tx.amountPrice,
            0
          );
          summary.averageCost = totalCost / summary.totalFuel;
        });

        setVehicleSummaries(Array.from(vehicleMap.values()));

        // Prepare chart data (by month)
        const monthlyData = new Map<string, { volume: number; cost: number }>();

        fuelData.forEach((tx) => {
          const date = new Date(tx.fuelDate);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

          if (!monthlyData.has(monthYear)) {
            monthlyData.set(monthYear, { volume: 0, cost: 0 });
          }

          const monthData = monthlyData.get(monthYear)!;
          monthData.volume += tx.amount;
          monthData.cost += tx.amount * tx.amountPrice;
        });

        const chartDataArray: ChartData[] = [];

        monthlyData.forEach((data, month) => {
          chartDataArray.push({
            name: month,
            volume: parseFloat(data.volume.toFixed(2)),
            cost: parseFloat(data.cost.toFixed(2)),
          });
        });

        // Sort by date
        chartDataArray.sort((a, b) => {
          const [monthA, yearA] = a.name.split("/");
          const [monthB, yearB] = b.name.split("/");

          if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
          return parseInt(monthA) - parseInt(monthB);
        });

        setChartData(chartDataArray);
      }
    } catch (error) {
      console.error("Error fetching fuel data:", error);
      toast.error("Failed to load fuel management data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="fuel-dashboard">Fuel Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>

        <TabsContent value="fuel-dashboard">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-10 w-10 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Fuel stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatCurrency(fuelStats.totalSpent)}
                        </p>
                      </div>
                      <DollarSign className="h-6 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Total Volume
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {fuelStats.totalVolume.toFixed(2)} L
                        </p>
                      </div>
                      <Droplets className="h-6 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-purple-800">
                          Avg. Price
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatCurrency(fuelStats.averagePrice)} / L
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Transactions
                        </p>
                        <p className="text-2xl font-bold text-amber-900">
                          {fuelStats.transactionsCount}
                        </p>
                      </div>
                      <CalendarDays className="h-6 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AreaChart className="h-5 w-5 text-green-600" />
                      Fuel Volume by Month
                    </CardTitle>
                    <CardDescription>
                      Monthly fuel consumption trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {chartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No fuel data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsAreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="volume"
                            name="Volume (L)"
                            stroke="#059669"
                            fill="#d1fae5"
                          />
                        </RechartsAreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Fuel Expenditure by Month
                    </CardTitle>
                    <CardDescription>
                      Monthly fuel cost analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {chartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No fuel data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="cost"
                            name="Cost ($)"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Vehicle fuel summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vehicle Fuel Summary</CardTitle>
                      <CardDescription>
                        Fuel consumption by vehicle
                      </CardDescription>
                    </div>
                    <Car className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plate Number</TableHead>
                          <TableHead>Total Fuel (L)</TableHead>
                          <TableHead>Avg. Cost Per Liter</TableHead>
                          <TableHead className="text-right">
                            Transactions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicleSummaries.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-6 text-gray-500"
                            >
                              No vehicle fuel data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          vehicleSummaries.map((vehicle) => (
                            <TableRow key={vehicle.plateNumber}>
                              <TableCell className="font-medium">
                                {vehicle.plateNumber}
                              </TableCell>
                              <TableCell>
                                {vehicle.totalFuel.toFixed(2)} L
                              </TableCell>
                              <TableCell>
                                {formatCurrency(vehicle.averageCost)}
                              </TableCell>
                              <TableCell className="text-right">
                                {vehicle.transactions}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Fuel className="h-4 w-4 mr-2" />
                    Go to Fuel Management
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
