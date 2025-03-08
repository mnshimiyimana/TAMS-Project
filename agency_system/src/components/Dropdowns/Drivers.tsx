"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getDrivers } from "@/services/driverService";

interface DriversDropdownsProps {
  onStatusChange: (status: string) => void;
  onShiftChange?: (shift: string) => void;
  onAgencyChange?: (agency: string) => void;
}

export default function DriversDropdowns({
  onStatusChange,
  onShiftChange,
  onAgencyChange,
}: DriversDropdownsProps) {
  const [status, setStatus] = useState("all");
  const [shift, setShift] = useState("all");
  const [agency, setAgency] = useState("all");
  const [agencies, setAgencies] = useState<string[]>([]);

  // Get user role from redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || "";
  const userAgency = user?.agencyName || "";
  const isSuperAdmin = userRole === "superadmin";

  // Load agencies list for superadmin
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchAgencies = async () => {
        try {
          const response = await getDrivers({ limit: 1000 });
          if (response && response.drivers) {
            // Extract unique agency names
            const uniqueAgencies = [
              ...new Set(
                response.drivers
                  .map((driver) => driver.agencyName)
                  .filter((agency) => agency) // Remove undefined/null
              ),
            ];
            setAgencies(uniqueAgencies as string[]);
          }
        } catch (error) {
          console.error("Failed to load agencies:", error);
        }
      };

      fetchAgencies();
    }
  }, [isSuperAdmin]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    // Only pass the actual status value to the parent component
    // If "all" is selected, pass an empty string to show all statuses
    onStatusChange(value === "all" ? "" : value);
  };

  const handleShiftChange = (value: string) => {
    setShift(value);
    // Only call onShiftChange if it's provided
    if (onShiftChange) {
      // Pass empty string for "all"
      onShiftChange(value === "all" ? "" : value);
    }
  };

  const handleAgencyChange = (value: string) => {
    setAgency(value);
    // Only call onAgencyChange if it's provided
    if (onAgencyChange) {
      // Pass empty string for "all"
      onAgencyChange(value === "all" ? "" : value);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Agency Dropdown (Superadmin only) */}
      {isSuperAdmin && onAgencyChange && (
        <div className="w-48">
          <Select value={agency} onValueChange={handleAgencyChange}>
            <SelectTrigger className="flex items-center justify-between">
              <span>{agency === "all" ? "All Agencies" : agency}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              {agencies.map((agencyName) => (
                <SelectItem key={agencyName} value={agencyName}>
                  {agencyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status Dropdown */}
      <div className="w-40">
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Status</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="On Shift">On Shift</SelectItem>
            <SelectItem value="Off shift">Off Shift</SelectItem>
            <SelectItem value="On leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Last Shift Dropdown */}
      <div className="w-40">
        <Select onValueChange={handleShiftChange} value={shift}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Last Shift</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
