import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export function useDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>({});
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com"


  const fetchSystemSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/superadmin/enhanced-summary`,
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