"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Zod validation schema for sign-in
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
      localStorage.setItem("token", result.token); // Store JWT in localStorage

      toast.success("Signed in successfully!");
      // Redirect to dashboard or home page
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
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
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
              className="w-1/3 bg-blue-600"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
