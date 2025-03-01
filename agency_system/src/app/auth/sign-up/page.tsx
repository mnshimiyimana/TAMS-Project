"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { signUp, clearError } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/sections/AuthBackground";
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
import Link from "next/link";
const signUpSchema = z
  .object({
    agencyName: z.string().min(3, "Agency name must be at least 3 characters"),
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
    role: z.enum(["admin", "manager", "fuel"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
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

  useEffect(() => {
    dispatch(clearError());
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await dispatch(signUp(data)).unwrap();
      toast.success("Sign-up successful! Please log in.");
      reset();
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 1500);
    } catch (err) {
      console.error("Sign-up failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthBackground />

      <div className="w-full lg:w-1/2 px-8 lg:px-16 lg:py-40 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-700">
            Create an account to manage your transport agency
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                {...register("agencyName")}
                placeholder="Enter agency name"
              />
              {errors.agencyName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.agencyName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username </Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+123 456 7890"
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location </Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role </Label>
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
                  <SelectItem value="fuel">Fuel</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm password"
                autoComplete="new-password"
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

          <div className="flex justify-between py-4">
            <Link href="/auth/sign-in">
              <Button variant="outline" type="button" className="w-auto px-6">
                Back to Login
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-auto px-6 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
