import React, { useState } from "react";
import { Button } from "../ui/button";
import { ArrowDownToLine, Search } from "lucide-react";
import { Input } from "../ui/input";
import AddShiftsDialog from "../AddShift";
import ShiftsDropdowns from "../Dropdowns/Shifts";
import ShiftsTable from "../Tables/Shifts";

export default function Shifts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Shifts</p>
        <h1 className="text-xl font-semibold">Your Shifts Information</h1>
        <p className="text-gray-700 font-medium text-sm">
          Shifts information will help us manage bus operations
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2"></div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={() => setIsDialogOpen(true)} // Open dialog
          >
            + Add Shift
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
        <ShiftsDropdowns />
      </div>

      <div>
        <ShiftsTable />
      </div>

      {/* Add Driver Dialog */}
      <AddShiftsDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
