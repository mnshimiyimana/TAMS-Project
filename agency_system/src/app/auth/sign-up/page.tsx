"use client";

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
import { useSignUpForm } from "@/hooks/use-SignUp";

export default function SignUp() {
  const { register, handleSubmit, setValue, errors, isLoading, onSubmit } =
    useSignUpForm();

  return (
    <div className="flex min-h-screen">
      
      <AuthBackground />

      
      <div className="w-full lg:w-1/2 lg:px-20 px-10 items-center justify-center pt-40">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-700">
            This information will be displayed on your profile.
          </p>
        </div>

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


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Location"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">
                  {errors.location.message}
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
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="fuel">Fuel</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role.message}</p>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>


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
