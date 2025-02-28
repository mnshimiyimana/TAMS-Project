// src/components/dashboard/Vehicles.tsx
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
} from "@/redux/slices/vehiclesSlice";
import { Button } from "../ui/button";
import { ArrowDownToLine, Search, X } from "lucide-react";
import { Input } from "../ui/input";

export default function Vehicles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, status } = useSelector(
    (state: RootState) => state.vehicles
  );

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleEdit = (id: string) => {
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    // Logic for exporting data to CSV
    alert("Export functionality to be implemented");
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
          >
            <ArrowDownToLine />
            Export File
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
          {(searchQuery ||
            useSelector(
              (state: RootState) =>
                state.vehicles.filters.status || state.vehicles.filters.capacity
            )) && (
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
        <VehiclesTable onEdit={handleEdit} />
      </div>

      <AddVehiclesDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
