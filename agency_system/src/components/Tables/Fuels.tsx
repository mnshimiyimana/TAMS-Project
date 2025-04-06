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
  fetchFuelTransactions,
  deleteFuelTransaction,
  selectFuelTransaction,
  setPage,
  FuelTransaction,
} from "@/redux/slices/fuelsSlice";
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
  "Fuel Date",
  "Quantity (L)",
  "Unit Price/L",
  "Last Fill (L)",
  "Last Fill Price/L",
  "Actions",
];

interface FuelsTableProps {
  onEdit: (transaction: FuelTransaction) => void;
  agencyName: string;
}

export default function FuelsTable({ onEdit, agencyName }: FuelsTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredTransactions, status, error, currentPage, totalCount } =
    useSelector((state: RootState) => state.fuels);

  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  const tableHeaders = isSuperAdmin
    ? [...standardHeaders.slice(0, -1), "Agency", "Actions"]
    : standardHeaders;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFuelTransactions());
    }
  }, [dispatch, status, currentPage]);

  const handleEdit = (transaction: FuelTransaction) => {
    dispatch(selectFuelTransaction(transaction._id));
    onEdit(transaction);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await dispatch(deleteFuelTransaction(transactionToDelete)).unwrap();
      toast.success("Fuel transaction deleted successfully");

      dispatch(fetchFuelTransactions());
    } catch (error) {
      toast.error("Failed to delete fuel transaction");
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setPage(currentPage - 1));
      dispatch(fetchFuelTransactions());
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(setPage(currentPage + 1));
      dispatch(fetchFuelTransactions());
    }
  };

  const displayTransactions = filteredTransactions;

  const formatDate = (dateStr: string | Date) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  if (status === "loading" && filteredTransactions.length === 0) {
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
        <Button onClick={() => dispatch(fetchFuelTransactions())}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              fuel transaction from our servers.
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
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  className="text-center py-10"
                >
                  No fuel transactions found.
                </TableCell>
              </TableRow>
            ) : (
              displayTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="px-5 py-4">
                    {transaction.plateNumber}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {transaction.driverName}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {formatDate(transaction.fuelDate)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {transaction.amount} L
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {transaction.amountPrice}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {transaction.lastFill} L
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {transaction.lastFillPrice}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="px-5 py-4">
                      {transaction.agencyName || agencyName}
                    </TableCell>
                  )}
                  <TableCell className="px-8 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(transaction._id)}
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

        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {displayTransactions.length} of {totalCount} fuel
              transactions
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
