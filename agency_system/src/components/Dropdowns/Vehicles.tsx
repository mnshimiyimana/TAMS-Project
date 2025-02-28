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
import { setFilter } from "@/redux/slices/vehiclesSlice";

export default function VehiclesDropdowns() {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, filters } = useSelector(
    (state: RootState) => state.vehicles
  );

  // Extract unique status values and sort
  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(vehicles.map((vehicle) => vehicle.status))
    ).sort();
  }, [vehicles]);

  // Extract unique capacity values and sort
  const capacityOptions = useMemo(() => {
    return Array.from(
      new Set(vehicles.map((vehicle) => vehicle.capacity))
    ).sort((a, b) => a - b);
  }, [vehicles]);

  const handleStatusChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "status", value: value === "all" ? null : value })
    );
  };

  const handleCapacityChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "capacity", value: value === "all" ? null : value })
    );
  };

  return (
    <div className="flex gap-6">
      {/* Status Dropdown */}
      <div className="w-40">
        <Select
          value={filters.status || ""}
          onValueChange={(value) => handleStatusChange(value || null)}
        >
          <SelectTrigger className="flex items-center justify-between">
            <span>{filters.status || "Status"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Capacity Dropdown */}
      <div className="w-40">
        <Select
          value={filters.capacity || ""}
          onValueChange={(value) => handleCapacityChange(value || null)}
        >
          <SelectTrigger className="flex items-center justify-between">
            <span>{filters.capacity || "Capacity"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Capacities</SelectItem>
            {capacityOptions.map((capacity) => (
              <SelectItem key={capacity} value={capacity.toString()}>
                {capacity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
