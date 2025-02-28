"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

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
import { updateVehicle, Status, Vehicle } from "../redux/slices/vehiclesSlice";
import { RootState, AppDispatch } from "../redux/store";

// Zod validation schema
const vehicleSchema = z.object({
  busId: z.string().min(1, "Bus ID is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  type: z.string().min(1, "Vehicle type is required"),
  agencyName: z.string().min(1, "Agency name is required"),
  status: z.enum(
    [
      "Active",
      "Inactive",
      "Maintenance",
      "Assigned",
      "Available",
      "Under Maintenance",
    ],
    {
      errorMap: () => ({ message: "Status is required" }),
    }
  ),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  busHistory: z.string().min(1, "Bus history is required"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface EditVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export default function EditVehicleDialog({
  open,
  onClose,
  vehicle,
}: EditVehicleDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.vehicles);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      busId: vehicle.busId,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      agencyName: vehicle.agencyName,
      status: vehicle.status as Status,
      capacity: vehicle.capacity,
      busHistory: Array.isArray(vehicle.busHistory)
        ? vehicle.busHistory.join(", ")
        : vehicle.busHistory,
    },
  });

  // Reset the form when the vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      setValue("busId", vehicle.busId);
      setValue("plateNumber", vehicle.plateNumber);
      setValue("type", vehicle.type);
      setValue("agencyName", vehicle.agencyName);
      setValue("status", vehicle.status as Status);
      setValue("capacity", vehicle.capacity);
      setValue(
        "busHistory",
        Array.isArray(vehicle.busHistory)
          ? vehicle.busHistory.join(", ")
          : vehicle.busHistory
      );
    }
  }, [vehicle, setValue]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      // Map form status to backend status if needed
      const mappedStatus =
        data.status === "Active"
          ? "Available"
          : data.status === "Inactive"
          ? "Under Maintenance"
          : data.status === "Maintenance"
          ? "Under Maintenance"
          : data.status;

      const vehicleData = {
        ...data,
        status: mappedStatus as Status,
      };

      await dispatch(
        updateVehicle({
          id: vehicle._id || "",
          vehicleData,
        })
      ).unwrap();

      toast.success("Vehicle updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to update vehicle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-green-500 font-medium">Vehicles</h1>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <p>Update Vehicle Details</p>
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
              onValueChange={(value) => setValue("status", value as Status)}
              defaultValue={vehicle.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
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
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#005F15] hover:bg-[#004A12] text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Vehicle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
