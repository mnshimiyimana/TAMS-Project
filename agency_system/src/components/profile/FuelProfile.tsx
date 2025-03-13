"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchFuelTransactions } from "@/redux/slices/fuelsSlice";
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
  X,
  AlertTriangle,
} from "lucide-react";
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
import { useRouter } from "next/navigation";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const router = useRouter();
  const dispatch = useDispatch();

  const [allTransactions, setAllTransactions] = useState<FuelTransaction[]>([]);

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
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<string>("");

  const user = useSelector((state: RootState) => state.auth.user);
  const fuelTransactionsState = useSelector(
    (state: RootState) => state.fuels.fuelTransactions
  );
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const loadFromRedux = async () => {
      try {
        setIsLoading(true);

        // @ts-expect-error - TypeScript might complain about the dispatch type
        await dispatch(fetchFuelTransactions());

        if (fuelTransactionsState && fuelTransactionsState.length > 0) {
          console.log(
            "Loaded from Redux store:",
            fuelTransactionsState.length,
            "transactions"
          );
          setAllTransactions(fuelTransactionsState);
          setApiError(null);
        } else {
          console.log("No data in Redux store, fetching directly");
          await fetchFuelData();
        }
      } catch (err) {
        console.error("Error loading from Redux:", err);
        await fetchFuelData();
      } finally {
        setIsLoading(false);
      }
    };

    loadFromRedux();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedDriver, selectedBus, allTransactions]);

  const fetchFuelData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      if (!token) {
        console.error("No authentication token found");
        setApiError("Authentication required. Please log in again.");
        toast.error("Please log in again");
        return;
      }

      console.log("Fetching from:", `${API_BASE_URL}/api/fuel-management`);
      console.log("Token present:", !!token);

      const response = await axios.get(`${API_BASE_URL}/api/fuel-management`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response type:", typeof response.data);

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        console.log(
          "Data found in response.data.data, length:",
          response.data.data.length
        );
        setAllTransactions(response.data.data);
      } else if (
        response.data &&
        response.data.fuelTransactions &&
        Array.isArray(response.data.fuelTransactions)
      ) {
        console.log(
          "Data found in response.data.fuelTransactions, length:",
          response.data.fuelTransactions.length
        );
        setAllTransactions(response.data.fuelTransactions);
      } else if (Array.isArray(response.data)) {
        console.log(
          "Data found directly in response.data, length:",
          response.data.length
        );
        setAllTransactions(response.data);
      } else {
        console.warn("Unexpected data format:", response.data);
        setAllTransactions([]);
        setApiError("Received data in an unexpected format");
        toast.warning("Received data in an unexpected format");
      }
    } catch (error) {
      console.error("Error fetching fuel data:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Response error data:", error.response.data);
          console.error("Response error status:", error.response.status);

          if (error.response.status === 401) {
            setApiError("Authentication error. Please log in again.");
            toast.error("Authentication error. Please log in again.");
          } else if (error.response.status === 403) {
            setApiError("You don't have permission to access this data.");
            toast.error("You don't have permission to access this data.");
          } else {
            const errorMessage =
              error.response.data.message ||
              error.response.data.error ||
              "Failed to load data";
            setApiError(`Error: ${errorMessage}`);
            toast.error(`Error: ${errorMessage}`);
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          setApiError("No response from server. Please check your connection.");
          toast.error("No response from server. Please check your connection.");
        } else {
          setApiError(`Error: ${error.message}`);
          toast.error(`Error: ${error.message}`);
        }
      } else {
        setApiError("Failed to load fuel management data");
        toast.error("Failed to load fuel management data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTransactions];

    if (selectedDriver) {
      filtered = filtered.filter((tx) => tx.driverName === selectedDriver);
    }
    if (selectedBus) {
      filtered = filtered.filter((tx) => tx.plateNumber === selectedBus);
    }

    setTransactions(filtered);
    recalcStats(filtered);
  };

  const recalcStats = (fuelData: FuelTransaction[]) => {
    if (fuelData.length === 0) {
      setFuelStats({
        totalSpent: 0,
        totalVolume: 0,
        averagePrice: 0,
        transactionsCount: 0,
      });
      setVehicleSummaries([]);
      setChartData([]);
      return;
    }

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

    chartDataArray.sort((a, b) => {
      const [monthA, yearA] = a.name.split("/");
      const [monthB, yearB] = b.name.split("/");
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return parseInt(monthA) - parseInt(monthB);
    });

    setChartData(chartDataArray);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const navigateToDashboard = () => {
    router.push("/dashboard?feature=fuels");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const uniqueDrivers = Array.from(
    new Set(allTransactions.map((t) => t.driverName))
  ).filter(Boolean);
  const uniqueBuses = Array.from(
    new Set(allTransactions.map((t) => t.plateNumber))
  ).filter(Boolean);

  const isFiltering = selectedDriver !== "" || selectedBus !== "";

  const handleClearFilters = () => {
    setSelectedDriver("");
    setSelectedBus("");
  };

  const handleRefresh = () => {
    fetchFuelData();
    toast.info("Refreshing fuel data...");
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
              <div className="bg-white p-4 rounded-md shadow mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex flex-col">
                    <label className="font-medium text-sm mb-1">
                      Filter by Driver
                    </label>
                    <Select
                      value={selectedDriver || "all"}
                      onValueChange={(val) =>
                        setSelectedDriver(val === "all" ? "" : val)
                      }
                    >
                      <SelectTrigger className="w-[200px] border-gray-300 focus:ring-green-500">
                        <SelectValue placeholder="All Drivers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Drivers</SelectItem>
                        {uniqueDrivers.map((driver) => (
                          <SelectItem key={driver} value={driver}>
                            {driver}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-medium text-sm mb-1">
                      Filter by Bus
                    </label>
                    <Select
                      value={selectedBus || "all"}
                      onValueChange={(val) =>
                        setSelectedBus(val === "all" ? "" : val)
                      }
                    >
                      <SelectTrigger className="w-[200px] border-gray-300 focus:ring-green-500">
                        <SelectValue placeholder="All Buses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buses</SelectItem>
                        {uniqueBuses.map((bus) => (
                          <SelectItem key={bus} value={bus}>
                            {bus}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isFiltering && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-gray-800 border-gray-200 hover:text-black"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {apiError}
                  </p>
                </div>
              )}

              {allTransactions.length === 0 && !apiError && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                  <p className="text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    No fuel data found. This could be because no data exists or
                    because of an API connection issue.
                  </p>
                </div>
              )}

              {/* Fuel stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <Card className="bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Total Spent
                        </p>
                        <p className="text-xl font-bold text-blue-900">
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
                        <p className="text-xl font-bold text-purple-900">
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
                          <Legend />
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
                          <Legend />
                          <Bar
                            dataKey="cost"
                            name="Cost (RWF)"
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
                    onClick={navigateToDashboard}
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
