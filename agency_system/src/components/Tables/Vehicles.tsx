"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
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
import {
  fetchVehicles,
  deleteVehicle,
  selectVehicle,
  setPage,
  Vehicle,
} from "@/redux/slices/vehiclesSlice";
import { toast } from "sonner";
import PaginationComponent from "@/components/common/Pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


type Status = "Available" | "Assigned" | "Under Maintenance";

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

const statusStyles: Record<Status, string> = {
  Available: "bg-[#DEEDFE] text-[#00A651]",
  Assigned: "bg-[#E9F6F2] text-[#3CD278]",
  "Under Maintenance": "bg-[#FEF5D3] text-[#F7953B]",
};

interface VehiclesTableProps {
  onEdit: (id: string) => void;
}

export default function VehiclesTable({ onEdit }: VehiclesTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredVehicles, status, error, currentPage, totalCount } =
    useSelector((state: RootState) => state.vehicles);

  const pageSize = 5;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVehicles());
    }
  }, [dispatch, status]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    vehicleId: string | null;
  }>({
    open: false,
    vehicleId: null,
  });

  const confirmDelete = async () => {
    if (!deleteDialog.vehicleId) return;

    try {
      await dispatch(deleteVehicle(deleteDialog.vehicleId)).unwrap();
      toast.success("Vehicle deleted successfully!");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to delete vehicle."
      );
    } finally {
      setDeleteDialog({ open: false, vehicleId: null });
    }
  };

  const handleEdit = (id: string) => {
    dispatch(selectVehicle(id));
    onEdit(id);
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  if (status === "loading" && filteredVehicles.length === 0) {
    return (
      <div className="w-full py-6 bg-white rounded-lg text-center">
        Loading vehicles...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full py-6 bg-white rounded-lg text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (filteredVehicles.length === 0) {
    return (
      <div className="w-full py-6 bg-white rounded-lg text-center">
        No vehicles found.
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={() => setDeleteDialog({ open: false, vehicleId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this vehicle? This action cannot
              be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, vehicleId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicles Table */}
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
            {filteredVehicles
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((vehicle) => (
                <TableRow key={vehicle._id}>
                  <TableCell className="px-5 py-4">{vehicle.busId}</TableCell>
                  <TableCell className="px-5 py-4">
                    {vehicle.plateNumber}
                  </TableCell>
                  <TableCell className="px-5 py-4">{vehicle.type}</TableCell>
                  <TableCell className="px-5 py-4">
                    {vehicle.agencyName}
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-lg ${
                        statusStyles[vehicle.status as Status]
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {vehicle.capacity}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {typeof vehicle.busHistory === "string"
                      ? vehicle.busHistory
                      : vehicle.busHistory.join(", ")}
                  </TableCell>
                  <TableCell className="px-8 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleEdit(vehicle._id)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              vehicleId: vehicle._id,
                            })
                          }
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

        <PaginationComponent
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
