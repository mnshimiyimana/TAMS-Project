"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthBackground from "@/components/sections/AuthBackground";


const signUpSchema = z
  .object({
    agencyName: z.string().min(3, "Agency name must be at least 3 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    location: z.string().min(5, "Location is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
    role: z.enum(["admin", "manager", "fuel"], {
      required_error: "Role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      agencyName: "",
      username: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to sign up");

      toast.success("Sign-up successful! Please log in.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Image Section */}
      <AuthBackground />

      {/* Right Side - Sign-Up Form */}
      <div className="w-full lg:w-1/2 lg:px-20 px-10  items-center justify-center pt-40 ">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-700">This information will be displayed on your profile.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-700">
          {/* First Row: Agency Name & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                {...register("agencyName")}
                placeholder="Agency name"
              />
              {errors.agencyName && (
                <p className="text-red-500 text-sm">
                  {errors.agencyName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          {/* Second Row: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="Phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Third Row: Location & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Fourth Row: Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) =>
                  setValue("role", value as "admin" | "manager" | "fuel")
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  {/* <SelectItem value="fuel">Fuel</SelectItem> */}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role.message}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between py-8">
            <Button
              variant="outline"
              type="button"
              className="w-1/3"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-1/3 bg-green-600"
            >
              {isLoading ? "Signing Up..." : "Sign up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
