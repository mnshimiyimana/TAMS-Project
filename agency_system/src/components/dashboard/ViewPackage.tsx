"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, updatePackageStatus } from "@/redux/slices/packagesSlice";
import { formatPackageStatus } from "@/services/packageService";
import { toast } from "sonner";
import { Shield, AlertCircle } from "lucide-react";

interface ViewPackageDialogProps {
  open: boolean;
  onClose: () => void;
  packageData: Package | null;
  onPackageUpdated: () => void;
}

export default function ViewPackageDialog({
  open,
  onClose,
  packageData,
  onPackageUpdated,
}: ViewPackageDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState("details");
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    if (packageData) {
      setNewStatus(packageData.status);
      setStatusNotes("");

      console.log("Package data loaded:", {
        packageId: packageData.packageId,
        receiverId: packageData.receiverId,
        receiverIdType: typeof packageData.receiverId,
        receiverIdExists: Boolean(packageData.receiverId),
      });
    }
  }, [packageData]);

  if (!packageData) return null;

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === packageData.status) {
      toast.warning("Please select a different status");
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      await dispatch(
        updatePackageStatus({
          id: packageData._id,
          status: newStatus,
          notes: statusNotes || `Status updated to ${newStatus}`,
        })
      ).unwrap();

      toast.success(`Status updated to ${newStatus}`);
      onPackageUpdated();
    } catch (error: any) {
      console.error("Update status error:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusInfo = formatPackageStatus(packageData.status);

  const hasReceiverId = Boolean(
    packageData.receiverId && packageData.receiverId.trim() !== ""
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Package Details</span>
            <Badge
              className={`${statusInfo.badgeColor} ${statusInfo.textColor}`}
            >
              {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Package Details</TabsTrigger>
            <TabsTrigger value="tracking">Update Status</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Package ID</Label>
                <p className="font-medium">{packageData.packageId}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Weight</Label>
                <p className="font-medium">{packageData.weight} kg</p>
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-500">Description</Label>
              <p className="font-medium">{packageData.description}</p>
            </div>

            {/* NATIONAL ID SECTION - Simplified with direct access */}
            <div className="border rounded-md p-3 bg-blue-50">
              <Label className="font-medium text-blue-700 flex items-center mb-2">
                <Shield className="h-5 w-5 mr-1" />
                National ID Verification
              </Label>

              {hasReceiverId ? (
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Verified Identity
                  </p>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-600 bg-green-50"
                    >
                      ID: {packageData.receiverId}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded p-2 border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800 mb-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    No National ID on record
                  </p>
                  <p className="text-xs text-gray-600">
                    This package was created without National ID verification
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Sender</Label>
                <p className="font-medium">{packageData.senderName}</p>
                <p className="text-sm">{packageData.senderPhone}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Receiver</Label>
                <p className="font-medium">{packageData.receiverName}</p>
                <p className="text-sm">{packageData.receiverPhone}</p>
                {/* Add the receiver ID here as well */}
                {hasReceiverId && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">National ID:</span>{" "}
                    {packageData.receiverId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Pickup Location</Label>
                <p className="font-medium">{packageData.pickupLocation}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">
                  Delivery Location
                </Label>
                <p className="font-medium">{packageData.deliveryLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Driver</Label>
                <p className="font-medium">
                  {packageData.driverName || "Not assigned"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Vehicle</Label>
                <p className="font-medium">
                  {packageData.plateNumber || "Not assigned"}
                </p>
              </div>
            </div>

            {packageData.notes && (
              <div>
                <Label className="text-sm text-gray-500">Notes</Label>
                <p className="font-medium">{packageData.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Created At</Label>
                <p className="font-medium">
                  {packageData.createdAt
                    ? new Date(packageData.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              {packageData.deliveredAt && (
                <div>
                  <Label className="text-sm text-gray-500">Delivered At</Label>
                  <p className="font-medium">
                    {new Date(packageData.deliveredAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="status">Update Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Status Update Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === packageData.status}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Status History</h3>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-gray-500">
                      {packageData.createdAt
                        ? new Date(packageData.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {packageData.deliveredAt && (
                  <div className="flex items-center mt-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500 mr-2"></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-gray-500">
                        {new Date(packageData.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
