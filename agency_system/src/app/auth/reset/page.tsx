"use client";
import React, { useState, useEffect } from "react";
import AuthBackground from "@/components/sections/AuthBackground";
import { Fingerprint, ArrowLeft, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface TokenVerificationResponse {
  message: string;
  email: string;
}

interface ResetResponse {
  message: string;
  error?: string;
}

export default function ResetPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string | undefined;

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [tokenVerified, setTokenVerified] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const API_URL = "https://tams-project.onrender.com/api/auth";

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/verify-reset-token/${token}`, {
        method: "GET",
      });

      const data = (await response.json()) as TokenVerificationResponse;

      if (response.ok) {
        setTokenVerified(true);
        setUserEmail(data.email);
      } else {
        setError((data as any).error || "Invalid or expired reset link.");
      }
    } catch (err) {
      setError("Something went wrong verifying your reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!newPassword) {
      setError("Please enter your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = (await response.json()) as ResetResponse;

      if (response.ok) {
        setSuccess("Password reset successful!");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthBackground />

      <div className="flex flex-col gap-6 justify-center px-8 lg:px-16 lg:pr-40 w-full lg:w-1/2">
        <Fingerprint className="w-16 h-12 text-green-600" />

        <div>
          <h1 className="text-2xl font-semibold">Password Reset</h1>
          {!token && (
            <p className="text-sm text-gray-600 mt-1">
              Check your email for the password reset link
            </p>
          )}
          {token && tokenVerified && (
            <p className="text-sm text-gray-600 mt-1">
              Enter your new password
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {!token && (
          <div className="py-4">
            <div className=" border border-green-200 text-green-700 px-6 py-6 rounded flex flex-col items-center text-center">
              <Mail className="w-12 h-12 mb-3" />
              <h2 className="text-xl font-medium text-black">Check Your Email</h2>
              <p className="mt-2 text-gray-700 text-sm">
                Please check your inbox for the password reset link.
              </p>
            </div>
          </div>
        )}

        {token && loading && (
          <div className="text-center py-8">
            <div className="animate-pulse">Verifying your reset link...</div>
          </div>
        )}

        {token && tokenVerified && (
          <form onSubmit={handleResetPassword} className="space-y-4 w-full">
            {/* {userEmail && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                Resetting password for: <strong>{userEmail}</strong>
              </div>
            )} */}

            <div>
              <Label htmlFor="newPassword" className="text-gray-700">
                New Password
              </Label>
              <Input
                type="password"
                id="newPassword"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                className="mt-1 py-3 text-base w-full"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className="mt-1 py-3 text-base w-full"
              />
            </div>

            <Button
              type="submit"
              className="bg-[#00a651] w-full py-6 hover:bg-green-500 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        {token && !tokenVerified && !loading && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              Your reset link is invalid or has expired. Please contact support to request a new one.
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <Link href="/auth/sign-in">
            <span className="flex items-center gap-2 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}