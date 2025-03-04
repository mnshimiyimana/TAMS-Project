import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface AgencyFormData {
  agencyName: string;
  username: string;
  email: string;
  phone: string;
  location: string;
}

export interface DeleteDialogState {
  open: boolean;
  agencyId: string | null;
  agencyName: string | null;
}

export function useAgencies() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    agencyId: null,
    agencyName: null,
  });
  const [createAdminDialog, setCreateAdminDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<AgencyFormData>({
    agencyName: "",
    username: "",
    email: "",
    phone: "",
    location: "",
  });

  const fetchAgencies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/superadmin/agencies-dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAgencies(response.data);
    } catch (err: any) {
      console.error("Error fetching agencies:", err);
      setError(err?.response?.data?.message || "Failed to load agencies");
      toast.error("Failed to load agencies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const createAdmin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        await axios.post(
          "http://localhost:5000/api/auth/create-admin",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(`Admin for ${formData.agencyName} created successfully`);
        setCreateAdminDialog(false);
        setFormData({
          agencyName: "",
          username: "",
          email: "",
          phone: "",
          location: "",
        });
        fetchAgencies();
      } catch (err: any) {
        console.error("Error creating admin:", err);
        toast.error(err?.response?.data?.message || "Failed to create admin");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, fetchAgencies]
  );

  const deleteAgency = useCallback(async () => {
    if (!deleteDialog.agencyId || !deleteDialog.agencyName) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete("http://localhost:5000/api/superadmin/agency", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          agencyName: deleteDialog.agencyName,
        },
      });

      toast.success(`Agency ${deleteDialog.agencyName} deleted successfully`);
      fetchAgencies();
    } catch (err: any) {
      console.error("Error deleting agency:", err);
      toast.error(err?.response?.data?.message || "Failed to delete agency");
    } finally {
      setIsLoading(false);
      setDeleteDialog({ open: false, agencyId: null, agencyName: null });
    }
  }, [deleteDialog.agencyId, deleteDialog.agencyName, fetchAgencies]);

  const toggleAgencyStatus = useCallback(
    async (agencyName: string, isActive: boolean) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        await axios.patch(
          "http://localhost:5000/api/superadmin/agency-status",
          {
            agencyName,
            isActive: !isActive,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          `Agency ${agencyName} ${
            !isActive ? "activated" : "deactivated"
          } successfully`
        );
        fetchAgencies();
      } catch (err: any) {
        console.error("Error updating agency status:", err);
        toast.error(
          err?.response?.data?.message || "Failed to update agency status"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAgencies]
  );

  const filteredAgencies = agencies.filter(
    (agency: any) =>
      agency.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    agencies: filteredAgencies,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDialog,
    setDeleteDialog,
    createAdminDialog,
    setCreateAdminDialog,
    formData,
    handleInputChange,
    fetchAgencies,
    createAdmin,
    deleteAgency,
    toggleAgencyStatus,
  };
}
