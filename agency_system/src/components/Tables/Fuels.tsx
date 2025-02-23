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
  "Fuel Date",
  "Liters",
  "Price",
  "Last Fill (Liters)",
  "Last Fill Price",
  "Actions",
];

interface Fuel {
  plateNumber: string;
  driverName: string;
  fuelDate: string;
  liters: number;
  price: number;
  lastFillLiters: number;
  lastFillPrice: number;
}

const initialFuels: Fuel[] = [
  {
    plateNumber: "RAB 123X",
    driverName: "John Doe",
    fuelDate: "2024-02-20T08:30:00",
    liters: 50,
    price: 50000,
    lastFillLiters: 40,
    lastFillPrice: 40000,
  },
  {
    plateNumber: "RAC 456Y",
    driverName: "Jane Smith",
    fuelDate: "2024-02-21T12:15:00",
    liters: 60,
    price: 60000,
    lastFillLiters: 55,
    lastFillPrice: 55000,
  },
  {
    plateNumber: "RAC 489 W",
    driverName: "John Henry",
    fuelDate: "2024-02-21T12:15:00",
    liters: 70,
    price: 70000,
    lastFillLiters: 65,
    lastFillPrice: 65000,
  },
];

export default function FuelsTable() {
  const [fuels, setFuels] = useState<Fuel[]>(initialFuels);

  const handleEdit = (plateNumber: string) => console.log("Edit Fuel Record:", plateNumber);
  const handleDelete = (plateNumber: string) =>
    setFuels((prev) => prev.filter((f) => f.plateNumber !== plateNumber));

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
          {fuels.map(({ plateNumber, driverName, fuelDate, liters, price, lastFillLiters, lastFillPrice }) => (
            <TableRow key={plateNumber}>
              <TableCell className="px-5 py-4">{plateNumber}</TableCell>
              <TableCell className="px-5 py-4">{driverName}</TableCell>
              <TableCell className="px-5 py-4">{new Date(fuelDate).toLocaleString()}</TableCell>
              <TableCell className="px-5 py-4">{liters} L</TableCell>
              <TableCell className="px-5 py-4">{price} RWF</TableCell>
              <TableCell className="px-5 py-4">{lastFillLiters} L</TableCell>
              <TableCell className="px-5 py-4">{lastFillPrice} RWF</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
