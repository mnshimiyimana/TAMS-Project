"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";



import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// Vehicle Schema Validation
const vehicleSchema = z.object({
  plateNumber: z.string().min(5, "Plate number is too short"),
  type: z.enum(["Bus", "Mini-Bus", "Van"], {
    errorMap: () => ({ message: "Select a valid vehicle type" }),
  }),
  agency: z.string().min(2, "Agency name is required"),
  status: z.enum(["Active", "Inactive", "Under Maintenance"]),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  history: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const onSubmit = (data: VehicleFormData) => {
    console.log("Vehicle Data:", data);
    toast.success("Vehicle added successfully!");
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div>
        <p className="text-[#005F15] ">Vehicle</p>
      </div>
      <DialogTrigger asChild>
        <Button variant="default">Add Vehicle</Button>
        <p>Record Your Vehicle Details</p>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Plate Number</Label>
            <Input {...register("plateNumber")} placeholder="ABC-1234" />
            {errors.plateNumber && (
              <p className="text-red-500 text-sm">
                {errors.plateNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label>Vehicle Type</Label>
            <Select {...register("type")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bus">Bus</SelectItem>
                <SelectItem value="Mini-Bus">Mini-Bus</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label>Agency Name</Label>
            <Input {...register("agency")} placeholder="Agency XYZ" />
            {errors.agency && (
              <p className="text-red-500 text-sm">{errors.agency.message}</p>
            )}
          </div>

          <div>
            <Label>Status</Label>
            <Select {...register("status")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
            <Label>Capacity</Label>
            <Input type="number" {...register("capacity")} placeholder="50" />
            {errors.capacity && (
              <p className="text-red-500 text-sm">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <Label>Bus History</Label>
            <Input
              {...register("history")}
              placeholder="Last serviced on 01/01/2024"
            />
          </div>

          {/* Button Row */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Go Back
            </Button>
            <Button
              type="submit"
              className="bg-[#005F15] hover:bg-[#004A12] text-white"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
