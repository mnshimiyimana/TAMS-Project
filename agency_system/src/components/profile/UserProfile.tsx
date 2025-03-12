"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BadgeCheck, 
  Mail, 
  Phone, 
  MapPin, 
  UserRound, 
  CalendarClock, 
  MessageSquare, 
  AlertCircle, 
  HelpCircle, 
  ThumbsUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { 
  submitFeedback, 
  FeedbackType, 
  fetchUserFeedback,
  resetSubmissionStatus,
  FeedbackItem 
} from "@/redux/slices/feedbackSlice";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feedback");
  const [feedbackText, setFeedbackText] = useState("");
  
  // Get user and auth state from Redux
  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

  // Get feedback state from Redux
  const { 
    submissionStatus, 
    submissionError, 
    userFeedback,
    status: feedbackStatus
  } = useSelector((state: RootState) => state.feedback);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com"

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      phone: "",
    },
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setValue("username", response.data.username);
        setValue("email", response.data.email);
        setValue("phone", response.data.phone);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, [setValue, token]);

  // Fetch user's feedback history
  useEffect(() => {
    dispatch(fetchUserFeedback());
  }, [dispatch]);

  // Watch for feedback submission status changes
  useEffect(() => {
    if (submissionStatus === 'succeeded') {
      toast.success("Your submission has been received. Thank you for your feedback!");
      setFeedbackText("");
      dispatch(resetSubmissionStatus());
      
      // Refresh feedback history after successful submission
      dispatch(fetchUserFeedback());
    } else if (submissionStatus === 'failed' && submissionError) {
      toast.error(submissionError);
      dispatch(resetSubmissionStatus());
    }
  }, [submissionStatus, submissionError, dispatch]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);
      
      // Update form with new data
      reset(data);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback or issue details");
      return;
    }
    
    // Dispatch the action to submit feedback using the Redux slice
    dispatch(submitFeedback({
      type: feedbackType,
      message: feedbackText
    }));
  };

  const cancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getFeedbackTypeIcon = () => {
    switch (feedbackType) {
      case "feedback":
        return <ThumbsUp className="h-5 w-5 text-[#006380]" />;
      case "issue":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "suggestion":
        return <HelpCircle className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFeedbackStatusIcon = (status: string = 'pending') => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'closed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFeedbackTypeIconByType = (type: FeedbackType) => {
    switch (type) {
      case "feedback":
        return <ThumbsUp className="h-4 w-4 text-[#006380]" />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "suggestion":
        return <HelpCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFeedbackStatusColor = (status: string = 'pending') => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800';
      case 'closed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 w-full">
      <div className="grid md:grid-cols-3 grid-cols-1 gap-12 w-full">
        {/* Profile Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={user?.username} />
                <AvatarFallback className="bg-green-100 text-green-800 md:text-3xl text-xl">
                  {user?.username ? getInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              {user?.username}
              {user?.role === "admin" && (
                <BadgeCheck className="h-5 w-5 text-blue-500" />
              )}
            </CardTitle>
            <CardDescription className="capitalize">{user?.role}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-justify pl-4 pt-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-5 w-5" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <UserRound className="h-5 w-5" />
                <span>ID: {user?.id?.substring(0, 8)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{user?.location || user?.agencyName}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarClock className="h-5 w-5" />
                <span>Last login: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency">Agency</Label>
                  <Input
                    id="agency"
                    value={user?.agencyName || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user?.role || ""}
                    disabled
                    className="bg-gray-50 capitalize"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  form="profile-form"
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="ml-auto bg-green-600 hover:bg-green-700"
              >
                Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Feedback & Support Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getFeedbackTypeIcon()}
              Feedback & Support
            </CardTitle>
            <CardDescription>
              Share your thoughts or report an issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="feedback-form" onSubmit={handleSubmitFeedback}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-type">What would you like to share?</Label>
                  <Select
                    value={feedbackType}
                    onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                  >
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
                    className="min-h-32 resize-none"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              form="feedback-form"
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={submissionStatus === 'loading' || !feedbackText.trim()}
            >
              {submissionStatus === 'loading' ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Feedback History Tracking Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Feedback History</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchUserFeedback())}
            disabled={feedbackStatus === 'loading'}
          >
            {feedbackStatus === 'loading' ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {feedbackStatus === 'loading' ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : userFeedback.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">You haven't submitted any feedback yet.</p>
              <p className="text-gray-400 text-sm mt-2">When you submit feedback, it will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userFeedback.map((feedback) => (
              <Card key={feedback._id} className="w-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getFeedbackTypeIconByType(feedback.type as FeedbackType)}
                      <CardTitle className="text-sm font-medium capitalize">
                        {feedback.type}
                      </CardTitle>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getFeedbackStatusColor(feedback.status)}
                    >
                      <div className="flex items-center gap-1">
                        {getFeedbackStatusIcon(feedback.status)}
                        <span className="capitalize">{feedback.status || 'pending'}</span>
                      </div>
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Submitted: {formatDate(feedback.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="max-h-24 overflow-y-auto">
                    <p className="text-sm">{feedback.message}</p>
                  </div>
                  
                  {feedback.response && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Response:</p>
                      <p className="text-sm text-gray-700">{feedback.response}</p>
                    </div>
                  )}
                </CardContent>
                {feedback.resolvedAt && (
                  <CardFooter className="pt-0 pb-3">
                    <p className="text-xs text-gray-500">
                      {feedback.status === 'resolved' || feedback.status === 'closed' 
                        ? `${feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)} on ${formatDate(feedback.resolvedAt)}` 
                        : ''}
                    </p>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}