"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";

// Zod validation schema
const driverSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.string().min(1, "Status is required"),
  lastShift: z.date().optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDriverDialog({
  open,
  onClose,
}: AddDriverDialogProps) {
  const [lastShift, setLastShift] = useState<Date | undefined>(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  const onSubmit = (data: DriverFormData) => {
    console.log("Driver Data:", { ...data, lastShift });
    toast.success("Driver added successfully!");
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-green-500 font-medium">Drivers</h1>
          <DialogTitle>Add New Driver</DialogTitle>
          <p>Record Your Driver Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" {...register("firstName")} placeholder="Enter first name" />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" {...register("lastName")} placeholder="Enter last name" />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="Enter email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="Enter phone number" />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select {...register("status")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OnShift">On-Shift</SelectItem>
                <SelectItem value="OffShift">Off-Shift</SelectItem>
                <SelectItem value="OnLeave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>

          {/* Last Shift Date */}
          <div>
            <Label htmlFor="last-shift">Last Shift Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    id="last-shift"
                    type="text"
                    value={lastShift ? format(lastShift, "PPP") : ""}
                    placeholder="Select last shift date"
                    readOnly
                  />
                  {/* <CalendarIcon className="absolute right-3 top-3 w-5 h-5 text-gray-500 cursor-pointer" /> */}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={lastShift}
                  onSelect={setLastShift}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Go Back
            </Button>
            <Button className="bg-[#005F15] hover:bg-[#004A12] text-white" type="submit">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
