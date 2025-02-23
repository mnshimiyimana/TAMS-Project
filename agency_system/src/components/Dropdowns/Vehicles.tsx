"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VehiclesDropdowns() {
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
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="Under Maintenance">Available</SelectItem>
            <SelectItem value="Available">Under Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Last Shift Dropdown */}
      <div className="w-40">
        <Select onValueChange={(value) => setShift(value)}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Capacity</span>
          </SelectTrigger>
          <SelectContent>
            {/* Placeholder - Replace with backend data */}
            <SelectItem value="morning">60</SelectItem>
            <SelectItem value="afternoon">35</SelectItem>
            <SelectItem value="night">40</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
