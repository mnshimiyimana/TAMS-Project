"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setFilter, fetchFuelTransactions } from "@/redux/slices/fuelsSlice";

export default function FuelsDropdowns() {
  const dispatch = useDispatch<AppDispatch>();
  const { fuelTransactions, filters } = useSelector(
    (state: RootState) => state.fuels
  );

  // Get user role from auth state
  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  // Get unique plate numbers
  const plateNumbers = useMemo(() => {
    return Array.from(
      new Set(fuelTransactions.map((transaction) => transaction.plateNumber))
    ).sort();
  }, [fuelTransactions]);

  // Get unique dates, formatted for display
  const dates = useMemo(() => {
    return Array.from(
      new Set(
        fuelTransactions.map((transaction) => {
          const date = new Date(transaction.fuelDate);
          return date.toISOString().split("T")[0];
        })
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [fuelTransactions]);

  // Get unique agencies (for superadmin)
  const agencies = useMemo(() => {
    if (!isSuperAdmin) return [];
    return Array.from(
      new Set(
        fuelTransactions.map((transaction) => transaction.agencyName || "")
      )
    )
      .filter((agency) => agency !== "") // Filter out empty strings
      .sort();
  }, [fuelTransactions, isSuperAdmin]);

  const handlePlateNumberChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "plateNumber", value: value === "all" ? null : value })
    );
    // Refresh transactions with new filter
    dispatch(fetchFuelTransactions());
  };

  const handleDateChange = (value: string | null) => {
    dispatch(setFilter({ key: "date", value: value === "all" ? null : value }));
    // Refresh transactions with new filter
    dispatch(fetchFuelTransactions());
  };

  const handleAgencyChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "agencyName", value: value === "all" ? null : value })
    );
    // Refresh transactions with new filter
    dispatch(fetchFuelTransactions());
  };

  return (
    <div className="flex gap-6">
      {/* Agency dropdown (superadmin only) */}
      {isSuperAdmin && (
        <div className="w-48">
          <Select
            value={filters.agencyName || ""}
            onValueChange={(value) => handleAgencyChange(value || null)}
          >
            <SelectTrigger className="flex items-center justify-between">
              <span>{filters.agencyName || "All Agencies"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              {agencies.map((agency) => (
                <SelectItem key={agency} value={agency}>
                  {agency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Plate number dropdown */}
      <div className="w-40">
        <Select
          value={filters.plateNumber || ""}
          onValueChange={(value) => handlePlateNumberChange(value || null)}
        >
          <SelectTrigger className="flex items-center justify-between">
            <span>{filters.plateNumber || "Plate Number"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plates</SelectItem>
            {plateNumbers.map((plateNumber) => (
              <SelectItem key={plateNumber} value={plateNumber}>
                {plateNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date dropdown */}
      <div className="w-40">
        <Select
          value={filters.date || ""}
          onValueChange={(value) => handleDateChange(value || null)}
        >
          <SelectTrigger className="flex items-center justify-between">
            <span>
              {filters.date
                ? new Date(filters.date).toLocaleDateString()
                : "Date"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {dates.map((date) => (
              <SelectItem key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
