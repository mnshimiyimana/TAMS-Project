"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DriversDropdownsProps {
  onStatusChange: (status: string) => void;
  onShiftChange?: (shift: string) => void; // Make this optional for backward compatibility
}

export default function DriversDropdowns({
  onStatusChange,
  onShiftChange,
}: DriversDropdownsProps) {
  const [status, setStatus] = useState("all");
  const [shift, setShift] = useState("all");

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

  return (
    <div className="flex gap-6">
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