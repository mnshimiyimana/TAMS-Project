"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  PackageIcon,
  Search,
  FileDown,
  X,
  Calendar,
  RefreshCw,
  Shield,
} from "lucide-react";
import {
  fetchPackages,
  fetchPackageStats,
  setSearchQuery,
  setFilter,
  setDateRangeFilter,
  clearFilters,
  Package,
} from "@/redux/slices/packagesSlice";
import { exportToExcel } from "@/utils/excelExport";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import PackagesTable from "../Tables/Packages";
import AddPackage from "../AddPackage";
import ViewPackage from "./ViewPackage";
// import PackageDashboard from "./PackageDashboard";

export default function Packages() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    packages,
    filteredPackages,
    status,
    searchQuery,
    filters,
    currentPage,
  } = useSelector((state: RootState) => state.packages);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState("packages");
  const [isExporting, setIsExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [receiverIdFilter, setReceiverIdFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPackagesWithFilters = async () => {
    try {
      setIsRefreshing(true);
      await dispatch(
        fetchPackages({
          page: currentPage,
          search: searchQuery,
          status: filters.status,
          driverName: filters.driverName,
          plateNumber: filters.plateNumber,
          receiverId: filters.receiverId,
          dateFrom: filters.dateRange.from,
          dateTo: filters.dateRange.to,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to refresh packages");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackagesWithFilters();
    dispatch(fetchPackageStats({}));
  }, []);

  useEffect(() => {
    fetchPackagesWithFilters();
  }, [
    currentPage,
    searchQuery,
    filters.status,
    filters.driverName,
    filters.plateNumber,
    filters.receiverId,
    filters.dateRange.from,
    filters.dateRange.to,
  ]);

  const handleAddPackage = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewPackage = (packageItem: Package) => {
    setSelectedPackage(packageItem);
    setIsViewDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedPackage(null);
  };

  const handlePackageUpdated = async () => {
    await fetchPackagesWithFilters();

    await dispatch(fetchPackageStats({}));

    toast.success("Package data refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleReceiverIdFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setReceiverIdFilter(e.target.value);
  };

  const applyReceiverIdFilter = () => {
    if (receiverIdFilter.trim()) {
      dispatch(
        setFilter({
          key: "receiverId",
          value: receiverIdFilter.trim(),
        })
      );
    }
  };

  const handleDateRangeChange = () => {
    if (dateFrom || dateTo) {
      dispatch(
        setDateRangeFilter({
          from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : null,
          to: dateTo ? format(dateTo, "yyyy-MM-dd") : null,
        })
      );
    }
    setIsCalendarOpen(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setDateFrom(undefined);
    setDateTo(undefined);
    setReceiverIdFilter("");
  };

  const refreshData = async () => {
    await fetchPackagesWithFilters();
    await dispatch(fetchPackageStats({}));
    toast.success("Package data refreshed");
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);

      if (packages.length === 0) {
        toast.warning("No packages to export");
        return;
      }

      const columns = [
        { header: "Package ID", key: "packageId", width: 15 },
        { header: "Description", key: "description", width: 30 },
        { header: "Weight (kg)", key: "weight", width: 15 },
        { header: "Sender", key: "senderName", width: 20 },
        { header: "Sender Phone", key: "senderPhone", width: 15 },
        { header: "Receiver", key: "receiverName", width: 20 },
        { header: "Receiver Phone", key: "receiverPhone", width: 15 },
        { header: "Receiver ID", key: "receiverId", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Driver", key: "driverName", width: 20 },
        { header: "Vehicle", key: "plateNumber", width: 15 },
        { header: "Pickup", key: "pickupLocation", width: 20 },
        { header: "Delivery", key: "deliveryLocation", width: 20 },
        { header: "Created", key: "createdAt", width: 20 },
        { header: "Delivered", key: "deliveredAt", width: 20 },
      ];

      const processedData = packages.map((pkg) => ({
        ...pkg,
        createdAt: pkg.createdAt
          ? new Date(pkg.createdAt).toLocaleString()
          : "N/A",
        deliveredAt: pkg.deliveredAt
          ? new Date(pkg.deliveredAt).toLocaleString()
          : "N/A",
      }));

      exportToExcel(
        processedData,
        columns,
        `Packages_Export_${new Date().toISOString().split("T")[0]}`
      );

      toast.success(`${processedData.length} packages exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export packages");
    } finally {
      setIsExporting(false);
    }
  };

  const activeFilterCount = Object.values(filters).filter(
    (val) => val !== null && (typeof val === "string" || val.from || val.to)
  ).length;

  console.log("Current filters:", {
    search: searchQuery,
    status: filters.status,
    driverName: filters.driverName,
    receiverId: filters.receiverId,
    dateRange: filters.dateRange,
    activeFilterCount,
  });

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold">Package Management</h1>
        <p className="text-gray-700 text-sm">
          Track and manage packages across your transport operations
        </p>
      </div>

      <div className="flex justify-between py-4">
        <div className="flex gap-6 font-medium border-b border-gray-300 pb-2">
          <p
            className={`relative cursor-pointer ${
              activeTab === "packages" ? "text-green-500" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("packages")}
          >
            {activeTab === "packages" && (
              <span className="absolute left-0 w-full h-1 bg-green-500 bottom-[-9px]" />
            )}
          </p>

          {/* <p
            className={`relative cursor-pointer ${
              activeTab === "dashboard" ? "text-green-500" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Overview
            {activeTab === "dashboard" && (
              <span className="absolute left-0 w-full h-1 bg-green-500 bottom-[-9px]" />
            )}
          </p> */}
        </div>
        <div className="flex gap-4">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleAddPackage}
          >
            <PackageIcon className="w-4 h-4 mr-2" /> Add Package
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleExportToExcel}
            disabled={isExporting || packages.length === 0}
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      {activeTab === "packages" && (
        <>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search packages..."
                className="border-none focus:ring-0 focus:outline-none w-full"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  dispatch(
                    setFilter({
                      key: "status",
                      value: value === "all" ? null : value,
                    })
                  )
                }
              >
                <SelectTrigger className="w-[140px] bg-white">
                  <span className="flex items-center">Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.driverName || "all"}
                onValueChange={(value) =>
                  dispatch(
                    setFilter({
                      key: "driverName",
                      value: value === "all" ? null : value,
                    })
                  )
                }
              >
                <SelectTrigger className="w-[140px] bg-white">
                  <span className="flex items-center">Driver</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {Array.from(
                    new Set(packages.map((pkg) => pkg.driverName))
                  ).map((driverName) => (
                    <SelectItem key={driverName} value={driverName}>
                      {driverName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                <div className="pl-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Receiver ID"
                  className="border-none focus:ring-0 focus:outline-none w-32"
                  value={receiverIdFilter}
                  onChange={handleReceiverIdFilterChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyReceiverIdFilter();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={applyReceiverIdFilter}
                >
                  <Search className="w-3 h-3" />
                </Button>
              </div>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-start bg-white"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom || dateTo ? (
                      <>
                        {dateFrom ? format(dateFrom, "PP") : "Start"} -{" "}
                        {dateTo ? format(dateTo, "PP") : "End"}
                      </>
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium">From</div>
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">To</div>
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="default"
                        onClick={handleDateRangeChange}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={refreshData}
                title="Refresh data"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <PackagesTable
            onView={handleViewPackage}
            onUpdated={handlePackageUpdated}
          />
        </>
      )}

      {/* {activeTab === "dashboard" && <PackageDashboard />} */}

      <AddPackage
        open={isAddDialogOpen}
        onClose={handleDialogClose}
        onPackageAdded={handlePackageUpdated}
      />

      <ViewPackage
        open={isViewDialogOpen}
        onClose={handleDialogClose}
        packageData={selectedPackage}
        onPackageUpdated={handlePackageUpdated}
      />
    </div>
  );
}
