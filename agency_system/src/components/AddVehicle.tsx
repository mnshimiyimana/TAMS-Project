"use client";

import { useEffect, useState } from "react";
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
  fetchVehicles,
} from "@/redux/slices/vehiclesSlice";

const vehicleSchema = z.object({
  busId: z.string().min(1, "Bus ID is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  type: z.string().min(1, "Vehicle type is required"),
  status: z.enum(["Available", "Assigned", "Under Maintenance"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  busHistory: z.string().min(1, "Bus history is required"),
  agencyName: z.string().min(1, "Agency name is required"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  agencyName: string;
}

export default function AddVehiclesDialog({
  open,
  onClose,
  agencyName,
}: AddVehicleDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedVehicle, status } = useSelector(
    (state: RootState) => state.vehicles
  );

  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  const [agencies, setAgencies] = useState<string[]>([]);
  const agencyOptions = useSelector((state: RootState) =>
    Array.from(new Set(state.vehicles.vehicles.map((v) => v.agencyName)))
  );

  const isEditing = !!selectedVehicle;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      busId: "",
      plateNumber: "",
      type: "",
      status: "Available",
      capacity: 0,
      busHistory: "",
      agencyName: agencyName, 
    },
  });

  const currentAgency = watch("agencyName");

  useEffect(() => {
    if (selectedVehicle) {
      setValue("busId", selectedVehicle.busId);
      setValue("plateNumber", selectedVehicle.plateNumber);
      setValue("type", selectedVehicle.type);
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
      setValue("agencyName", selectedVehicle.agencyName);
    } else {
      setValue("agencyName", agencyName);
    }
  }, [selectedVehicle, setValue, agencyName]);

  useEffect(() => {
    if (isSuperAdmin) {
      setAgencies(agencyOptions);
    }
  }, [isSuperAdmin, agencyOptions]);

  const handleClose = () => {
    reset();
    dispatch(clearSelectedVehicle());
    onClose();
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (!isSuperAdmin && data.agencyName !== agencyName) {
        toast.error("You do not have permission to change the agency");
        return;
      }

      const vehicleData = {
        ...data,
        busHistory: data.busHistory.split(",").map((item) => item.trim()),
      };

      if (isEditing && selectedVehicle) {
        await dispatch(
          updateVehicle({
            id: selectedVehicle._id,
            vehicleData: vehicleData,
          })
        ).unwrap();
        toast.success("Vehicle updated successfully!");
      } else {
        await dispatch(addVehicle(vehicleData)).unwrap();
        toast.success("Vehicle added successfully!");
      }

      dispatch(fetchVehicles());
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
            {isSuperAdmin ? (
              <Select
                defaultValue={agencyName}
                onValueChange={(value) => setValue("agencyName", value)}
              >
                <SelectTrigger id="agency-name">
                  <SelectValue placeholder="Select agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="agency-name"
                value={agencyName}
                disabled
                className="bg-gray-100"
                {...register("agencyName")}
              />
            )}
            {errors.agencyName && (
              <p className="text-red-500 text-sm">
                {errors.agencyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={watch("status")}
              onValueChange={(value) =>
                setValue(
                  "status",
                  value as "Available" | "Assigned" | "Under Maintenance"
                )
              }
            >
              <SelectTrigger id="status">
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
              placeholder="Enter bus history (comma separated)"
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
