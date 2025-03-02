"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const passwordSchema = z
  .object({
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

type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  agencyName: string;
}

export default function SetupPassword({
  params,
}: {
  params: { token: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();
  const { token } = params;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    async function verifyToken() {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/auth/verify-setup-token/${token}`
        );

        setUserInfo(response.data.user);
        setError(null);
      } catch (err: any) {
        console.error("Token verification error:", err);
        setError(
          err.response?.data?.message ||
            "This password setup link is invalid or has expired."
        );
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `http://localhost:5000/api/auth/complete-setup/${token}`,
        { password: data.password }
      );

      setIsComplete(true);
      toast.success("Password set successfully!");
    } catch (err: any) {
      console.error("Setup error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to set password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthBackground />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
        <div className="w-full max-w-md p-8">
          <div className="py-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Set Up Your Password
            </h1>
            <p className="text-sm text-gray-700">
              {isLoading
                ? "Verifying your setup link..."
                : error
                ? "There was a problem with your setup link."
                : isComplete
                ? "Your password has been set up successfully!"
                : `Welcome, ${userInfo?.username}! Please create a secure password for your account.`}
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
                Your password has been set successfully. You can now log in to
                your account.
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

              <p className="text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase,
                lowercase letters and numbers.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Setting Up..." : "Set Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
