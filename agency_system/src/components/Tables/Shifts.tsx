"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tableHeaders = [
  "Plate Number",
  "Driver Name",
  "Start Time",
  "End Time",
  "Destination",
  "Origin",
  "Date",
  "Actions",
];

// Shift data structure
interface Shift {
  plateNumber: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  destination: string;
  origin: string;
  date: string;
}

// Initial shift data
const initialShifts: Shift[] = [
  {
    plateNumber: "RAB 123X",
    driverName: "John Doe",
    startTime: "2024-02-18T08:00",
    endTime: "2024-02-18T14:00",
    destination: "Kigali",
    origin: "Musanze",
    date: "2024-02-18",
  },
  {
    plateNumber: "RAC 456Y",
    driverName: "Jane Smith",
    startTime: "2024-02-18T10:00",
    endTime: "2024-02-18T16:00",
    destination: "Huye",
    origin: "Kigali",
    date: "2024-02-18",
  },
];

export default function ShiftsTable() {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);

  const handleEdit = (plateNumber: string) => console.log("Edit Shift:", plateNumber);
  const handleDelete = (plateNumber: string) =>
    setShifts((prev) => prev.filter((s) => s.plateNumber !== plateNumber));

  return (
    <div className="w-full py-6 bg-white rounded-lg overflow-x-auto">
      <Table className="table-auto w-full">
        <TableHeader>
          <TableRow className="bg-gray-100">
            {tableHeaders.map((header) => (
              <TableHead key={header} className="px-5 py-3 text-left">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map(
            ({ plateNumber, driverName, startTime, endTime, destination, origin, date }) => (
              <TableRow key={plateNumber}>
                <TableCell className="px-5 py-4">{plateNumber}</TableCell>
                <TableCell className="px-5 py-4">{driverName}</TableCell>
                <TableCell className="px-5 py-4">{new Date(startTime).toLocaleString()}</TableCell>
                <TableCell className="px-5 py-4">{endTime ? new Date(endTime).toLocaleString() : "Ongoing"}</TableCell>
                <TableCell className="px-5 py-4">{destination}</TableCell>
                <TableCell className="px-5 py-4">{origin}</TableCell>
                <TableCell className="px-5 py-4">{date}</TableCell>
                <TableCell className="px-8 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(plateNumber)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(plateNumber)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
