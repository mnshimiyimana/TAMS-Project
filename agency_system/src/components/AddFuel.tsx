"use client";



import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";

// Zod validation schema
const fuelSchema = z.object({
  plateNumber: z.string().min(5, "Plate number is required"),
  fuelAmount: z.coerce.number().min(0.1, "Fuel amount must be greater than 0"),
  lastFill: z.string().optional(),
  driverName: z.string().min(3, "Driver name is required"),
  fuelDate: z.date().optional(),
});

type FuelFormData = z.infer<typeof fuelSchema>;

interface AddFuelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFuelDialog({ isOpen, onClose }: AddFuelDialogProps) {
  const [fuelDate, setFuelDate] = useState<Date | undefined>(new Date());
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
  });

  const onSubmit = (data: FuelFormData) => {
    console.log("Fuel Data:", data);
    toast.success("Fuel entry added successfully!");
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div>
        <p className="text-[#005F15] ">Fuel</p>
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fuel Entry</DialogTitle>
          <p>Record Your Fuel Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Plate Number */}
          <div>
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Select {...register("plateNumber")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RAA1234">RAA1234</SelectItem>
                <SelectItem value="RBB5678">RBB5678</SelectItem>
              </SelectContent>
            </Select>
            {errors.plateNumber && (
              <p className="text-red-500 text-sm">
                {errors.plateNumber.message}
              </p>
            )}
          </div>

          {/* Fuel Date */}
          <div>
            <Label>Fuel Date</Label>
            <Calendar
              mode="single"
              selected={fuelDate}
              onSelect={(date) => setFuelDate(date)}
            />
          </div>

          {/* Fuel Amount */}
          <div>
            <Label htmlFor="fuelAmount">Fuel Amount (L)</Label>
            <Input
              id="fuelAmount"
              type="number"
              placeholder="Enter amount"
              {...register("fuelAmount")}
            />
            {errors.fuelAmount && (
              <p className="text-red-500 text-sm">
                {errors.fuelAmount.message}
              </p>
            )}
          </div>

          {/* Last Fill */}
          <div>
            <Label htmlFor="lastFill">Last Fill</Label>
            <Input
              id="lastFill"
              type="text"
              placeholder="Last fill details"
              {...register("lastFill")}
            />
          </div>

          {/* Driver Name */}
          <div>
            <Label htmlFor="driverName">Driver Name</Label>
            <Input
              id="driverName"
              type="text"
              placeholder="Enter driver's name"
              {...register("driverName")}
            />
            {errors.driverName && (
              <p className="text-red-500 text-sm">
                {errors.driverName.message}
              </p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Go Back
            </Button>
            <Button
              className="bg-[#005F15] hover:bg-[#004A12] text-white"
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
