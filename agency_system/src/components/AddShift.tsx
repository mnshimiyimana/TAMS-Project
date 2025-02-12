"use client";


import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// Zod validation schema for the Add Shift form
const shiftSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  driverName: z.string().min(1, "Driver's name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  destination: z.string().min(1, "Destination is required"),
  origin: z.string().min(1, "Origin is required"),
});

type ShiftFormData = z.infer<typeof shiftSchema>;

interface AddShiftDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddShiftDialog({ open, onClose }: AddShiftDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
  });

  const onSubmit = (data: ShiftFormData) => {
    console.log("Shift Data:", data);
    toast.success("Shift added successfully!");
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div>
        <p className="text-[#005F15] ">Shifts</p>
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Shift</DialogTitle>
          <p>Record Your Shift Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Plate Number */}
          <div>
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Input
              id="plateNumber"
              type="text"
              placeholder="Enter plate number"
              {...register("plateNumber")}
            />
            {errors.plateNumber && (
              <p className="text-red-500 text-sm">
                {errors.plateNumber.message}
              </p>
            )}
          </div>

          {/* Driver's Name */}
          <div>
            <Label htmlFor="driverName">Driver's Name</Label>
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

          {/* Start Time */}
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register("startTime")}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm">{errors.startTime.message}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register("endTime")}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm">{errors.endTime.message}</p>
            )}
          </div>

          {/* Destination */}
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              type="text"
              placeholder="Enter destination"
              {...register("destination")}
            />
            {errors.destination && (
              <p className="text-red-500 text-sm">
                {errors.destination.message}
              </p>
            )}
          </div>

          {/* Origin */}
          <div>
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              type="text"
              placeholder="Enter origin"
              {...register("origin")}
            />
            {errors.origin && (
              <p className="text-red-500 text-sm">{errors.origin.message}</p>
            )}
          </div>

          {/* Buttons */}
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
