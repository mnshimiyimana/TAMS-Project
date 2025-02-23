import React, { useState } from "react";
import { Button } from "../ui/button";
import { ArrowDownToLine, Search } from "lucide-react";
import { Input } from "../ui/input";
import FuelsDropdowns from "../Dropdowns/Fuels";
import FuelsTable from "../Tables/Fuels";
import AddFuelDialog from "../AddFuel";

export default function Fuels() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Fuels</p>
        <h1 className="text-xl font-semibold">Your Fuels Information</h1>
        <p className="text-gray-700 font-medium text-sm">
        Your fuels information will help us you budget for your vehicles.
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2"></div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={() => setIsDialogOpen(true)} // Open dialog
          >
            + Add Transaction
          </Button>
          <Button className="bg-[#005F15] hover:bg-[#004A12] text-white">
            <ArrowDownToLine />
            Export File
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search..."
            className="border-none focus:ring-0 focus:outline-none w-full"
          />
        </div>
        <FuelsDropdowns />
      </div>

      <div>
        <FuelsTable />
      </div>

      {/* Add Driver Dialog */}
      <AddFuelDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
