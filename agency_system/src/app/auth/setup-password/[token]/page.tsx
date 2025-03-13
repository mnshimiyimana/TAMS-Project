"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import AuthBackground from "@/components/sections/AuthBackground";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

const userSetupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\+?[0-9\s]+$/, "Phone number can only contain numbers"),
    location: z.string().min(3, "Location must be at least 3 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserSetupFormData = z.infer<typeof userSetupSchema>;

interface UserInfo {
  id: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  agencyName: string;
}

function useSetupToken() {
  const params = useParams();
  console.log("Params received:", params);
  return params?.token as string;
}

export default function SetupPassword() {
  const token = useSetupToken();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({
    fullUrl: "",
    pathname: "",
    token: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserSetupFormData>({
    resolver: zodResolver(userSetupSchema),
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://tams-project.onrender.com";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDebugInfo({
        fullUrl: window.location.href,
        pathname: window.location.pathname,
        token: token,
      });
    }
  }, [token]);

  useEffect(() => {
    async function verifyToken() {
      try {
        setIsLoading(true);
        console.log("Attempting to verify token:", token);

        const response = await axios.get(
          `${API_BASE_URL}/api/auth/verify-setup-token/${token}`
        );
        console.log("Token verification successful:", response.data);

        const userData = response.data.user;
        setUserInfo(userData);

        setValue("username", userData.username);
        setValue("email", userData.email);
        setValue("phone", userData.phone || "");
        setValue("location", userData.location || "");

        setError(null);
      } catch (err: unknown) {
        console.error("Token verification error:", err);
        let errorMessage = "This setup link is invalid or has expired.";

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
          console.error("Axios error details:", err.response?.data);
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      verifyToken();
    } else {
      console.error("No token found in URL parameters");
      setError("No setup token found in the URL.");
      setIsLoading(false);
    }
  }, [token, setValue]);

  const onSubmit = async (data: UserSetupFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting form with data:", {
        ...data,
        password: "[REDACTED]",
      });

      await axios.post(
        `${API_BASE_URL}/api/auth/update-user-with-password/${token}`,
        {
          username: data.username,
          email: data.email,
          phone: data.phone,
          location: data.location,
          password: data.password,
        }
      );

      setIsComplete(true);
      toast.success("Account set up successfully!");
    } catch (err: unknown) {
      console.error("Setup error:", err);
      let errorMessage = "Failed to set up account. Please try again.";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
        console.error("Axios submission error details:", err.response?.data);
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthBackground />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center overflow-y-auto py-8">
        <div className="w-full max-w-md ">

          {/* <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Full URL: {debugInfo.fullUrl}</p>
            <p>Path: {debugInfo.pathname}</p>
            <p>Token: {token ? `${token.substring(0, 6)}...` : "Not found"}</p>
            <p>API URL: {API_BASE_URL}</p>
          </div> */}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Complete Your Account Setup
            </h1>
            <p className="text-sm text-gray-700">
              {isLoading
                ? "Verifying your setup link..."
                : error
                ? "There was a problem with your setup link."
                : isComplete
                ? "Your account has been set up successfully!"
                : `Welcome${
                    userInfo?.username ? ", " + userInfo.username : ""
                  }! Please review your details and create a secure password.`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-6">{error}</p>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Link href="/auth/sign-in">Go to Login</Link>
              </Button>
            </div>
          ) : isComplete ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-6">
                Your account has been set up successfully. You can now log in.
              </p>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Link href="/auth/sign-in">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Form fields remain the same */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    {...register("username")}
                    placeholder="Your username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="Your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    {...register("location")}
                    placeholder="Your location"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Create a strong password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
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
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase,
                lowercase letters and numbers.
              </p>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700">
                  You&apos;re setting up your account for{" "}
                  <span className="font-semibold">{userInfo?.agencyName}</span>{" "}
                  as a{" "}
                  <span className="font-semibold">
                    {userInfo?.role
                      ? userInfo.role.charAt(0).toUpperCase() +
                        userInfo.role.slice(1)
                      : ""}
                  </span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Setting Up..." : "Complete Setup"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
