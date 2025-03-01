"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { createDriver, updateDriver, Driver } from "@/services/driverService";

const driverSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
  names: z.string().min(1, "Driver name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  status: z.enum(["On leave", "On Shift", "Off shift"], {
    errorMap: () => ({ message: "Status is required" }),
  }),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onDriverUpdated: () => void;
  agencyName: string;
  driverToEdit?: Driver | null;
}

export default function AddDriverDialog({
  open,
  onClose,
  onDriverUpdated,
  agencyName,
  driverToEdit = null,
}: AddDriverDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastShiftDate, setLastShiftDate] = useState<Date | undefined>(
    new Date()
  );

  const isEditing = !!driverToEdit;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      driverId: "",
      names: "",
      email: "",
      phoneNumber: "",
      status: "Off shift",
    },
  });

  useEffect(() => {
    if (driverToEdit) {
      setValue("driverId", driverToEdit.driverId);
      setValue("names", driverToEdit.names);
      setValue("email", driverToEdit.email);
      setValue("phoneNumber", driverToEdit.phoneNumber);
      setValue(
        "status",
        driverToEdit.status as "On leave" | "On Shift" | "Off shift"
      );

      if (driverToEdit.lastShift) {
        setLastShiftDate(new Date(driverToEdit.lastShift));
      }
    }
  }, [driverToEdit, setValue]);

  const onSubmit = async (data: DriverFormData) => {
    try {
      setIsSubmitting(true);

      const driverData = {
        ...data,
        lastShift: lastShiftDate
          ? lastShiftDate.toISOString()
          : new Date().toISOString(),
        agencyName: agencyName,
      };

      if (isEditing && driverToEdit) {
        await updateDriver(driverToEdit._id, driverData);
        toast.success("Driver updated successfully!");
      } else {
        // Create new driver
        await createDriver(driverData);
        toast.success("Driver added successfully!");
      }

      reset();
      setLastShiftDate(new Date());
      onClose();
      onDriverUpdated();
    } catch (err: any) {
      console.error("Error with driver:", err);
      toast.error(
        err?.response?.data?.message ||
          (isEditing ? "Failed to update driver" : "Failed to add driver")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    reset();
    setLastShiftDate(new Date());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-green-500 font-medium">Drivers</h1>
          <DialogTitle>
            {isEditing ? "Edit Driver" : "Add New Driver"}
          </DialogTitle>
          <p>Record Driver Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="driver-id">Driver ID</Label>
            <Input
              id="driver-id"
              {...register("driverId")}
              placeholder="Enter driver ID"
            />
            {errors.driverId && (
              <p className="text-red-500 text-sm">{errors.driverId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="names">Full Name</Label>
            <Input
              id="names"
              {...register("names")}
              placeholder="Enter full name"
            />
            {errors.names && (
              <p className="text-red-500 text-sm">{errors.names.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phoneNumber")}
              placeholder="Enter phone number"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  "status",
                  value as "On leave" | "On Shift" | "Off shift"
                )
              }
              defaultValue={driverToEdit?.status || "Off shift"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On leave">On Leave</SelectItem>
                <SelectItem value="On Shift">On Shift</SelectItem>
                <SelectItem value="Off shift">Off Shift</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastShift">Last Shift Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !lastShiftDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastShiftDate ? (
                    format(lastShiftDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={lastShiftDate}
                  onSelect={setLastShiftDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" type="button" onClick={handleDialogClose}>
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
                ? "Update Driver"
                : "Add Driver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
