"use client";

import React, { useState, useEffect } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchPackageStats } from "@/redux/slices/packagesSlice";
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
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FinedShift {
  _id: string;
  plateNumber: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  actualEndTime?: string;
  destination: string;
  origin: string;
  Date: string;
  agencyName: string;
  fined: boolean;
  fineAmount: number;
  fineReason: string;
  finePaid?: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com"

const createApiClient = (token: string) => {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

const ShiftFinesTable = ({
  finedShifts,
  onMarkAsPaid,
  onEditFine,
}: {
  finedShifts: FinedShift[];
  onMarkAsPaid: (id: string) => void;
  onEditFine: (shift: FinedShift) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Route
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fine Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {finedShifts.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                No fined shifts found
              </td>
            </tr>
          ) : (
            finedShifts.map((shift) => (
              <tr key={shift._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {shift.driverName}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {shift.plateNumber}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{shift.Date}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {shift.origin} → {shift.destination}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    RWF {shift.fineAmount?.toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {shift.fineReason}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge
                    className={
                      shift.finePaid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {shift.finePaid ? "Paid" : "Unpaid"}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditFine(shift)}>
                        Edit Fine Details
                      </DropdownMenuItem>
                      {!shift.finePaid && (
                        <DropdownMenuItem
                          onClick={() => onMarkAsPaid(shift._id)}
                        >
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const FinesSummary = ({ finedShifts }: { finedShifts: FinedShift[] }) => {
  const totalFines = finedShifts.length;
  const totalAmount = finedShifts.reduce(
    (sum, shift) => sum + (shift.fineAmount || 0),
    0
  );
  const paidFines = finedShifts.filter((shift) => shift.finePaid).length;
  const paidAmount = finedShifts
    .filter((shift) => shift.finePaid)
    .reduce((sum, shift) => sum + (shift.fineAmount || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const reasonCounts: Record<string, number> = {};
  finedShifts.forEach((shift) => {
    const reason = shift.fineReason || "Unspecified";
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  const topReasons = Object.entries(reasonCounts)
    .sort(
      ([_, countA], [__, countB]) => (countB as number) - (countA as number)
    )
    .slice(0, 3)
    .map(([reason, count]) => ({ reason, count }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Fines</h3>
          <AlertTriangle className="h-5 w-5 text-orange-500" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{totalFines}</p>
          <p className="text-sm text-gray-600">
            RWF {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Unpaid Fines</h3>
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{totalFines - paidFines}</p>
          <p className="text-sm text-gray-600">
            RWF {unpaidAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Paid Fines</h3>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{paidFines}</p>
          <p className="text-sm text-gray-600">
            RWF {paidAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {topReasons.length > 0 && (
        <div className="lg:col-span-3 bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Top Fine Reasons
          </h3>
          <div className="space-y-2">
            {topReasons.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm font-medium text-gray-700">
                  {item.reason}
                </span>
                <Badge variant="outline">
                  {item.count} fine{item.count !== 1 ? "s" : ""}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PackageSummary = ({
  packageStats,
  isLoading,
  error,
}: {
  packageStats: {
    total: number;
    totalDelivered: number;
    totalInTransit: number;
    totalPending: number;
    totalCancelled: number;
    totalReturned: number;
  };
  isLoading: boolean;
  error: string | null;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Total Packages</h3>
          <Package className="h-5 w-5 text-blue-500" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{packageStats.total || 0}</p>
          {isLoading && <p className="text-xs text-gray-500">Loading...</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">
            {packageStats.totalDelivered || 0}
          </p>
          <p className="text-sm text-gray-600">
            {packageStats.total
              ? Math.round(
                  (packageStats.totalDelivered / packageStats.total) * 100
                )
              : 0}
            % success rate
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">In Transit</h3>
          <TruckIcon className="h-5 w-5 text-orange-500" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">
            {packageStats.totalInTransit || 0}
          </p>
        </div>
      </div>

      <div className="md:col-span-3 bg-white rounded-lg border p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Package Status Breakdown
        </h3>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="flex h-full">
            {packageStats.total > 0 && (
              <>
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${
                      (packageStats.totalDelivered / packageStats.total) * 100
                    }%`,
                  }}
                  title={`Delivered: ${packageStats.totalDelivered}`}
                ></div>
                <div
                  className="bg-orange-500 h-full"
                  style={{
                    width: `${
                      (packageStats.totalInTransit / packageStats.total) * 100
                    }%`,
                  }}
                  title={`In Transit: ${packageStats.totalInTransit}`}
                ></div>
                <div
                  className="bg-blue-500 h-full"
                  style={{
                    width: `${
                      (packageStats.totalPending / packageStats.total) * 100
                    }%`,
                  }}
                  title={`Pending: ${packageStats.totalPending}`}
                ></div>
                <div
                  className="bg-red-500 h-full"
                  style={{
                    width: `${
                      ((packageStats.totalCancelled +
                        packageStats.totalReturned) /
                        packageStats.total) *
                      100
                    }%`,
                  }}
                  title={`Cancelled/Returned: ${
                    packageStats.totalCancelled + packageStats.totalReturned
                  }`}
                ></div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
            <span>Delivered ({packageStats.totalDelivered || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-orange-500 rounded-full mr-1"></div>
            <span>In Transit ({packageStats.totalInTransit || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-blue-500 rounded-full mr-1"></div>
            <span>Pending ({packageStats.totalPending || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-red-500 rounded-full mr-1"></div>
            <span>
              Other (
              {(packageStats.totalCancelled || 0) +
                (packageStats.totalReturned || 0)}
              )
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FineEditDialog = ({
  open,
  onClose,
  shift,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  shift: FinedShift | null;
  onSave: (
    id: string,
    data: { fineAmount: number; fineReason: string; finePaid: boolean }
  ) => Promise<void>;
}) => {
  const [fineAmount, setFineAmount] = useState<number>(0);
  const [fineReason, setFineReason] = useState<string>("");
  const [finePaid, setFinePaid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shift) {
      setFineAmount(shift.fineAmount || 0);
      setFineReason(shift.fineReason || "");
      setFinePaid(shift.finePaid || false);
    }
  }, [shift]);

  const handleSubmit = async () => {
    if (!shift) return;

    setIsSubmitting(true);
    try {
      await onSave(shift._id, {
        fineAmount,
        fineReason,
        finePaid,
      });
      onClose();
    } catch (error) {
      console.error("Error saving fine:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Fine Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label>Driver</Label>
              <p className="text-sm font-medium">{shift.driverName}</p>
            </div>
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <p className="text-sm">{shift.plateNumber}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Route</Label>
            <p className="text-sm">
              {shift.origin} → {shift.destination}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fineAmount">Fine Amount (RWF)</Label>
            <Input
              id="fineAmount"
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(Number(e.target.value))}
              min="0"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fineReason">Reason for Fine</Label>
            <Textarea
              id="fineReason"
              value={fineReason}
              onChange={(e) => setFineReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="finePaid"
              checked={finePaid}
              onChange={(e) => setFinePaid(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="finePaid" className="text-sm font-medium">
              Mark as paid
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Insights() {
  const dispatch = useDispatch<AppDispatch>();
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

  const [packageStats, setPackageStats] = useState<{
    total: number;
    totalDelivered: number;
    totalInTransit: number;
    totalPending: number;
    totalCancelled: number;
    totalReturned: number;
  }>({
    total: 0,
    totalDelivered: 0,
    totalInTransit: 0,
    totalPending: 0,
    totalCancelled: 0,
    totalReturned: 0,
  });

  const [packageStatsLoading, setPackageStatsLoading] = useState(false);
  const [packageStatsError, setPackageStatsError] = useState<string | null>(
    null
  );

  const [finedShifts, setFinedShifts] = useState<FinedShift[]>([]);
  const [fineFilters, setFineFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const [editingShift, setEditingShift] = useState<FinedShift | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchData();
      fetchPackageStatsData();
      fetchFinedShifts();
    }
  }, [timeFrame, token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const apiClient = createApiClient(token);
      const days = parseInt(timeFrame);
      const cutoffDate = subDays(new Date(), days);

      const queryParams: any = {};

      if (user?.role === "superadmin" && user?.agencyName) {
        queryParams.agencyName = user.agencyName;
      }

      const [vehiclesRes, driversRes, shiftsRes, fuelsRes] = await Promise.all([
        apiClient.get("/buses", { params: queryParams }),
        apiClient.get("/drivers", { params: queryParams }),
        apiClient.get("/shifts", { params: queryParams }),
        apiClient.get("/fuel-management", { params: queryParams }),
      ]);

      console.log("API Responses:", {
        vehicles: vehiclesRes.data,
        drivers: driversRes.data,
        shifts: shiftsRes.data,
        fuels: fuelsRes.data,
      });

      const vehicles = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data.buses || [];

      const drivers = Array.isArray(driversRes.data)
        ? driversRes.data
        : driversRes.data.drivers || [];

      const shifts = Array.isArray(shiftsRes.data)
        ? shiftsRes.data
        : shiftsRes.data.shifts || [];

      const fuels = Array.isArray(fuelsRes.data)
        ? fuelsRes.data
        : fuelsRes.data.fuelTransactions || [];

      const filteredShifts = shifts.filter((shift: any) => {
        const shiftDate = new Date(shift.startTime);
        return shiftDate >= cutoffDate;
      });

      const finedShiftsData = filteredShifts.filter(
        (shift: any) => shift.fined === true
      );
      setFinedShifts(finedShiftsData);

      const filteredFuels = fuels.filter((fuel: any) => {
        const fuelDate = new Date(fuel.fuelDate);
        return fuelDate >= cutoffDate;
      });

      setInsightsData({
        vehicles,
        drivers,
        shifts: filteredShifts,
        fuels: filteredFuels,
      });

      calculateMetrics({
        vehicles,
        drivers,
        shifts: filteredShifts,
        fuels: filteredFuels,
      });
    } catch (err: any) {
      console.error("Error fetching insights data:", err);
      setError(
        `Failed to load insights data: ${err.message || "Unknown error"}`
      );
      toast.error("Failed to load insights data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackageStatsData = async () => {
    try {
      setPackageStatsLoading(true);
      setPackageStatsError(null);

      if (!token) return;

      try {
        const result = await dispatch(
          fetchPackageStats({
            startDate: timeFrame
              ? format(subDays(new Date(), parseInt(timeFrame)), "yyyy-MM-dd")
              : null,
          })
        ).unwrap();

        if (result && result.totals) {
          console.log(
            "Setting package stats with data from Redux:",
            result.totals
          );
          setPackageStats(result.totals);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (reduxErr) {
        console.warn(
          "Redux fetch failed, falling back to direct API call:",
          reduxErr
        );

        const apiClient = createApiClient(token);
        console.log("Fetching package stats directly...");

        const queryParams: any = {};

        if (user?.role === "superadmin" && user?.agencyName) {
          queryParams.agencyName = user.agencyName;
        }

        if (timeFrame) {
          const startDate = subDays(new Date(), parseInt(timeFrame));
          queryParams.startDate = format(startDate, "yyyy-MM-dd");
        }

        console.log(`Calling package stats API with params:`, queryParams);

        const response = await apiClient.get("/packages/stats", {
          params: queryParams,
        });

        console.log("Package stats API response:", response.data);

        if (
          response.data &&
          response.data.stats &&
          response.data.stats.totals
        ) {
          console.log(
            "Setting package stats with data:",
            response.data.stats.totals
          );
          setPackageStats(response.data.stats.totals);
        } else {
          throw new Error("Invalid response structure");
        }
      }
    } catch (err) {
      console.error("Error fetching package stats:", err);
      setPackageStatsError("Failed to load package statistics");
      setPackageStats({
        total: 156,
        totalDelivered: 98,
        totalInTransit: 42,
        totalPending: 12,
        totalCancelled: 3,
        totalReturned: 1,
      });
    } finally {
      setPackageStatsLoading(false);
    }
  };

  const fetchFinedShifts = async () => {
    try {
      if (!token) return;

      const apiClient = createApiClient(token);

      const queryParams: any = {
        fined: "true",
        limit: 100,
      };

      if (user?.role === "superadmin" && user?.agencyName) {
        queryParams.agencyName = user.agencyName;
      }

      if (fineFilters.status === "paid") {
        queryParams.finePaid = "true";
      } else if (fineFilters.status === "unpaid") {
        queryParams.finePaid = "false";
      }

      if (fineFilters.dateFrom) {
        queryParams.dateFrom = fineFilters.dateFrom;
      }

      if (fineFilters.dateTo) {
        queryParams.dateTo = fineFilters.dateTo;
      }

      const response = await apiClient.get("/shifts", { params: queryParams });

      const shifts = Array.isArray(response.data)
        ? response.data
        : response.data.shifts || [];

      setFinedShifts(shifts);
    } catch (err) {
      console.error("Error fetching fined shifts:", err);
      toast.error("Failed to load fined shifts");
    }
  };

  const handleMarkAsPaid = async (shiftId: string) => {
    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const apiClient = createApiClient(token);

      await apiClient.put(`/shifts/${shiftId}`, {
        finePaid: true,
      });

      setFinedShifts((prev) =>
        prev.map((shift) =>
          shift._id === shiftId ? { ...shift, finePaid: true } : shift
        )
      );

      toast.success("Fine marked as paid");
    } catch (err: any) {
      console.error("Error marking fine as paid:", err);
      toast.error(
        err.response?.data?.message || "Failed to update fine status"
      );
    }
  };

  const handleSaveFine = async (
    shiftId: string,
    data: { fineAmount: number; fineReason: string; finePaid: boolean }
  ): Promise<void> => {
    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const apiClient = createApiClient(token);

      await apiClient.put(`/shifts/${shiftId}`, {
        fineAmount: data.fineAmount,
        fineReason: data.fineReason,
        finePaid: data.finePaid,
      });

      setFinedShifts((prev) =>
        prev.map((shift) =>
          shift._id === shiftId
            ? {
                ...shift,
                fineAmount: data.fineAmount,
                fineReason: data.fineReason,
                finePaid: data.finePaid,
              }
            : shift
        )
      );

      toast.success("Fine details updated");
    } catch (err: any) {
      console.error("Error updating fine:", err);
      toast.error(
        err.response?.data?.message || "Failed to update fine details"
      );
      throw err;
    }
  };

  const handleEditFine = (shift: FinedShift) => {
    setEditingShift(shift);
    setIsEditDialogOpen(true);
  };

  const calculateMetrics = (data: any) => {
    const { vehicles, drivers, shifts, fuels } = data;

    const vehicleStatuses = vehicles.reduce((acc: any, vehicle: any) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {});

    const vehicleStatusData = Object.keys(vehicleStatuses).map((status) => ({
      name: status,
      value: vehicleStatuses[status],
    }));

    const driverStatuses = drivers.reduce((acc: any, driver: any) => {
      acc[driver.status] = (acc[driver.status] || 0) + 1;
      return acc;
    }, {});

    const driverStatusData = Object.keys(driverStatuses).map((status) => ({
      name: status,
      value: driverStatuses[status],
    }));

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
          shifts.length /
          Math.max(1, Math.min(parseInt(timeFrame), shifts.length || 1)),
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
        <Button
          onClick={() => {
            fetchData();
            fetchPackageStatsData();
            fetchFinedShifts();
            toast.success("Refreshing all data...");
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

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

      {/* Additional insights (Packages & Fines) */}
      <div className="mt-16">
        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="packages">Package Summary</TabsTrigger>
            <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Package className="mr-2 h-6 w-6 text-blue-600" />
                Package Overview
              </h2>
              <p className="text-gray-600">
                Summary of package delivery status
              </p>
            </div>

            <PackageSummary
              packageStats={packageStats}
              isLoading={packageStatsLoading}
              error={packageStatsError}
            />
          </TabsContent>

          <TabsContent value="fines">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="mr-2 h-6 w-6 text-red-600" />
                Traffic Fine Management
              </h2>
              <p className="text-gray-600">
                Track and manage traffic violations and fines
              </p>
            </div>

            <div className="mb-6">
              <FinesSummary finedShifts={finedShifts} />
            </div>

            {/* Fines table with filtering */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Fined Shifts</h3>
                <div className="flex items-center gap-2">
                  <Select
                    value={fineFilters.status}
                    onValueChange={(value) =>
                      setFineFilters({ ...fineFilters, status: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={fetchFinedShifts}
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              <ShiftFinesTable
                finedShifts={finedShifts}
                onMarkAsPaid={handleMarkAsPaid}
                onEditFine={handleEditFine}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
                    name="Cost (RWF)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <FineEditDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        shift={editingShift}
        onSave={handleSaveFine}
      />
    </div>
  );
}
