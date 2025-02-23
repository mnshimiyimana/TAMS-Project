"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FuelsDropdowns() {
  const [status, setStatus] = useState("");
  const [shift, setShift] = useState("");

  return (
    <div className="flex gap-6">
      {/* Status Dropdown */}
      <div className="w-40">
        <Select onValueChange={(value) => setStatus(value)}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Plate Number</span>
          </SelectTrigger>
          <SelectContent>
            {/* Placeholder - Replace with backend data */}
            <SelectItem value="active">RAD 234 Y</SelectItem>
            <SelectItem value="inactive">RAF 678 T</SelectItem>
            <SelectItem value="pending">RAH 098 H</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Last Shift Dropdown */}
      <div className="w-40">
        <Select onValueChange={(value) => setShift(value)}>
          <SelectTrigger className="flex items-center justify-between">
            <span>Date</span>
          </SelectTrigger>
          <SelectContent>
            {/* Placeholder - Replace with backend data */}
            <SelectItem value="morning">13-04-2024</SelectItem>
            <SelectItem value="afternoon">13-05-2024</SelectItem>
            <SelectItem value="night">13-06-2024</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
