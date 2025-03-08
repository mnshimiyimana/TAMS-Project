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
import { setFilter, fetchVehicles } from "@/redux/slices/vehiclesSlice";

export default function VehiclesDropdowns() {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, filters } = useSelector(
    (state: RootState) => state.vehicles
  );
  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const userAgency = useSelector(
    (state: RootState) => state.auth.user?.agencyName || ""
  );

  // Only superadmins should see the agency filter
  const isSuperAdmin = userRole === "superadmin";

  // Get list of agencies for superadmin
  const agencyOptions = useMemo(() => {
    if (!isSuperAdmin) return [];
    return Array.from(
      new Set(vehicles.map((vehicle) => vehicle.agencyName))
    ).sort();
  }, [vehicles, isSuperAdmin]);

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
    // Trigger refetch with updated filters
    dispatch(fetchVehicles());
  };

  const handleCapacityChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "capacity", value: value === "all" ? null : value })
    );
    // Trigger refetch with updated filters
    dispatch(fetchVehicles());
  };

  const handleAgencyChange = (value: string | null) => {
    dispatch(
      setFilter({ key: "agencyName", value: value === "all" ? null : value })
    );
    // Trigger refetch with updated filters
    dispatch(fetchVehicles());
  };

  return (
    <div className="flex gap-6">
      {/* Agency Dropdown (Superadmin only) */}
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
              {agencyOptions.map((agency) => (
                <SelectItem key={agency} value={agency}>
                  {agency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
