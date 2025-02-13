"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import BgImage from "../../../../public/auth/bgImage.png";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to sign in");

      const result = await response.json();
      localStorage.setItem("token", result.token); // Store JWT

      toast.success("Signed in successfully!");
      // Redirect to dashboard or home
    } catch (error: unknown) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Background Image */}
      <div className="hidden lg:flex w-1/2 relative">
        <Image
          src={BgImage}
          alt="Authentication Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className=""
        />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white p-6">
          <div className=" text-center px-32">
            <h1 className="text-5xl font-semibold text-start pb-2">
              Transport Agencies Management System
            </h1>
            <p className="text-sm text-start">
              Real-time ticketing capabilities, route planning, and fleet
              management
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-10">
        <div className="w-full max-w-md">
          <div className="py-8">
            <h1 className="text-2xl font-semibold  text-gray-800 mb-2">
              Sign In
            </h1>
            <p className="text-sm text-gray-700">
              {" "}
              Welcome back, enter your credentials to continue{" "}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 text-gray-700"
          >
            {/* Email */}
            <div>
              <Label htmlFor="email">Email address or Phone number</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Email or phone number"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link href="/auth/forgot-password">
                <span className="text-green-600 hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-4 text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/sign-up">
              <span className="text-green-600 hover:underline cursor-pointer">
                Sign Up
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
