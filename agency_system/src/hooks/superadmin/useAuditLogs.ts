import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export function useAuditLogs() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/superadmin/audit-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogs(response.data.users || []);
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
      setError(err?.response?.data?.message || "Failed to load audit logs");
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
  };
}
