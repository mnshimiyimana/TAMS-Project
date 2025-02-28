"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AuthBackground from "@/components/sections/AuthBackground";
import { signIn, clearError } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    // Clear any previous errors when mounting the component
    dispatch(clearError());

    // If user is already logged in, redirect to dashboard
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (user) {
      toast.success("Signed in successfully!");
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data: SignInFormData) => {
    dispatch(signIn(data));
  };

  return (
    <div className="min-h-screen flex">
      <AuthBackground />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
        <div className="w-full max-w-md p-8">
          <div className="py-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Sign In
            </h1>
            <p className="text-sm text-gray-700">
              Welcome back, enter your credentials to continue
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 text-gray-700"
          >
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Password"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <Link href="/auth/reset">
                <span className="text-green-600 hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

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
