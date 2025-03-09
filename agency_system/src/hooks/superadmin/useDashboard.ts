import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export function useDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>({});

  const fetchSystemSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://tams-project.onrender.com/api/superadmin/enhanced-summary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(response.data);
    } catch (err: any) {
      console.error("Error fetching system summary:", err);
      setError(err?.response?.data?.message || "Failed to load system summary");
      toast.error("Failed to load system summary");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    summary,
    isLoading,
    error,
    fetchSystemSummary
  };
}