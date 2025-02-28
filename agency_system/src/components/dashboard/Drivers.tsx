"use client"

import React, { useState } from "react";
import { Button } from "../ui/button";
import { FileDown, Search } from "lucide-react";
import { Input } from "../ui/input";
import DriversDropdowns from "../Dropdowns/Drivers";
import DriversTable from "../Tables/Drivers";
import AddDriverDialog from "../AddDriver";
import { exportToExcel } from "@/utils/excelExport";
import { getDrivers } from "@/services/driverService";
import { toast } from "sonner";

export default function Drivers() {
  const [activeTab, setActiveTab] = useState("enrolled");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleDriverUpdated = () => {
    // Trigger a refresh of the drivers list
    setRefreshTrigger(prev => prev + 1);
  };

  

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Fetch all drivers for export (without pagination)
      const response = await getDrivers({
        limit: 1000, // A large number to get all drivers
        search: searchQuery,
        status: statusFilter
      });
      
      if (response.drivers.length === 0) {
        toast.warning("No data to export");
        return;
      }
      
      // Define columns for Excel
      const columns = [
        { header: "Driver ID", key: "driverId", width: 15 },
        { header: "Name", key: "names", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone Number", key: "phoneNumber", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Last Shift", key: "lastShift", width: 20 },
      ];
      
      // Process dates for better Excel formatting
      const processedData = response.drivers.map(driver => ({
        ...driver,
        lastShift: driver.lastShift 
          ? new Date(driver.lastShift).toLocaleDateString() 
          : "N/A"
      }));
      
      // Export to Excel
      exportToExcel(
        processedData,
        columns,
        `Drivers_Export_${new Date().toISOString().split('T')[0]}`
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
          {/* Enrolled Drivers */}
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

          {/* Scheduled Drivers */}
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
        <DriversDropdowns onStatusChange={handleStatusFilterChange} />
      </div>

      <div>
        <DriversTable 
          searchQuery={searchQuery} 
          statusFilter={statusFilter} 
          refreshTrigger={refreshTrigger} 
        />
      </div>

      {/* Add Driver Dialog */}
      <AddDriverDialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onDriverUpdated={handleDriverUpdated}
      />
    </div>
  );
}