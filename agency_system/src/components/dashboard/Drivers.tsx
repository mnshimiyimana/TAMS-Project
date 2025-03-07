"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { FileDown, Search } from "lucide-react";
import { Input } from "../ui/input";
import DriversDropdowns from "../Dropdowns/Drivers";
import DriversTable from "../Tables/Drivers";
import AddDriverDialog from "../AddDriver";
import DriversTableEnhancer from "../DriversTableEnhancer";
import { exportToExcel } from "@/utils/excelExport";
import { getDrivers, Driver } from "@/services/driverService";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Drivers() {
  const [activeTab, setActiveTab] = useState("enrolled");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const agencyName = user?.agencyName || "";

  useEffect(() => {
    if (activeTab === "scheduled") {
      setStatusFilter("On Shift");
    } else {
      setStatusFilter("");
    }
  }, [activeTab]);

  const handleDriverUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTableRefresh = () => {
    console.log("Refreshing drivers table due to shift changes");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStatusFilterChange = (status: string) => {
    if (activeTab === "enrolled") {
      setStatusFilter(status);
    }
  };

  const handleShiftFilterChange = (shift: string) => {
    setShiftFilter(shift);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (driver: Driver) => {
    setDriverToEdit(driver);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDriverToEdit(null);
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);

      const response = await getDrivers({
        limit: 1000,
        search: searchQuery,
        status: statusFilter,
        ...(shiftFilter && { shift: shiftFilter }),
      });

      if (response.drivers.length === 0) {
        toast.warning("No data to export");
        return;
      }

      const columns = [
        { header: "Driver ID", key: "driverId", width: 15 },
        { header: "Name", key: "names", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone Number", key: "phoneNumber", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Last Shift", key: "lastShift", width: 20 },
      ];

      const processedData = response.drivers.map((driver) => ({
        ...driver,
        lastShift: driver.lastShift
          ? new Date(driver.lastShift).toLocaleDateString()
          : "N/A",
      }));

      exportToExcel(
        processedData,
        columns,
        `Drivers_Export_${new Date().toISOString().split("T")[0]}`
      );

      toast.success("Drivers exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export drivers");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Drivers</p>
        <h1 className="text-xl font-semibold">Your Drivers Information</h1>
        <p className="text-gray-700 font-medium text-sm">
          Your drivers' information will help us know their statuses.
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2">
          <p
            className={`relative cursor-pointer ${
              activeTab === "enrolled" ? "text-green-500" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("enrolled")}
          >
            Enrolled Drivers
            {activeTab === "enrolled" && (
              <span className="absolute left-0 w-full h-1 bg-green-500 bottom-[-10px]" />
            )}
          </p>

          <p
            className={`relative cursor-pointer ${
              activeTab === "scheduled" ? "text-green-500" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("scheduled")}
          >
            Scheduled Drivers
            {activeTab === "scheduled" && (
              <span className="absolute left-0 w-full h-1 bg-green-500 bottom-[-10px]" />
            )}
          </p>
        </div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            + Add Driver
          </Button>
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={handleExportToExcel}
            disabled={isExporting}
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-2" />
                Export File
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by name, email, ID..."
            className="border-none focus:ring-0 focus:outline-none w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        {activeTab === "enrolled" && (
          <DriversDropdowns
            onStatusChange={handleStatusFilterChange}
            onShiftChange={handleShiftFilterChange}
          />
        )}
      </div>

      <div>
        {/* Wrap DriversTable with DriversTableEnhancer to get automatic updates */}
        <DriversTableEnhancer onRefresh={handleTableRefresh}>
          <DriversTable
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            shiftFilter={shiftFilter}
            refreshTrigger={refreshTrigger}
            agencyName={agencyName}
            onEdit={handleEdit}
          />
        </DriversTableEnhancer>
      </div>

      <AddDriverDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onDriverUpdated={handleDriverUpdated}
        agencyName={agencyName}
        driverToEdit={driverToEdit}
      />
    </div>
  );
}
