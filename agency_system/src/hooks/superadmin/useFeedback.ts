import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface FeedbackItem {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  agencyName: string;
  type: "feedback" | "issue" | "suggestion";
  message: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  response?: string;
  respondedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  byAgency?: { agency: string; count: number }[];
  recent: { date: string; count: number }[];
  total: number;
}

export interface FeedbackFilters {
  type: string | null;
  status: string | null;
  agency: string | null;
}

export function useFeedback() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [agencies, setAgencies] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FeedbackFilters>({
    type: null,
    status: null,
    agency: null,
  });
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get("https://tams-project.onrender.com/api/feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setFeedback(response.data);
        setFilteredFeedback(response.data);

        const uniqueAgencies = Array.from(
          new Set(response.data.map((item: FeedbackItem) => item.agencyName))
        );
        setAgencies(uniqueAgencies);
      } else {
        setFeedback([]);
        setFilteredFeedback([]);
      }
    } catch (err: any) {
      console.error("Error fetching feedback:", err);
      setError(err?.response?.data?.message || "Failed to load feedback data");
      toast.error("Failed to load feedback data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://tams-project.onrender.com/api/feedback/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (err: any) {
      console.error("Error fetching feedback stats:", err);
      toast.error("Failed to load feedback statistics");
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...feedback];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.message.toLowerCase().includes(query) ||
          item.userName.toLowerCase().includes(query) ||
          item.agencyName.toLowerCase().includes(query)
      );
    }

    if (activeFilters.type) {
      filtered = filtered.filter((item) => item.type === activeFilters.type);
    }

    if (activeFilters.status) {
      filtered = filtered.filter(
        (item) => item.status === activeFilters.status
      );
    }

    if (activeFilters.agency) {
      filtered = filtered.filter(
        (item) => item.agencyName === activeFilters.agency
      );
    }

    setFilteredFeedback(filtered);
  }, [feedback, searchQuery, activeFilters]);

  const respondToFeedback = useCallback(
    async (feedbackId: string, response: string, status: string) => {
      try {
        setIsSubmitting(true);

        const token = localStorage.getItem("token");
        await axios.patch(
          `https://tams-project.onrender.com/api/feedback/${feedbackId}`,
          {
            response,
            status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Response submitted successfully");

        fetchFeedback();
        fetchStats();
        setSelectedFeedback(null);
      } catch (err: any) {
        console.error("Error responding to feedback:", err);
        toast.error(
          err?.response?.data?.message || "Failed to submit response"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchFeedback, fetchStats]
  );

  const clearFilters = useCallback(() => {
    setActiveFilters({
      type: null,
      status: null,
      agency: null,
    });
    setSearchQuery("");
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, searchQuery, activeFilters, applyFilters]);

  return {
    feedback,
    filteredFeedback,
    stats,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    agencies,
    selectedFeedback,
    setSelectedFeedback,
    isSubmitting,
    fetchFeedback,
    fetchStats,
    respondToFeedback,
    clearFilters,
  };
}
