import { useEffect, useState } from "react";
import { useFeedback } from "@/hooks/superadmin/useFeedback";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, X, Filter } from "lucide-react";

export default function FeedbackManagement() {
  const {
    filteredFeedback,
    stats,
    isLoading,
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
  } = useFeedback();

  const [responseForm, setResponseForm] = useState({
    response: "",
    status: "in-progress",
  });

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [fetchFeedback, fetchStats]);

  useEffect(() => {
    if (selectedFeedback) {
      setResponseForm({
        response: "",
        status: selectedFeedback.status || "in-progress",
      });
    }
  }, [selectedFeedback]);

  const handleResponseChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setResponseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseForm.response) return;

    await respondToFeedback(
      selectedFeedback._id,
      responseForm.response,
      responseForm.status
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "feedback":
        return "border-blue-500 text-blue-500";
      case "issue":
        return "border-red-500 text-red-500";
      case "suggestion":
        return "border-green-500 text-green-500";
      default:
        return "border-gray-500 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-full md:w-64 bg-white">
          <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search feedback..."
            className="border-none focus:ring-0 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Filters:</span>
          </div>

          {/* Filter by type */}
          <Select
            value={activeFilters.type || "all-types"}
            onValueChange={(value) =>
              setActiveFilters({
                ...activeFilters,
                type: value === "all-types" ? null : value,
              })
            }
          >
            <SelectTrigger className="w-[130px] h-9 bg-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="issue">Issue</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={activeFilters.status || "all-statuses"}
            onValueChange={(value) =>
              setActiveFilters({
                ...activeFilters,
                status: value === "all-statuses" ? null : value,
              })
            }
          >
            <SelectTrigger className="w-[130px] h-9 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {agencies.length > 1 && (
            <Select
              value={activeFilters.agency || "all-agencies"}
              onValueChange={(value) =>
                setActiveFilters({
                  ...activeFilters,
                  agency: value === "all-agencies" ? null : value,
                })
              }
            >
              <SelectTrigger className="w-[150px] h-9 bg-white">
                <SelectValue placeholder="Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-agencies">All Agencies</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency} value={agency}>
                    {agency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(activeFilters.type ||
            activeFilters.status ||
            activeFilters.agency) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-9"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}

          <Button
            variant="outline"
            className="h-9 ml-auto"
            onClick={() => {
              fetchFeedback();
              fetchStats();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-yellow-500">
              {isLoading
                ? "..."
                : stats?.byStatus?.find((s) => s.status === "pending")?.count ||
                  0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-blue-500">
              {isLoading
                ? "..."
                : stats?.byStatus?.find((s) => s.status === "in-progress")
                    ?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-green-500">
              {isLoading
                ? "..."
                : (stats?.byStatus?.find((s) => s.status === "resolved")
                    ?.count || 0) +
                  (stats?.byStatus?.find((s) => s.status === "closed")?.count ||
                    0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
          <CardDescription>
            View and respond to user feedback across all agencies
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>User</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-1/4">Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell colSpan={7} className="h-16 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center p-4">
                      <p className="text-gray-500 mb-2">No feedback found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((item) => (
                  <TableRow
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.userName}</p>
                        <p className="text-xs text-gray-500">{item.userRole}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.agencyName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getTypeStyles(item.type)}
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate" title={item.message}>
                        {item.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        Respond
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedFeedback}
        onOpenChange={(open) => !open && setSelectedFeedback(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              {selectedFeedback?.type} from {selectedFeedback?.userName} at{" "}
              {selectedFeedback?.agencyName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                {selectedFeedback?.message}
              </p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Submitted on{" "}
                  {selectedFeedback
                    ? new Date(selectedFeedback.createdAt).toLocaleString()
                    : ""}
                </p>
                <Badge
                  className={
                    selectedFeedback
                      ? getStatusColor(selectedFeedback.status)
                      : ""
                  }
                >
                  {selectedFeedback?.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            {selectedFeedback?.response && (
              <div className="space-y-2">
                <Label>Previous Response</Label>
                <div className="bg-blue-50 p-2 rounded-md">
                  <p className="text-sm">{selectedFeedback.response}</p>
                  {selectedFeedback.respondedBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Responded on{" "}
                      {new Date(selectedFeedback.respondedBy).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                name="response"
                value={responseForm.response}
                onChange={handleResponseChange}
                placeholder="Type your response here..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select
                value={responseForm.status}
                onValueChange={(value) =>
                  setResponseForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedFeedback(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!responseForm.response || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
