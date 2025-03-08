"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  addFuelTransaction,
  updateFuelTransaction,
  FuelTransaction,
  fetchFuelTransactions,
} from "@/redux/slices/fuelsSlice";
import { fetchVehicles } from "@/redux/slices/vehiclesSlice";
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

const fuelSchema = z.object({
  plateNumber: z.string().min(5, "Plate number is required"),
  driverName: z.string().min(3, "Driver name is required"),
  fuelDate: z.string().min(1, "Fuel date is required"),
  amount: z.coerce.number().min(0.1, "Fuel amount must be greater than 0"),
  amountPrice: z.coerce
    .number()
    .min(0.01, "Amount price must be greater than 0"),
  lastFill: z.coerce.number().min(0, "Last fill liters must be positive"),
  lastFillPrice: z.coerce
    .number()
    .min(0.01, "Last fill price must be greater than 0"),
  agencyName: z.string().min(1, "Agency name is required"),
});

type FuelFormData = z.infer<typeof fuelSchema>;

interface AddFuelDialogProps {
  open: boolean;
  onClose: () => void;
  fuelToEdit?: FuelTransaction | null;
  agencyName: string;
}

export default function AddFuelDialog({
  open,
  onClose,
  fuelToEdit = null,
  agencyName,
}: AddFuelDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!fuelToEdit;

  // Get user role to determine if agency can be changed
  const userRole = useSelector((state: RootState) => state.auth.user?.role || "");
  const isSuperAdmin = userRole === "superadmin";

  // Get agency options from vehicles for superadmin
  const agencyOptions = useSelector((state: RootState) => 
    Array.from(new Set(state.vehicles.vehicles.map(v => v.agencyName).filter(Boolean)))
  );

  const vehicles = useSelector((state: RootState) => state.vehicles.vehicles);
  const vehiclesLoading = useSelector(
    (state: RootState) => state.vehicles.isLoading
  );

  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const selectedAgency = useSelector((state: RootState) => 
    state.fuels.filters.agencyName || agencyName
  );

  useEffect(() => {
    if (vehicles.length === 0 && !vehiclesLoading) {
      dispatch(fetchVehicles());
    }
  }, [dispatch, vehicles, vehiclesLoading]);

  // Filter vehicles by selected agency
  useEffect(() => {
    if (selectedAgency) {
      setFilteredVehicles(vehicles.filter(v => v.agencyName === selectedAgency));
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [vehicles, selectedAgency]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      plateNumber: "",
      driverName: "",
      fuelDate: new Date().toISOString().split("T")[0],
      amount: undefined,
      amountPrice: undefined,
      lastFill: undefined,
      lastFillPrice: undefined,
      agencyName: agencyName,
    },
  });

  useEffect(() => {
    if (fuelToEdit) {
      setValue("plateNumber", fuelToEdit.plateNumber);
      setValue("driverName", fuelToEdit.driverName);
      setValue("fuelDate", new Date(fuelToEdit.fuelDate).toISOString().split('T')[0]);
      setValue("amount", fuelToEdit.amount);
      setValue("amountPrice", fuelToEdit.amountPrice);
      setValue("lastFill", fuelToEdit.lastFill);
      setValue("lastFillPrice", fuelToEdit.lastFillPrice);
      setValue("agencyName", fuelToEdit.agencyName || agencyName);
    } else {
      // Set default agency for new transactions
      setValue("agencyName", agencyName);
    }
  }, [fuelToEdit, setValue, agencyName]);

  const onSubmit = async (data: FuelFormData) => {
    try {
      setIsSubmitting(true);

      // Validate agency permission
      if (!isSuperAdmin && data.agencyName !== agencyName) {
        toast.error("You don't have permission to create fuel transactions for other agencies");
        return;
      }

      // Ensure agency is set
      const fuelData = {
        ...data,
        agencyName: data.agencyName || agencyName,
      };

      if (isEditing && fuelToEdit) {
        await dispatch(
          updateFuelTransaction({
            id: fuelToEdit._id,
            fuelData,
          })
        ).unwrap();
        toast.success("Fuel transaction updated successfully!");
      } else {
        await dispatch(addFuelTransaction(fuelData)).unwrap();
        toast.success("Fuel transaction added successfully!");
      }

      // Refresh the fuel transactions list
      dispatch(fetchFuelTransactions());
      
      reset();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error?.message ||
          (isEditing
            ? "Failed to update fuel transaction"
            : "Failed to add fuel transaction")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlateNumber = watch("plateNumber");
  const suggestedVehicle = vehicles.find(
    (vehicle) => vehicle.plateNumber === selectedPlateNumber
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h1 className="text-[#005F15] font-medium">Fuels</h1>
          <DialogTitle>
            {isEditing ? "Edit Fuel Transaction" : "Add New Fuel Transaction"}
          </DialogTitle>
          <p>Record Your Fuel Transaction Details</p>
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

          {/* Plate Number */}
          <div>
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Select
              value={watch("plateNumber")}
              onValueChange={(value) => {
                setValue("plateNumber", value);
                // Auto-suggest driver name based on selected vehicle
                const vehicle = vehicles.find((v) => v.plateNumber === value);
                if (vehicle) {
                  setValue("driverName", vehicle.busId);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {filteredVehicles.map((vehicle) => (
                  <SelectItem key={vehicle._id} value={vehicle.plateNumber}>
                    {vehicle.plateNumber} - {vehicle.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.plateNumber && (
              <p className="text-red-500 text-sm">
                {errors.plateNumber.message}
              </p>
            )}
          </div>

          {/* Driver Name */}
          <div>
            <Label htmlFor="driverName">
              Driver Name{" "}
              {suggestedVehicle && `(Suggested: ${suggestedVehicle.busId})`}
            </Label>
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

          {/* Fuel Date */}
          <div>
            <Label htmlFor="fuelDate">Fuel Date</Label>
            <Input id="fuelDate" type="date" {...register("fuelDate")} />
            {errors.fuelDate && (
              <p className="text-red-500 text-sm">{errors.fuelDate.message}</p>
            )}
          </div>

          {/* Fuel Amount */}
          <div>
            <Label htmlFor="amount">Fuel Amount (L)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          {/* Amount Price */}
          <div>
            <Label htmlFor="amountPrice">Amount Price (Per L)</Label>
            <Input
              id="amountPrice"
              type="number"
              step="0.01"
              placeholder="Enter amount price"
              {...register("amountPrice")}
            />
            {errors.amountPrice && (
              <p className="text-red-500 text-sm">
                {errors.amountPrice.message}
              </p>
            )}
          </div>

          {/* Last Fill */}
          <div>
            <Label htmlFor="lastFill">Last Fill (Liters)</Label>
            <Input
              id="lastFill"
              type="number"
              step="0.01"
              placeholder="Enter last fill liters"
              {...register("lastFill")}
            />
            {errors.lastFill && (
              <p className="text-red-500 text-sm">{errors.lastFill.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastFillPrice">Last Fill Price (Per L)</Label>
            <Input
              id="lastFillPrice"
              type="number"
              step="0.01"
              placeholder="Enter last fill price"
              {...register("lastFillPrice")}
            />
            {errors.lastFillPrice && (
              <p className="text-red-500 text-sm">
                {errors.lastFillPrice.message}
              </p>
            )}
          </div>

          {/* Buttons */}
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
                ? "Update Transaction"
                : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}