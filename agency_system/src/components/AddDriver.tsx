"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";

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
    console.log("Driver Data:", data);
    toast.success("Driver added successfully!");
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div>
        <p className="text-[#005F15] ">Driver</p>
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <p>Record Your Driver Details</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              type="text"
              placeholder="Enter first name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              type="text"
              placeholder="Enter last name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
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
                <SelectItem value="OffShift">Off-shift</SelectItem>
                <SelectItem value="OnLeave">OnLeave</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>

          {/* Last Shift Date */}
          <div>
            <Label>Last Shift Date</Label>
            <Calendar
              mode="single"
              selected={lastShift}
              onSelect={(date) => setLastShift(date)}
            />
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
