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

  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || "";
  const userAgency = user?.agencyName || "";
  const isSuperAdmin = userRole === "superadmin";

  useEffect(() => {
    if (isSuperAdmin) {
      const fetchAgencies = async () => {
        try {
          const response = await getDrivers({ limit: 1000 });
          if (response && response.drivers) {
            const uniqueAgencies = [
              ...new Set(
                response.drivers
                  .map((driver) => driver.agencyName)
                  .filter((agency) => agency)
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

    onStatusChange(value === "all" ? "" : value);
  };

  const handleShiftChange = (value: string) => {
    setShift(value);
    if (onShiftChange) {
      onShiftChange(value === "all" ? "" : value);
    }
  };

  const handleAgencyChange = (value: string) => {
    setAgency(value);
    if (onAgencyChange) {
      onAgencyChange(value === "all" ? "" : value);
    }
  };

  return (
    <div className="flex gap-6">
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
