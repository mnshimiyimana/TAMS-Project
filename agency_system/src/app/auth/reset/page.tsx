"use client";
import React, { useState } from "react";
import AuthBackground from "@/components/sections/AuthBackground";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetPass() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/auth";

  const handleSubmitEmail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/send-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2); // Move to next step
      } else {
        setError(data.error || "Failed to send reset code.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleSubmitCode = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3); // Move to next step
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password reset successful! Please log in.");
        window.location.href = "/auth/sign-in";
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AuthBackground />

      <div className="flex flex-col gap-6 justify-center px-16 pr-40 w-full lg:w-1/2">
        <Fingerprint className="w-20 h-12" />
        <div>
          <h1 className="text-xl font-semibold">Forgot Password?</h1>
          <p className="text-sm text-gray-800">
            {step === 1 && "No worries! We’ll send you reset instructions."}
            {step === 2 && "Enter the verification code sent to your email."}
            {step === 3 && "Enter your new password."}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {step === 1 && (
          <div className="space-y-4 w-full">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-3 text-lg w-full"
            />
            <Button
              className="bg-[#00a651] w-full py-3 hover:bg-green-500"
              onClick={handleSubmitEmail}
              disabled={loading}
            >
              {loading ? "Sending..." : "Reset Password"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 w-full">
            <Label htmlFor="code">Enter Code</Label>
            <Input
              type="text"
              id="code"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="py-3 text-lg w-full"
            />
            <div className="flex justify-between gap-16">
              <Button
                className="bg-[#00a651] hover:bg-green-500 w-full"
                onClick={handleSubmitCode}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
              <Button
                className="text-green-500 hover:bg-[#00a651] hover:text-white bg-white w-full"
                onClick={handleSubmitEmail}
              >
                Resend Code
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 w-full">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="py-3 text-lg w-full"
            />
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="py-3 text-lg w-full"
            />
            <Button
              className="bg-[#00a651] w-full py-3 hover:bg-green-500"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <Link href="/auth/sign-in">
            <span className="flex items-center gap-2 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Go to Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
