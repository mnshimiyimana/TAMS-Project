"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { signOut } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

import { useAuthCheck } from "@/hooks/superadmin/useAuthCheck";

import SystemOverview from "@/components/superAdmin/SystemOverview";
import AgencyManagement from "@/components/superAdmin/AgencyManagement";
import UserManagement from "@/components/superAdmin/UserManagement";
import FeedbackManagement from "@/components/superAdmin/FeedbackManagement";
import SystemSettings from "@/components/superAdmin/SystemSettings";

export default function SuperAdminPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthorized, isLoading: authLoading } = useAuthCheck();
  const [activeTab, setActiveTab] = useState("system");

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully");
    router.push("/auth/sign-in");
  };

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-bold">SuperAdmin</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <Button
            variant={activeTab === "system" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "system" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("system")}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            System Overview
          </Button>

          <Button
            variant={activeTab === "agencies" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "agencies" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("agencies")}
          >
            <Building2 className="mr-2 h-5 w-5" />
            Agencies
          </Button>

          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "users" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="mr-2 h-5 w-5" />
            User Management
          </Button>

          <Button
            variant={activeTab === "feedback" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "feedback" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("feedback")}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Feedback
          </Button>

          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "settings" ? "bg-green-600 hover:bg-green-700" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-5 w-5" />
            System Settings
          </Button>
        </nav>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start mt-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white p-4 border-b shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {activeTab === "system" && "System Overview"}
              {activeTab === "agencies" && "Agency Management"}
              {activeTab === "users" && "User Management"}
              {activeTab === "feedback" && "Feedback Management"}
              {activeTab === "settings" && "System Settings"}
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500">SuperAdmin</Badge>
              <span className="font-medium">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "system" && <SystemOverview />}
          {activeTab === "agencies" && <AgencyManagement />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "feedback" && <FeedbackManagement />}
          {activeTab === "settings" && <SystemSettings />}
        </main>
      </div>
    </div>
  );
}
