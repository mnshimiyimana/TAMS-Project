// src/components/AddVehicle.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  addVehicle,
  updateVehicle,
  clearSelectedVehicle,
  Vehicle,
} from "@/redux/slices/vehiclesSlice";

// Zod validation schema
const vehicleSchema = z.object({
  busId: z.string().min(1, "Bus ID is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  type: z.string().min(1, "Vehicle type is required"),
  agencyName: z.string().min(1, "Agency name is required"),
  status: z.enum(["Available", "Assigned", "Under Maintenance"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  busHistory: z.string().min(1, "Bus history is required"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddVehiclesDialog({
  open,
  onClose,
}: AddVehicleDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedVehicle, status } = useSelector(
    (state: RootState) => state.vehicles
  );
  const isEditing = !!selectedVehicle;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      busId: "",
      plateNumber: "",
      type: "",
      agencyName: "",
      status: "Available",
      capacity: 0,
      busHistory: "",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (selectedVehicle) {
      setValue("busId", selectedVehicle.busId);
      setValue("plateNumber", selectedVehicle.plateNumber);
      setValue("type", selectedVehicle.type);
      setValue("agencyName", selectedVehicle.agencyName);
      setValue(
        "status",
        selectedVehicle.status as "Available" | "Assigned" | "Under Maintenance"
      );
      setValue("capacity", selectedVehicle.capacity);
      setValue(
        "busHistory",
        Array.isArray(selectedVehicle.busHistory)
          ? selectedVehicle.busHistory.join(", ")
          : selectedVehicle.busHistory
      );
    }
  }, [selectedVehicle, setValue]);

  const handleClose = () => {
    reset();
    dispatch(clearSelectedVehicle());
    onClose();
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      // If editing, update the vehicle; otherwise, add a new one
      if (isEditing && selectedVehicle) {
        await dispatch(
          updateVehicle({
            id: selectedVehicle._id,
            vehicleData: data,
          })
        ).unwrap();
        toast.success("Vehicle updated successfully!");
      } else {
        await dispatch(addVehicle(data)).unwrap();
        toast.success("Vehicle added successfully!");
      }
      handleClose();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to save vehicle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-green-500 font-medium">Vehicles</h1>
          <DialogTitle>
            {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <p>Record Vehicle Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="bus-id">Bus ID</Label>
            <Input
              id="bus-id"
              {...register("busId")}
              placeholder="Enter bus ID"
            />
            {errors.busId && (
              <p className="text-red-500 text-sm">{errors.busId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="plate-number">Plate Number</Label>
            <Input
              id="plate-number"
              {...register("plateNumber")}
              placeholder="Enter plate number"
            />
            {errors.plateNumber && (
              <p className="text-red-500 text-sm">
                {errors.plateNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              {...register("type")}
              placeholder="Enter vehicle type"
            />
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="agency-name">Agency Name</Label>
            <Input
              id="agency-name"
              {...register("agencyName")}
              placeholder="Enter agency name"
            />
            {errors.agencyName && (
              <p className="text-red-500 text-sm">
                {errors.agencyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue="Available"
              onValueChange={(value) =>
                setValue(
                  "status",
                  value as "Available" | "Assigned" | "Under Maintenance"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="Under Maintenance">
                  Under Maintenance
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              {...register("capacity")}
              placeholder="Enter capacity"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bus-history">Bus History</Label>
            <Input
              id="bus-history"
              {...register("busHistory")}
              placeholder="Enter bus history"
            />
            {errors.busHistory && (
              <p className="text-red-500 text-sm">
                {errors.busHistory.message}
              </p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" type="button" onClick={handleClose}>
              Go Back
            </Button>
            <Button
              className="bg-[#005F15] hover:bg-[#004A12] text-white"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Saving..."
                : isEditing
                ? "Update"
                : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
