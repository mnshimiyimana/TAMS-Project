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
import { setFilter, fetchShifts } from "@/redux/slices/shiftsSlice";

export default function ShiftsDropdowns() {
  const dispatch = useDispatch<AppDispatch>();
  const { shifts, filters } = useSelector((state: RootState) => state.shifts);
  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  const destinations = useMemo(() => {
    return Array.from(new Set(shifts.map((shift) => shift.destination))).sort();
  }, [shifts]);

  const dates = useMemo(() => {
    return Array.from(new Set(shifts.map((shift) => shift.Date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [shifts]);

  const agencies = useMemo(() => {
    if (!isSuperAdmin) return [];
    return Array.from(new Set(shifts.map((shift) => shift.agencyName || "")))
      .filter((agency) => agency !== "") 
      .sort();
  }, [shifts, isSuperAdmin]);

  const handleDestinationChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "destination", value: value === "all" ? null : value })
    );
    dispatch(fetchShifts());
  };

  const handleDateChange = (value: string | null) => {
    dispatch(setFilter({ key: "date", value: value === "all" ? null : value }));
    dispatch(fetchShifts());
  };

  const handleAgencyChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "agencyName", value: value === "all" ? null : value })
    );
    dispatch(fetchShifts());
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

      {/* Destination dropdown */}
      <div className="w-40">
        <Select
          value={filters.destination || ""}
          onValueChange={(value) => handleDestinationChange(value || null)}
        >
          <SelectTrigger className="flex items-center justify-between">
            <span>{filters.destination || "Destination"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            {destinations.map((destination) => (
              <SelectItem key={destination} value={destination}>
                {destination}
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
            <span>{filters.date || "Date"}</span>
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
