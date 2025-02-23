"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// Zod validation schema
const fuelSchema = z.object({
  plateNumber: z.string().min(5, "Plate number is required"),
  driverName: z.string().min(3, "Driver name is required"),
  fuelDate: z.string().min(1, "Fuel date is required"), // Changed to string for input compatibility
  fuelAmount: z.coerce.number().min(0.1, "Fuel amount must be greater than 0"),
  fuelPrice: z.coerce.number().min(0, "Fuel price must be positive"),
  lastFillLiters: z.coerce.number().min(0, "Last fill liters must be positive"),
  lastFillPrice: z.coerce.number().min(0, "Last fill price must be positive"),
});

type FuelFormData = z.infer<typeof fuelSchema>;

interface AddFuelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFuelDialog({ isOpen, onClose }: AddFuelDialogProps) {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-green-500 font-medium">Fuels</h1>
          <DialogTitle>Add New Transaction</DialogTitle>
          <p>Record Your Fuel Transactions</p>
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

          {/* Fuel Date (Now uses input instead of Calendar component) */}
          <div>
            <Label htmlFor="fuelDate">Fuel Date</Label>
            <Input id="fuelDate" type="date" {...register("fuelDate")} />
            {errors.fuelDate && (
              <p className="text-red-500 text-sm">{errors.fuelDate.message}</p>
            )}
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

          {/* Fuel Price */}
          <div>
            <Label htmlFor="fuelPrice">Fuel Price (RWF)</Label>
            <Input
              id="fuelPrice"
              type="number"
              placeholder="Enter price"
              {...register("fuelPrice")}
            />
            {errors.fuelPrice && (
              <p className="text-red-500 text-sm">{errors.fuelPrice.message}</p>
            )}
          </div>

          {/* Last Fill Liters */}
          <div>
            <Label htmlFor="lastFillLiters">Last Fill (Liters)</Label>
            <Input
              id="lastFillLiters"
              type="number"
              placeholder="Enter last fill liters"
              {...register("lastFillLiters")}
            />
            {errors.lastFillLiters && (
              <p className="text-red-500 text-sm">
                {errors.lastFillLiters.message}
              </p>
            )}
          </div>

          {/* Last Fill Price */}
          <div>
            <Label htmlFor="lastFillPrice">Last Fill Price (RWF)</Label>
            <Input
              id="lastFillPrice"
              type="number"
              placeholder="Enter last fill price"
              {...register("lastFillPrice")}
            />
            {errors.lastFillPrice && (
              <p className="text-red-500 text-sm">
                {errors.lastFillPrice.message}
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
