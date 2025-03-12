import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, AlertCircle, HelpCircle, ThumbsUp } from "lucide-react";

export default function FeedbackReporting() {
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com" 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback or issue details");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await axios.post(
        `${API_BASE_URL}/api/feedback`,
        {
          type: feedbackType,
          message: feedbackText,
          userId: user?.id,
          userRole: user?.role,
          agencyName: user?.agencyName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        "Your submission has been received. Thank you for your feedback!"
      );
      setFeedbackText("");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit your feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackTypeIcon = () => {
    switch (feedbackType) {
      case "feedback":
        return <ThumbsUp className="h-5 w-5 text-blue-500" />;
      case "issue":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "suggestion":
        return <HelpCircle className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPlaceholderText = () => {
    switch (feedbackType) {
      case "feedback":
        return "Share your thoughts on your experience with the system...";
      case "issue":
        return "Please describe the issue you encountered in detail, including any error messages...";
      case "suggestion":
        return "We'd love to hear your ideas for improving the system...";
      default:
        return "Enter your message here...";
    }
  };

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {getFeedbackTypeIcon()}
            <h3 className="text-lg font-medium">Feedback & Support</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-type">What would you like to share?</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">General Feedback</SelectItem>
                <SelectItem value="issue">Report an Issue</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-content">Your Message</Label>
            <Textarea
              id="feedback-content"
              placeholder={getPlaceholderText()}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
