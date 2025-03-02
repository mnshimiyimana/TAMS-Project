"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Mail, Phone, MapPin, UserRound, CalendarClock } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
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

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
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

  return (
    <div className="space-y-8 w-full">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-20 w-full">
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
        <Card className="flex-1 min-w-full">
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
      </div>
    </div>
  );
}