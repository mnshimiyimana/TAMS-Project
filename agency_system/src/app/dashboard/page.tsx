"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/Sidebar";
import { BellIcon, UserRound } from "lucide-react";
import { useSelectedComponent } from "@/hooks/useSelectedComponent";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { signOut } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { RootState } from "@/redux/store"; // Import the RootState type to access Redux state

export default function DashboardPage() {
  const { selectedComponent, setSelectedComponent, ComponentToRender } =
    useSelectedComponent();
  const { isLoading, isAuthenticated } = useAuthProtection("/auth/sign-in");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user); // Access the user data from Redux store

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully");
    router.push("/auth/sign-in");
  };

  // Display loading state or redirect if not authenticated
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useAuthProtection hook will handle redirection
  }

  return (
    <SidebarProvider className="flex">
      <div className="flex h-screen">
        <AppSidebar
          onSelect={setSelectedComponent}
          selected={selectedComponent}
        />
        <SidebarTrigger />
        <div className="flex-1 bg-gray-50">
          <div className="flex justify-end p-5 bg-white shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative">
                <BellIcon className="cursor-pointer text-gray-600 hover:text-green-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <UserRound className="text-gray-600" />
                <div className="hidden md:block">
                  {/* Display the username and role dynamically */}
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <ComponentToRender />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
