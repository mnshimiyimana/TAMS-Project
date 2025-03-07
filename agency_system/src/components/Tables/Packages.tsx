"use client";

import React, { useState } from "react";
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
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, updatePackageStatus } from "@/redux/slices/packagesSlice";
import { formatPackageStatus } from "@/services/packageService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PackagesTableProps {
  onView: (packageItem: Package) => void;
  onUpdated: () => void;
}

export default function PackagesTable({
  onView,
  onUpdated,
}: PackagesTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { packages, filteredPackages, status, currentPage, totalPages } =
    useSelector((state: RootState) => state.packages);

  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});

  const handleQuickStatusUpdate = async (
    packageId: string,
    newStatus: string
  ) => {
    if (isUpdating[packageId]) return;

    setIsUpdating((prev) => ({ ...prev, [packageId]: true }));
    try {
      await dispatch(
        updatePackageStatus({
          id: packageId,
          status: newStatus,
          notes: `Quick status update to ${newStatus}`,
        })
      ).unwrap();

      toast.success(`Status updated to ${newStatus}`);
      onUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [packageId]: false }));
    }
  };

  const renderPackageRows = () => {
    if (status === "loading") {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <TableRow key={`skeleton-${index}`}>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-[90px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-[40px]" />
            </TableCell>
          </TableRow>
        ));
    }

    if (filteredPackages.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-6 text-gray-500">
            No packages found
          </TableCell>
        </TableRow>
      );
    }

    return filteredPackages.map((pkg) => {
      const statusInfo = formatPackageStatus(pkg.status);
      return (
        <TableRow key={pkg._id}>
          <TableCell className="font-medium">{pkg.packageId}</TableCell>
          <TableCell className="max-w-[200px] truncate">
            {pkg.description}
          </TableCell>
          <TableCell>{pkg.weight} kg</TableCell>
          <TableCell>
            <div>
              <p className="font-medium">{pkg.senderName}</p>
              <p className="text-xs text-gray-500">{pkg.senderPhone}</p>
            </div>
          </TableCell>
          <TableCell>
            <div>
              <p className="font-medium">{pkg.receiverName}</p>
              <p className="text-xs text-gray-500">{pkg.receiverPhone}</p>
            </div>
          </TableCell>
          <TableCell>
            <div>
              <p className="text-sm">{pkg.driverName || "Not assigned"}</p>
              <p className="text-xs text-gray-500">
                {pkg.plateNumber || "No vehicle"}
              </p>
            </div>
          </TableCell>
          <TableCell>
            <Badge
              className={`${statusInfo.badgeColor} ${statusInfo.textColor}`}
            >
              {statusInfo.label}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(pkg)}
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onView(pkg)}
                    className="cursor-pointer"
                  >
                    View Details
                  </DropdownMenuItem>
                  {pkg.status !== "In Transit" && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleQuickStatusUpdate(pkg._id, "In Transit")
                      }
                      className="cursor-pointer"
                      disabled={isUpdating[pkg._id]}
                    >
                      Mark as In Transit
                    </DropdownMenuItem>
                  )}
                  {pkg.status !== "Delivered" && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleQuickStatusUpdate(pkg._id, "Delivered")
                      }
                      className="cursor-pointer"
                      disabled={isUpdating[pkg._id]}
                    >
                      Mark as Delivered
                    </DropdownMenuItem>
                  )}
                  {pkg.status !== "Cancelled" && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleQuickStatusUpdate(pkg._id, "Cancelled")
                      }
                      className="cursor-pointer text-red-500"
                      disabled={isUpdating[pkg._id]}
                    >
                      Mark as Cancelled
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="rounded-md border overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[120px]">Package ID</TableHead>
            <TableHead className="w-[160px]">Description</TableHead>
            <TableHead className="w-[80px]">Weight</TableHead>
            <TableHead className="w-[180px]">Sender</TableHead>
            <TableHead className="w-[180px]">Receiver</TableHead>
            <TableHead className="w-[180px]">Driver / Vehicle</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderPackageRows()}</TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
