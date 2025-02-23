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
type Status = "On Shift" | "Off shift" | "On Leave";

const tableHeaders = [
  "Driver ID",
  "Names",
  "Email",
  "Phone Number",
  "Status",
  "Last Shift",
  "Actions",
];

// Define status styles using a Record type for better TypeScript support
const statusStyles: Record<Status, string> = {
  "On Shift": "bg-[#E9F6F2] text-[#3CD278]",
  "Off shift": "bg-[#FEF5D3] text-[#F7953B]",
  "On Leave": "bg-[#DEEDFE] text-[#00A651]",
};

// Driver data structure
interface Driver {
  driverId: string;
  names: string;
  email: string;
  phoneNumber: string;
  status: Status;
  lastShift: string;
}

// Initial driver data
const initialDrivers: Driver[] = [
  {
    driverId: "D001",
    names: "John Doe",
    email: "johndoe@example.com",
    phoneNumber: "+250 788 123 456",
    status: "On Shift",
    lastShift: "2024-02-18",
  },
  {
    driverId: "D002",
    names: "Jane Smith",
    email: "janesmith@example.com",
    phoneNumber: "+250 788 654 321",
    status: "Off shift",
    lastShift: "2024-02-17",
  },
  {
    driverId: "D003",
    names: "Ndayambaje Jean Marie Vianney",
    email: "jmvndayambaje@example.com",
    phoneNumber: "+250 788 654 321",
    status: "On Leave",
    lastShift: "2024-02-17",
  },
];

export default function DriversTable() {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);

  const handleEdit = (id: string) => console.log("Edit Driver:", id);
  const handleDelete = (id: string) =>
    setDrivers((prev) => prev.filter((d) => d.driverId !== id));

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
          {drivers.map(
            ({ driverId, names, email, phoneNumber, status, lastShift }) => (
              <TableRow key={driverId}>
                <TableCell className="px-5 py-4">{driverId}</TableCell>
                <TableCell className="px-5 py-4">{names}</TableCell>
                <TableCell className="px-5 py-4">{email}</TableCell>
                <TableCell className="px-5 py-4">{phoneNumber}</TableCell>
                <TableCell className="px-8 py-4">
                  <span
                    className={`${
                      statusStyles[status]
                    } text-sm font-medium rounded-lg px-3 py-1`}
                  >
                    {status}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4">{lastShift}</TableCell>
                <TableCell className="px-8 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(driverId)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(driverId)}
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
