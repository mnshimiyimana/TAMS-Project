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
import { setFilter } from "@/redux/slices/shiftsSlice";

export default function ShiftsDropdowns() {
  const dispatch = useDispatch<AppDispatch>();
  const { shifts, filters } = useSelector((state: RootState) => state.shifts);

  const destinations = useMemo(() => {
    return Array.from(new Set(shifts.map((shift) => shift.destination))).sort();
  }, [shifts]);

  const dates = useMemo(() => {
    return Array.from(new Set(shifts.map((shift) => shift.Date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [shifts]);

  const handleDestinationChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "destination", value: value === "all" ? null : value })
    );
  };

  const handleDateChange = (value: string | null) => {
    dispatch(setFilter({ key: "date", value: value === "all" ? null : value }));
  };

  return (
    <div className="flex gap-6">
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
