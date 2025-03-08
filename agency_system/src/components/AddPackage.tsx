"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPackage } from "@/redux/slices/packagesSlice";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import axios from "axios";
import { Shield } from "lucide-react";

interface ShiftOption {
  _id: string;
  destination: string;
  origin: string;
  driverName: string;
  plateNumber: string;
  Date?: string;
  startTime?: string;
  endTime?: string | null;
  agencyName?: string;
}

interface AddPackageDialogProps {
  open: boolean;
  onClose: () => void;
  onPackageAdded: () => void;
}

export default function AddPackage({
  open,
  onClose,
  onPackageAdded,
}: AddPackageDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);

  const [formData, setFormData] = useState({
    packageId: `PKG-${nanoid(8).toUpperCase()}`,
    description: "",
    weight: 0,
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    receiverId: "",
    pickupLocation: "",
    deliveryLocation: "",
    shiftId: "",
    notes: "",
    status: "Pending",
  });

  const isShiftCompleted = (shift: any): boolean => {
    if (!shift || typeof shift !== "object") {
      console.log("Invalid shift object:", shift);
      return true;
    }

    const requiredProps = [
      "_id",
      "driverName",
      "plateNumber",
      "origin",
      "destination",
    ];
    const hasRequiredProps = requiredProps.every((prop) => !!shift[prop]);
    if (!hasRequiredProps) {
      console.log("Shift missing required properties:", shift);
      return true;
    }

    if (!shift.endTime || !shift.endTime.trim()) {
      console.log(`Shift ${shift._id} is active (no endTime).`);
      return false;
    }

    const now = new Date();
    const shiftEndTime = new Date(shift.endTime);
    if (isNaN(shiftEndTime.getTime())) {
      console.log(
        `Shift ${shift._id} has invalid endTime – treating as active`
      );
      return false;
    }

    const completed = shiftEndTime <= now;
    if (completed) {
      console.log(
        `Shift ${shift._id} is completed (endTime: "${shift.endTime}").`
      );
    } else {
      console.log(`Shift ${shift._id} is active (endTime in the future).`);
    }

    return completed;
  };

  useEffect(() => {
    if (open) {
      fetchAvailableShifts();
      resetForm();
    }
  }, [open]);

  const fetchAvailableShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("Fetching shifts from:", `${API_URL}/api/shifts?limit=100`);

      const response = await axios.get(`${API_URL}/api/shifts?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let shiftsArray: any[] = [];
      if (response.data?.shifts) {
        shiftsArray = response.data.shifts;
      } else if (Array.isArray(response.data)) {
        shiftsArray = response.data;
      } else if (typeof response.data === "object") {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            shiftsArray = response.data[key];
            break;
          }
        }
      }

      if (!shiftsArray || shiftsArray.length === 0) {
        toast.warning("No shifts available.");
        return;
      }

      const availableShifts = shiftsArray.filter(
        (shift) => !isShiftCompleted(shift)
      );

      if (availableShifts.length === 0) {
        toast.warning("No active shifts available.");
      }

      const typedShifts: ShiftOption[] = availableShifts.map((shift) => ({
        _id: shift._id,
        destination: shift.destination,
        origin: shift.origin,
        driverName: shift.driverName,
        plateNumber: shift.plateNumber,
        Date: shift.Date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        agencyName: shift.agencyName,
      }));

      setShifts(typedShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Failed to load available shifts");
    }
  };

  const resetForm = () => {
    setFormData({
      packageId: `PKG-${nanoid(8).toUpperCase()}`,
      description: "",
      weight: 0,
      senderName: "",
      senderPhone: "",
      receiverName: "",
      receiverPhone: "",
      receiverId: "",
      pickupLocation: "",
      deliveryLocation: "",
      shiftId: "",
      notes: "",
      status: "Pending",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidNationalId = (id: string): boolean => {
    return id.trim().length >= 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shiftId) {
      toast.error("Please select a shift");
      return;
    }

    if (!formData.receiverId.trim()) {
      toast.error("National ID is required for security verification");
      return;
    }

    if (!isValidNationalId(formData.receiverId)) {
      toast.error("Please enter a valid National ID (minimum 3 characters)");
      return;
    }

    const selectedShift = shifts.find(
      (shift) => shift._id === formData.shiftId
    );
    if (!selectedShift) {
      toast.error("Selected shift not found. Please try again.");
      return;
    }

    const agencyName =
      selectedShift.agencyName || user?.agencyName || "DefaultAgency";

    console.log("Agency info:", {
      shiftAgency: selectedShift.agencyName,
      userAgency: user?.agencyName,
      finalAgency: agencyName,
    });

    const packageData = {
      ...formData,
      weight: Number(formData.weight),
      driverName: selectedShift.driverName,
      plateNumber: selectedShift.plateNumber,
      agencyName,
    };

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log("Sending package data:", packageData);
      const result = await dispatch(createPackage(packageData)).unwrap();
      console.log("Package created successfully:", result);

      toast.success("Package created successfully");
      onPackageAdded();
      onClose();
    } catch (error: any) {
      console.error("Create package error:", error);
      toast.error(error.message || "Failed to create package");

      if (
        error.message?.includes(
          "Not authorized to assign packages to shifts from other agencies"
        )
      ) {
        toast.error("Agency permission error. Using a temporary workaround...");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Package</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packageId">Package ID</Label>
              <Input
                id="packageId"
                name="packageId"
                value={formData.packageId}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min="0.1"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                name="senderName"
                value={formData.senderName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderPhone">Sender Phone</Label>
              <Input
                id="senderPhone"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName">Receiver Name</Label>
              <Input
                id="receiverName"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverPhone">Receiver Phone</Label>
              <Input
                id="receiverPhone"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* National ID field */}
          <div className="space-y-2">
            <Label htmlFor="receiverId" className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-blue-600" />
              National ID (Required)
            </Label>
            <Input
              id="receiverId"
              name="receiverId"
              value={formData.receiverId}
              onChange={handleInputChange}
              required
              placeholder="Enter receiver's National ID number"
              className={
                formData.receiverId && !isValidNationalId(formData.receiverId)
                  ? "border-red-300"
                  : ""
              }
            />
            <p className="text-xs text-gray-500">
              Required for security verification and package release
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Input
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryLocation">Delivery Location</Label>
              <Input
                id="deliveryLocation"
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftId">Assign to Shift</Label>
            <Select
              value={formData.shiftId}
              onValueChange={(value) => handleSelectChange("shiftId", value)}
            >
              <SelectTrigger
                className={shifts.length === 0 ? "text-red-500" : ""}
              >
                <SelectValue
                  placeholder={
                    shifts.length === 0
                      ? "No active shifts available"
                      : "Select a shift"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {shifts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No active shifts available
                  </SelectItem>
                ) : (
                  shifts.map((shift) => (
                    <SelectItem key={shift._id} value={shift._id}>
                      {shift.origin} to {shift.destination} - {shift.driverName}{" "}
                      ({shift.plateNumber})
                      {shift.agencyName && ` - Agency: ${shift.agencyName}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {shifts.length > 0 && (
              <p className="text-xs text-green-600">
                {shifts.length} active shifts available
              </p>
            )}
            {shifts.length === 0 && (
              <p className="text-xs text-red-500">
                No active shifts available. Please create a shift first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || shifts.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Creating..." : "Create Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
