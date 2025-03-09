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
import {
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

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
  agencyName: string;
}

export default function VehiclesTable({
  onEdit,
  agencyName,
}: VehiclesTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    filteredVehicles,
    status,
    error,
    currentPage,
    totalCount,
    searchQuery,
  } = useSelector((state: RootState) => state.vehicles);

  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  const pageSize = 5; // This should match the backend pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    vehicleId: string | null;
  }>({
    open: false,
    vehicleId: null,
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVehicles());
    }
  }, [dispatch, status, currentPage, searchQuery]);

  const confirmDelete = async () => {
    if (!deleteDialog.vehicleId) return;

    try {
      await dispatch(deleteVehicle(deleteDialog.vehicleId)).unwrap();
      toast.success("Vehicle deleted successfully!");
      // Refresh data after deletion
      dispatch(fetchVehicles());
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

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setPage(currentPage - 1));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(setPage(currentPage + 1));
    }
  };

  if (status === "loading" && filteredVehicles.length === 0) {
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
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {Array.from({ length: 8 }).map((_, cellIndex) => (
                  <TableCell
                    key={`cell-${index}-${cellIndex}`}
                    className="px-5 py-4"
                  >
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full py-10 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Something went wrong</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={() => dispatch(fetchVehicles())}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
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
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  No vehicles found.
                  {searchQuery ? " Try adjusting your search or filters." : ""}
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle._id}>
                  <TableCell className="px-5 py-4">{vehicle.busId}</TableCell>
                  <TableCell className="px-5 py-4">
                    {vehicle.plateNumber}
                  </TableCell>
                  <TableCell className="px-5 py-4">{vehicle.type}</TableCell>
                  <TableCell className="px-5 py-4">
                    {vehicle.agencyName}
                  </TableCell>
                  <TableCell className="px-5 py-4">
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
              ))
            )}
          </TableBody>
        </Table>

        {filteredVehicles.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {Math.min(filteredVehicles.length, pageSize)} of{" "}
              {totalCount} vehicles
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
