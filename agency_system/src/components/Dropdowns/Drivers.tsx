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
}

export default function DriversDropdowns({
  onStatusChange,
}: DriversDropdownsProps) {
  const [status, setStatus] = useState("all");
  const [shift, setShift] = useState("all");

  const handleStatusChange = (value: string) => {
    setStatus(value);
    // Only pass the actual status value to the parent component
    // If "all" is selected, pass an empty string to show all statuses
    onStatusChange(value === "all" ? "" : value);
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
        <Select onValueChange={(value) => setShift(value)} value={shift}>
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