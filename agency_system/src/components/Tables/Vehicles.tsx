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

// Define allowed statuses for stricter TypeScript enforcement
type Status = "Assigned" | "Under Maintenance" | "Available";

const tableHeaders = [
  "Bus ID",
  "Plate Number",
  "Type",
  "Agency Name",
  "Status",
  "Capacity",
  "Bus History",
  "Actions",
];

// Define status styles using a Record type for better TypeScript support
const statusStyles: Record<Status, string> = {
  "Assigned": "bg-[#E9F6F2] text-[#3CD278]",
  "Under Maintenance": "bg-[#FEF5D3] text-[#F7953B]",
  "Available": "bg-[#DEEDFE] text-[#00A651]",
};

// Vehicle data structure
interface Vehicle {
  busId: string;
  plateNumber: string;
  type: string;
  agencyName: string;
  status: Status;
  capacity: number;
  busHistory: string;
}

// Initial vehicle data
const initialVehicles: Vehicle[] = [
  {
    busId: "B001",
    plateNumber: "RAA 123 A",
    type: "Minibus",
    agencyName: "Express Transport",
    status: "Available",
    capacity: 18,
    busHistory: "Serviced last month",
  },
  {
    busId: "B002",
    plateNumber: "RBB 456 B",
    type: "Coach",
    agencyName: "City Lines",
    status: "Assigned",
    capacity: 50,
    busHistory: "In continuous operation",
  },
  {
    busId: "B003",
    plateNumber: "RCC 789 C",
    type: "Shuttle",
    agencyName: "Quick Move",
    status: "Under Maintenance",
    capacity: 12,
    busHistory: "Needs tire replacement",
  },
];

export default function VehiclesTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const handleEdit = (id: string) => console.log("Edit Vehicle:", id);
  const handleDelete = (id: string) =>
    setVehicles((prev) => prev.filter((v) => v.busId !== id));

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
          {vehicles.map(
            ({ busId, plateNumber, type, agencyName, status, capacity, busHistory }) => (
              <TableRow key={busId}>
                <TableCell className="px-5 py-4">{busId}</TableCell>
                <TableCell className="px-5 py-4">{plateNumber}</TableCell>
                <TableCell className="px-5 py-4">{type}</TableCell>
                <TableCell className="px-5 py-4">{agencyName}</TableCell>
                <TableCell className="px-8 py-4">
                  <span
                    className={`${
                      statusStyles[status]
                    } text-sm font-medium rounded-lg px-3 py-1`}
                  >
                    {status}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4">{capacity}</TableCell>
                <TableCell className="px-5 py-4">{busHistory}</TableCell>
                <TableCell className="px-8 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(busId)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(busId)}
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
