"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Zod validation schema for sign-up
const signUpSchema = z
  .object({
    agencyName: z.string().min(3, "Agency name must be at least 3 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    location: z.string().min(5, "Location is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
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
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
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
      // Redirect or reset form
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message); // Now TypeScript knows that `error` is an instance of `Error`
      } else {
        console.error("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Image Section */}
      <div
        className="w-2/5 h-full bg-cover bg-center"
        style={{ backgroundImage: 'url("/path/to/image.jpg")' }}
      ></div>

      {/* Form Section */}
      <div className="w-3/5 p-8 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Agency Name */}
          <div>
            <Label htmlFor="agencyName">Agency Name</Label>
            <Input id="agencyName" {...register("agencyName")} />
            {errors.agencyName && (
              <p className="text-red-500 text-sm">
                {errors.agencyName.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-between mt-4">
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
              {isLoading ? "Signing Up..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
