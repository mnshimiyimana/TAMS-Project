"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function DriversDropdowns() {
  const [status, setStatus] = useState("");
  const [shift, setShift] = useState("");

  return (
    <div className="flex gap-6">
      {/* Status Dropdown */}
      <div className="w-40">
        <Select onValueChange={(value) => setStatus(value)}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Status</span>
          </SelectTrigger>
          <SelectContent>
            {/* Placeholder - Replace with backend data */}
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Last Shift Dropdown */}
      <div className="w-40">
        <Select onValueChange={(value) => setShift(value)}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Last Shift</span>
          </SelectTrigger>
          <SelectContent>
            {/* Placeholder - Replace with backend data */}
            <SelectItem value="morning">Morning Shift</SelectItem>
            <SelectItem value="afternoon">Afternoon Shift</SelectItem>
            <SelectItem value="night">Night Shift</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
