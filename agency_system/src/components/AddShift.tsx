"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addShift, updateShift, Shift } from "@/redux/slices/shiftsSlice";
import { fetchVehicles, updateVehicle } from "@/redux/slices/vehiclesSlice";
import { getDrivers, updateDriver, Driver } from "@/services/driverService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const shiftSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  driverName: z.string().min(1, "Driver's name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  destination: z.string().min(1, "Destination is required"),
  origin: z.string().min(1, "Origin is required"),
  Date: z.string().min(1, "Date is required"),
  agencyName: z.string().min(1, "Agency name is required"),
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

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  const vehicles = useSelector((state: RootState) => state.vehicles.vehicles);
  const vehiclesLoading = useSelector(
    (state: RootState) => state.vehicles.isLoading
  );
  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role || ""
  );
  const isSuperAdmin = userRole === "superadmin";

  // Get all agencies for superadmin (from vehicles for convenience)
  const agencyOptions = useSelector((state: RootState) =>
    Array.from(
      new Set(state.vehicles.vehicles.map((v) => v.agencyName).filter(Boolean))
    )
  );

  const [filteredVehicles, setFilteredVehicles] = useState<typeof vehicles>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      agencyName: agencyName, // Default to current user's agency
    },
  });

  // Watch agency value to trigger filtering when it changes
  const selectedAgency = watch("agencyName");

  useEffect(() => {
    if (vehicles.length === 0 && !vehiclesLoading) {
      dispatch(fetchVehicles());
    }

    const fetchDriversData = async () => {
      try {
        setIsLoadingDrivers(true);
        // If superadmin selects a different agency, fetch drivers for that agency
        const params: any = { limit: 100 };

        if (isSuperAdmin && selectedAgency) {
          params.agencyName = selectedAgency;
        } else {
          params.agencyName = agencyName;
        }

        const response = await getDrivers(params);
        setDrivers(response.drivers || []);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        toast.error("Failed to load drivers data");
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    fetchDriversData();
  }, [
    dispatch,
    agencyName,
    vehicles.length,
    vehiclesLoading,
    isSuperAdmin,
    selectedAgency,
  ]);

  // Filter vehicles based on selected agency
  useEffect(() => {
    let agencyVehicles = vehicles;

    // Filter by agency if needed
    if (selectedAgency) {
      agencyVehicles = vehicles.filter((v) => v.agencyName === selectedAgency);
    }

    // Then filter by availability
    const availableVehicles = agencyVehicles.filter(
      (vehicle) => vehicle.status === "Available"
    );

    setFilteredVehicles(availableVehicles);
  }, [vehicles, selectedAgency]);

  // Filter drivers based on selected agency
  useEffect(() => {
    const availableDrivers = drivers.filter(
      (driver) => driver.status === "Off shift"
    );
    setFilteredDrivers(availableDrivers);
  }, [drivers]);

  // Include the original vehicle/driver in the filtered lists when editing
  useEffect(() => {
    if (isEditing && shiftToEdit) {
      const originalVehicle = vehicles.find(
        (v) => v.plateNumber === shiftToEdit.plateNumber
      );

      const originalDriver = drivers.find(
        (d) => d.names === shiftToEdit.driverName
      );

      if (
        originalVehicle &&
        !filteredVehicles.some((v) => v._id === originalVehicle._id)
      ) {
        setFilteredVehicles([...filteredVehicles, originalVehicle]);
      }

      if (
        originalDriver &&
        !filteredDrivers.some((d) => d._id === originalDriver._id)
      ) {
        setFilteredDrivers([...filteredDrivers, originalDriver]);
      }
    }
  }, [
    isEditing,
    shiftToEdit,
    vehicles,
    drivers,
    filteredVehicles,
    filteredDrivers,
  ]);

  // Set form values when editing a shift
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
      setValue("agencyName", shiftToEdit.agencyName || agencyName);
    } else {
      // For new shifts, always set the default agency
      setValue("agencyName", agencyName);
    }
  }, [shiftToEdit, setValue, agencyName]);

  const onSubmit = async (data: ShiftFormData) => {
    try {
      setIsSubmitting(true);

      // Verify agency permission
      if (!isSuperAdmin && data.agencyName !== agencyName) {
        toast.error(
          "You don't have permission to create shifts for other agencies"
        );
        return;
      }

      const shiftData = {
        ...data,
        agencyName: data.agencyName || agencyName,
      };

      if (isEditing && shiftToEdit) {
        await dispatch(
          updateShift({
            id: shiftToEdit._id,
            shiftData,
          })
        ).unwrap();

        if (data.endTime) {
          await updateResourceStatuses(
            data.plateNumber,
            data.driverName,
            false,
            data.agencyName
          );
        } else {
          await updateResourceStatuses(
            data.plateNumber,
            data.driverName,
            true,
            data.agencyName
          );
        }

        toast.success("Shift updated successfully!");
      } else {
        await dispatch(addShift(shiftData)).unwrap();

        await updateResourceStatuses(
          data.plateNumber,
          data.driverName,
          true,
          data.agencyName
        );

        toast.success("Shift added successfully!");
      }

      reset();
      onClose();

      dispatch(fetchVehicles());
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

  const updateResourceStatuses = async (
    plateNumber: string,
    driverName: string,
    isStarting: boolean,
    agencyName: string
  ) => {
    try {
      const vehicleToUpdate = vehicles.find(
        (v) => v.plateNumber === plateNumber && v.agencyName === agencyName
      );
      if (vehicleToUpdate) {
        await dispatch(
          updateVehicle({
            id: vehicleToUpdate._id,
            vehicleData: {
              status: isStarting ? "Assigned" : "Available",
            },
          })
        ).unwrap();
      }

      const driverToUpdate = drivers.find(
        (d) => d.names === driverName && d.agencyName === agencyName
      );
      if (driverToUpdate) {
        if (driverToUpdate.status !== "On leave") {
          await updateDriver(driverToUpdate._id, {
            status: isStarting ? "On Shift" : "Off shift",
            lastShift: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error updating resource statuses:", error);
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
          {/* Agency selection for superadmin */}
          {isSuperAdmin && (
            <div>
              <Label htmlFor="agencyName">Agency</Label>
              <Select
                value={watch("agencyName")}
                onValueChange={(value) => setValue("agencyName", value)}
              >
                <SelectTrigger id="agencyName" className="w-full">
                  <SelectValue placeholder="Select an agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencyOptions.map((agency) => (
                    <SelectItem key={agency} value={agency || ""}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agencyName && (
                <p className="text-red-500 text-sm">
                  {errors.agencyName.message}
                </p>
              )}
            </div>
          )}
          {/* Hidden agency field for non-superadmins */}
          {!isSuperAdmin && (
            <input
              type="hidden"
              {...register("agencyName")}
              value={agencyName}
            />
          )}

          <div>
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Select
              value={watch("plateNumber")}
              onValueChange={(value) => setValue("plateNumber", value)}
              disabled={vehiclesLoading}
            >
              <SelectTrigger id="plateNumber" className="w-full">
                <SelectValue placeholder="Select a vehicle plate number" />
              </SelectTrigger>
              <SelectContent>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle.plateNumber}>
                      {vehicle.plateNumber} - {vehicle.type}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No available vehicles
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.plateNumber && (
              <p className="text-red-500 text-sm">
                {errors.plateNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="driverName">Driver's Name</Label>
            <Select
              value={watch("driverName")}
              onValueChange={(value) => setValue("driverName", value)}
              disabled={isLoadingDrivers}
            >
              <SelectTrigger id="driverName" className="w-full">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <SelectItem key={driver._id} value={driver.names}>
                      {driver.names} - {driver.driverId}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No available drivers
                  </div>
                )}
              </SelectContent>
            </Select>
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
