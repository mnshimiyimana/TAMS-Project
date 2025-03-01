"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addShift, updateShift, Shift } from "@/redux/slices/shiftsSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const shiftSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  driverName: z.string().min(1, "Driver's name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  destination: z.string().min(1, "Destination is required"),
  origin: z.string().min(1, "Origin is required"),
  Date: z.string().min(1, "Date is required"),
});

type ShiftFormData = z.infer<typeof shiftSchema>;

interface AddShiftDialogProps {
  open: boolean;
  onClose: () => void;
  shiftToEdit?: Shift | null;
  agencyName: string;
}

export default function AddShiftDialog({
  open,
  onClose,
  shiftToEdit = null,
  agencyName,
}: AddShiftDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!shiftToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      plateNumber: "",
      driverName: "",
      startTime: "",
      endTime: "",
      destination: "",
      origin: "",
      Date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (shiftToEdit) {
      setValue("plateNumber", shiftToEdit.plateNumber);
      setValue("driverName", shiftToEdit.driverName);
      setValue(
        "startTime",
        new Date(shiftToEdit.startTime).toISOString().slice(0, 16)
      );

      if (shiftToEdit.endTime) {
        setValue(
          "endTime",
          new Date(shiftToEdit.endTime).toISOString().slice(0, 16)
        );
      }

      setValue("destination", shiftToEdit.destination);
      setValue("origin", shiftToEdit.origin);
      setValue("Date", shiftToEdit.Date);
    }
  }, [shiftToEdit, setValue]);

  const onSubmit = async (data: ShiftFormData) => {
    try {
      setIsSubmitting(true);

      const shiftData = {
        ...data,
        agencyName,
      };

      if (isEditing && shiftToEdit) {
        await dispatch(
          updateShift({
            id: shiftToEdit._id,
            shiftData,
          })
        ).unwrap();
        toast.success("Shift updated successfully!");
      } else {
        await dispatch(addShift(shiftData)).unwrap();
        toast.success("Shift added successfully!");
      }

      reset();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error?.message ||
          (isEditing ? "Failed to update shift" : "Failed to add shift")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-[#005F15] font-medium">Shifts</h1>
          <DialogTitle>
            {isEditing ? "Edit Shift" : "Add New Shift"}
          </DialogTitle>
          <p>Record Your Shift Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("Date")} />
            {errors.Date && (
              <p className="text-red-500 text-sm">{errors.Date.message}</p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#005F15] hover:bg-[#004A12] text-white"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Shift"
                : "Add Shift"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
