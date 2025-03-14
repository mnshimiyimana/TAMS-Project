"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  fetchShifts,
  deleteShift,
  selectShift,
  setPage,
  Shift,
} from "@/redux/slices/shiftsSlice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const standardHeaders = [
  "Plate Number",
  "Driver Name",
  "Start Time",
  "End Time",
  "Destination",
  "Origin",
  "Date",
  "Actions",
];

interface ShiftsTableProps {
  onEdit: (shift: Shift) => void;
  agencyName: string;
}

export default function ShiftsTable({ onEdit, agencyName }: ShiftsTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredShifts, status, error, currentPage, totalCount } =
    useSelector((state: RootState) => state.shifts);

  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  const tableHeaders = isSuperAdmin
    ? [...standardHeaders.slice(0, -1), "Agency", "Actions"]
    : standardHeaders;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShifts());
    }
  }, [dispatch, status, currentPage]);

  const handleEdit = (shift: Shift) => {
    dispatch(selectShift(shift._id));
    onEdit(shift);
  };

  const handleDeleteClick = (id: string) => {
    setShiftToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;

    try {
      await dispatch(deleteShift(shiftToDelete)).unwrap();
      toast.success("Shift deleted successfully");
      dispatch(fetchShifts());
    } catch (error) {
      toast.error("Failed to delete shift");
    } finally {
      setDeleteDialogOpen(false);
      setShiftToDelete(null);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setPage(currentPage - 1));
      dispatch(fetchShifts());
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(setPage(currentPage + 1));
      dispatch(fetchShifts());
    }
  };

  const getShiftStatus = (shift: Shift): string => {
    const now = new Date();
    const startTime = new Date(shift.startTime);

    // If start time is in the future, it's scheduled
    if (startTime > now) {
      return "Scheduled";
    }

    if (shift.endTime) {
      const endTime = new Date(shift.endTime);
      if (now >= endTime) {
        return "Completed";
      }
    }

    return "In Progress";
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const displayShifts = filteredShifts;

  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              shift from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {status === "loading" && filteredShifts.length === 0 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: tableHeaders.length }).map(
                    (_, cellIndex) => (
                      <TableCell
                        key={`cell-${index}-${cellIndex}`}
                        className="px-5 py-4"
                      >
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  className="text-center py-10"
                >
                  No shifts found.
                </TableCell>
              </TableRow>
            ) : (
              displayShifts.map((shift) => (
                <TableRow key={shift._id}>
                  <TableCell className="px-5 py-4">
                    {shift.plateNumber}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {shift.driverName}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {formatDate(shift.startTime)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {shift.endTime ? formatDate(shift.endTime) : "Ongoing"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {shift.destination}
                  </TableCell>
                  <TableCell className="px-5 py-4">{shift.origin}</TableCell>
                  <TableCell className="px-5 py-4">
                    {shift.Date
                      ? new Date(shift.Date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  {/* Show agency column for superadmins */}
                  {isSuperAdmin && (
                    <TableCell className="px-5 py-4">
                      {shift.agencyName || agencyName}
                    </TableCell>
                  )}
                  <TableCell className="px-8 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-2">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 ${getStatusBadgeClass(
                            getShiftStatus(shift)
                          )}`}
                        >
                          {getShiftStatus(shift)}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(shift)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(shift._id)}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredShifts.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {displayShifts.length} of {totalCount} shifts
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
                Page {currentPage} of {totalPages}
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
