import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import VehiclesDropdowns from "../Dropdowns/Vehicles";
import VehiclesTable from "../Tables/Vehicles";
import AddVehiclesDialog from "../AddVehicle";
import {
  fetchVehicles,
  setSearchQuery,
  clearFilters,
  Vehicle,
} from "@/redux/slices/vehiclesSlice";
import { vehiclesAPI } from "@/services/api";
import { Button } from "../ui/button";
import { FileDown, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { exportToExcel } from "@/utils/excelExport";

export default function Vehicles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, status, filteredVehicles, filters } = useSelector(
    (state: RootState) => state.vehicles
  );

  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || "";
  const isSuperAdmin = userRole === "superadmin";
  const agencyName = user?.agencyName || "";

  const filtersActive = useSelector(
    (state: RootState) =>
      !!state.vehicles.filters.status ||
      !!state.vehicles.filters.capacity ||
      !!state.vehicles.filters.agencyName
  );

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
    // Trigger search after a short delay
    const timer = setTimeout(() => {
      dispatch(fetchVehicles());
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
    dispatch(fetchVehicles());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchVehicles());
  };

  const handleEdit = (id: string) => {
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const handleShiftUpdate = () => {
      // Refresh vehicles data when shifts are updated
      dispatch(fetchVehicles());
    };

    // Listen for the shift updated event
    window.addEventListener("shift_updated", handleShiftUpdate);

    return () => {
      window.removeEventListener("shift_updated", handleShiftUpdate);
    };
  }, [dispatch]);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let vehiclesToExport: Vehicle[] = [];

      // Use the API to get vehicles with filters applied
      try {
        const params: any = {};

        // Apply all current filters
        if (filters.status) params.status = filters.status;
        if (searchQuery) params.search = searchQuery;

        // Apply agency filter based on role
        if (!isSuperAdmin) {
          params.agencyName = agencyName;
        } else if (filters.agencyName) {
          params.agencyName = filters.agencyName;
        }

        const response = await vehiclesAPI.getAllVehicles(params);
        vehiclesToExport = response.buses || response;
      } catch (error) {
        console.error("Error fetching vehicles for export:", error);
        // Fallback to current filtered data if API call fails
        vehiclesToExport = [...filteredVehicles];
      }

      if (vehiclesToExport.length === 0) {
        toast.warning("No data to export");
        return;
      }

      const columns = [
        { header: "Bus ID", key: "busId", width: 15 },
        { header: "Plate Number", key: "plateNumber", width: 20 },
        { header: "Type", key: "type", width: 15 },
        { header: "Agency Name", key: "agencyName", width: 25 },
        { header: "Status", key: "status", width: 20 },
        { header: "Capacity", key: "capacity", width: 10 },
        { header: "Bus History", key: "busHistory", width: 40 },
      ];

      const processedData = vehiclesToExport.map((vehicle) => ({
        ...vehicle,
        busHistory:
          typeof vehicle.busHistory === "string"
            ? vehicle.busHistory
            : vehicle.busHistory.join(", "),
      }));

      let filename = `Vehicles_Export_${
        new Date().toISOString().split("T")[0]
      }`;

      if (filters.agencyName) {
        filename += `_Agency-${filters.agencyName}`;
      }

      if (filters.status) {
        filename += `_Status-${filters.status}`;
      }

      if (filters.capacity) {
        filename += `_Capacity-${filters.capacity}`;
      }

      if (searchQuery) {
        filename += `_Search-Results`;
      }

      exportToExcel(processedData, columns, filename);

      toast.success(`${processedData.length} vehicles exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export vehicles");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Vehicles</p>
        <h1 className="text-xl font-semibold">Your Vehicles Information</h1>
        <p className="text-gray-700 font-medium text-sm">
          Your vehicles information will help us to know the statuses of
          vehicles.
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2"></div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            + Add Vehicle
          </Button>
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-2" />
                Export File
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white relative">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search vehicles..."
            className="border-none focus:ring-0 focus:outline-none w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <VehiclesDropdowns />
          {(searchQuery || filtersActive) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div>
        <VehiclesTable onEdit={handleEdit} agencyName={agencyName} />
      </div>

      <AddVehiclesDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        agencyName={agencyName}
      />
    </div>
  );
}
