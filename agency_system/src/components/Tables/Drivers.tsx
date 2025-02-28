"use client";

import { useState, useEffect } from "react";
import {
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
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
import { toast } from "sonner";
import {
  Driver,
  getDrivers,
  deleteDriver,
  DriverParams,
} from "@/services/driverService";
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
import { Skeleton } from "@/components/ui/skeleton";

type Status = "On Shift" | "Off shift" | "On leave";

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
  "On leave": "bg-[#DEEDFE] text-[#00A651]",
};

// Default style for statuses not in the record
const defaultStatusStyle = "bg-gray-100 text-gray-600";

interface DriversTableProps {
  searchQuery: string;
  statusFilter: string;
  shiftFilter?: string;
  refreshTrigger: number;
}

export default function DriversTable({
  searchQuery,
  statusFilter,
  shiftFilter,
  refreshTrigger,
}: DriversTableProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: DriverParams = {
        page: currentPage,
        limit: 50,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await getDrivers(params);

      if (response && response.drivers) {
        const fetchedDrivers = response.drivers;
        setDrivers(fetchedDrivers);
        setTotalPages(response.totalPages || 1);
        setTotalDrivers(response.totalDrivers || 0);

        if (shiftFilter) {
          const filtered = applyShiftFilter(fetchedDrivers);
          setFilteredDrivers(filtered);
        } else {
          setFilteredDrivers(fetchedDrivers);
        }
      } else {
        setDrivers([]);
        setFilteredDrivers([]);
        setTotalPages(1);
        setTotalDrivers(0);
        console.warn("Unexpected API response structure:", response);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Failed to load drivers. Please try again.");
      setDrivers([]);
      setFilteredDrivers([]);
      toast.error("Could not load drivers data");
    } finally {
      setIsLoading(false);
    }
  };

  const applyShiftFilter = (driversData: Driver[]) => {
    if (!shiftFilter) {
      return driversData;
    }

    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));
    const lastWeekStart = startOfDay(subWeeks(now, 1));
    const lastMonthStart = startOfDay(subMonths(now, 1));

    return driversData.filter((driver) => {
      if (!driver.lastShift) return false;

      const lastShiftDate = new Date(driver.lastShift);

      switch (shiftFilter) {
        case "today":
          return isWithinInterval(lastShiftDate, {
            start: today,
            end: endOfDay(now),
          });
        case "yesterday":
          return isWithinInterval(lastShiftDate, {
            start: yesterday,
            end: endOfDay(yesterday),
          });
        case "last-week":
          return isWithinInterval(lastShiftDate, {
            start: lastWeekStart,
            end: now,
          });
        case "last-month":
          return isWithinInterval(lastShiftDate, {
            start: lastMonthStart,
            end: now,
          });
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, searchQuery, statusFilter, refreshTrigger]);

  useEffect(() => {
    if (drivers.length > 0) {
      if (shiftFilter) {
        const filtered = applyShiftFilter(drivers);
        setFilteredDrivers(filtered);
      } else {
        setFilteredDrivers(drivers);
      }
    }
  }, [shiftFilter, drivers]);

  const handleEdit = (id: string) => {
    toast.info(`Edit driver functionality coming soon for ID: ${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDriverToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;

    try {
      await deleteDriver(driverToDelete);
      toast.success("Driver deleted successfully");
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to delete driver");
    } finally {
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getStatusStyle = (status: string | undefined): string => {
    if (!status) return defaultStatusStyle;
    return statusStyles[status as Status] || defaultStatusStyle;
  };

  if (error) {
    return (
      <div className="w-full py-10 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Something went wrong</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchDrivers}>Try Again</Button>
      </div>
    );
  }

  const driversToDisplay = filteredDrivers || [];

  return (
    <div className="w-full ">
      <div className="w-full py-6 bg-white rounded-lg overflow-x-auto">
        <Table className="table-auto min-w-full">
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell
                      key={`cell-${index}-${cellIndex}`}
                      className="px-8 py-4"
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : driversToDisplay.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No drivers found.{" "}
                  {searchQuery || statusFilter || shiftFilter
                    ? "Try adjusting your filters."
                    : ""}
                </TableCell>
              </TableRow>
            ) : (
              driversToDisplay.map((driver) => {
                const {
                  _id = "",
                  driverId = "",
                  names = "",
                  email = "",
                  phoneNumber = "",
                  status = "",
                  lastShift = null,
                } = driver || {};

                return (
                  <TableRow key={_id}>
                    <TableCell className="px-6 py-4">{driverId}</TableCell>
                    <TableCell className="px-8 py-4">{names}</TableCell>
                    <TableCell className="px-6 py-4">{email}</TableCell>
                    <TableCell className="px-6 py-4">{phoneNumber}</TableCell>
                    <TableCell className="px-8 py-4">
                      <span
                        className={`${getStatusStyle(
                          status
                        )} text-sm font-medium rounded-lg px-3 py-1`}
                      >
                        {status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {lastShift
                        ? format(new Date(lastShift), "yyyy-MM-dd")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-8 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEdit(_id)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(_id)}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!isLoading && driversToDisplay.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {driversToDisplay.length} of {totalDrivers} drivers
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              driver from our servers.
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
    </div>
  );
}
