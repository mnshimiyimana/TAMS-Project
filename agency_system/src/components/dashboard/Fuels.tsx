"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Button } from "../ui/button";
import { FileDown, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import {
  setSearchQuery,
  clearFilters,
  fetchFuelTransactions,
} from "@/redux/slices/fuelsSlice";
import AddFuelDialog from "../AddFuel";
import FuelsDropdowns from "../Dropdowns/Fuels";
import FuelsTable from "../Tables/Fuels";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Fuels() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, filteredTransactions, status, filters } = useSelector(
    (state: RootState) => state.fuels
  );

  const user = useSelector((state: RootState) => state.auth.user);
  const agencyName = user?.agencyName || "";

  const filtersActive = !!filters.plateNumber || !!filters.date;

  useEffect(() => {
    dispatch(fetchFuelTransactions());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleAddTransaction = () => {
    setTransactionToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setTransactionToEdit(transaction);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTransactionToEdit(null);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (filteredTransactions.length === 0) {
        toast.warning("No fuel transactions to export");
        return;
      }

      const columns = [
        { header: "Plate Number", key: "plateNumber", width: 15 },
        { header: "Driver Name", key: "driverName", width: 25 },
        { header: "Fuel Date", key: "fuelDate", width: 20 },
        { header: "Amount (L)", key: "amount", width: 15 },
        { header: "Last Fill (L)", key: "lastFill", width: 15 },
      ];

      const processedData = filteredTransactions.map((transaction) => ({
        plateNumber: transaction.plateNumber,
        driverName: transaction.driverName,
        fuelDate: transaction.fuelDate
          ? new Date(transaction.fuelDate).toLocaleString()
          : "N/A",
        amount: transaction.amount + " L",
        amountPrice: transaction.amountPrice,
        lastFill: transaction.lastFill + " L",
        lastFillPrice: transaction.lastFillPrice,
      }));

      const filename = `Fuel_Transactions_Export_${
        new Date().toISOString().split("T")[0]
      }`;

      const worksheet = XLSX.utils.json_to_sheet(processedData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Fuel Transactions");

      XLSX.writeFile(workbook, `${filename}.xlsx`);

      toast.success(
        `${processedData.length} fuel transactions exported successfully`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        "Failed to export fuel transactions: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Fuels</p>
        <h1 className="text-xl font-semibold">Your Fuels Information</h1>
        <p className="text-gray-700 font-medium text-sm">
          Your fuels information will help you budget for your vehicles.
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2"></div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={handleAddTransaction}
          >
            + Add Transaction
          </Button>
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={handleExport}
            disabled={isExporting || filteredTransactions.length === 0}
          >
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                <FileDown className="w-5 h-5 mr-2" />
                Export File
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white relative">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by plate, driver name..."
            className="border-none focus:ring-0 focus:outline-none w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <FuelsDropdowns />
          {(searchQuery || filtersActive) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div>
        <FuelsTable onEdit={handleEditTransaction} agencyName={agencyName} />
      </div>

      <AddFuelDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fuelToEdit={transactionToEdit}
        agencyName={agencyName}
      />
    </div>
  );
}
