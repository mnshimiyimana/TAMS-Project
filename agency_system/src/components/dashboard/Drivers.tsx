import React, { useState } from "react";
import { Button } from "../ui/button";
import { ArrowDownToLine, Search } from "lucide-react";
import { Input } from "../ui/input";
import DriversDropdowns from "../Dropdowns/Drivers";
import DriversTable from "../Tables/Drivers";
import AddDriverDialog from "../AddDriver";

export default function Drivers() {
  const [activeTab, setActiveTab] = useState("enrolled");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog

  return (
    <div>
      <div>
        <p className="font-medium text-green-500">Drivers</p>
        <h1 className="text-xl font-semibold">Your Drivers Information</h1>
        <p className="text-gray-700 font-medium text-sm">
          Your drivers' information will help us know their statuses.
        </p>
      </div>

      <div className="flex justify-between py-8">
        <div className="flex gap-10 font-medium border-b-2 border-gray-300 pb-2">
          {/* Enrolled Drivers */}
          <p
            className={`relative cursor-pointer ${
              activeTab === "enrolled" ? "text-green-500" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("enrolled")}
          >
            Enrolled Drivers
            {activeTab === "enrolled" && (
              <span className="absolute left-0 w-full h-1 bg-green-500 bottom-[-10px]" />
            )}
          </p>

          {/* Scheduled Drivers */}
          <p
            className={`relative cursor-pointer ${
              activeTab === "scheduled" ? "text-green-500" : "text-gray-700"
            }`}
            onClick={() => setActiveTab("scheduled")}
          >
            Scheduled Drivers
            {activeTab === "scheduled" && (
              <span className="absolute left-0 w-full h-1 bg-green-500 bottom-[-10px]" />
            )}
          </p>
        </div>
        <div className="flex gap-6">
          <Button
            className="bg-[#005F15] hover:bg-[#004A12] text-white"
            onClick={() => setIsDialogOpen(true)} // Open dialog
          >
            + Add Driver
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
        <DriversDropdowns />
      </div>

      <div>
        <DriversTable />
      </div>

      {/* Add Driver Dialog */}
      <AddDriverDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
