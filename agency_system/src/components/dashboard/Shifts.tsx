"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Button } from "../ui/button";
import { FileDown, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import {
  setSearchQuery,
  clearFilters,
  fetchShifts,
} from "@/redux/slices/shiftsSlice";
import AddShiftDialog from "../AddShift";
import ShiftsDropdowns from "../Dropdowns/Shifts";
import ShiftsTable from "../Tables/Shifts";
import { toast } from "sonner";
import { exportToExcel } from "@/utils/excelExport";

export default function Shifts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, filteredShifts, status, filters } = useSelector(
    (state: RootState) => state.shifts
  );

  const user = useSelector((state: RootState) => state.auth.user);
  const agencyName = user?.agencyName || "";

  const filtersActive = !!filters.destination || !!filters.date;

  useEffect(() => {
    dispatch(fetchShifts());
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

  const handleAddShift = () => {
    setShiftToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditShift = (shift: any) => {
    setShiftToEdit(shift);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setShiftToEdit(null);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (filteredShifts.length === 0) {
        toast.warning("No shifts to export");
        return;
      }

      const columns = [
        { header: "Plate Number", key: "plateNumber", width: 15 },
        { header: "Driver Name", key: "driverName", width: 25 },
        { header: "Start Time", key: "startTime", width: 20 },
        { header: "End Time", key: "endTime", width: 20 },
        { header: "Destination", key: "destination", width: 20 },
        { header: "Origin", key: "origin", width: 20 },
        { header: "Date", key: "Date", width: 15 },
      ];

      const processedData = filteredShifts.map((shift) => ({
        ...shift,
        startTime: new Date(shift.startTime).toLocaleString(),
        endTime: shift.endTime
          ? new Date(shift.endTime).toLocaleString()
          : "Ongoing",
      }));

      let filename = `Shifts_Export_${new Date().toISOString().split("T")[0]}`;

      if (filters.destination) {
        filename += `_Destination-${filters.destination}`;
      }

      if (filters.date) {
        filename += `_Date-${filters.date}`;
      }

      if (searchQuery) {
        filename += `_Search-Results`;
      }

      exportToExcel(processedData, columns, filename);

      toast.success(`${processedData.length} shifts exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export shifts");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Shifts</p>
        <h1 className="text-xl font-semibold">Your Shifts Information</h1>
        <p className="text-gray-700 font-medium text-sm">
          Shifts information will help us manage bus operations
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2"></div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={handleAddShift}
          >
            + Add Shift
          </Button>
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={handleExport}
            disabled={isExporting || filteredShifts.length === 0}
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

      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white relative">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by plate, driver, destination..."
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
          <ShiftsDropdowns />
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
        <ShiftsTable onEdit={handleEditShift} agencyName={agencyName} />
      </div>

      <AddShiftDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        shiftToEdit={shiftToEdit}
        agencyName={agencyName}
      />
    </div>
  );
}
