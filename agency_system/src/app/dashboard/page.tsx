"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/Sidebar";
import { BellIcon, UserRound } from "lucide-react";
import { useSelectedComponent } from "@/hooks/useSelectedComponent";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { signOut } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import Protected from "@/components/Protected";
import { hasPermission } from "@/utils/permissions";

// The main dashboard page component
export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuthProtection("/auth/sign-in");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { selectedComponent, setSelectedComponent, ComponentToRender } = useSelectedComponent();

  useEffect(() => {
    if (user?.role === "superadmin") {
      router.push("/superadmin");
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    dispatch(signOut());
    toast.success("Logged out successfully");
    router.push("/auth/sign-in");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role === "superadmin") {
    return null;
  }

  return (
    <SidebarProvider className="flex">
      <div className="flex h-screen">
        <AppSidebar
          onSelect={setSelectedComponent}
          selected={selectedComponent}
        />
        <SidebarTrigger />
        <div className="flex-1 bg-gray-50 sticky top-0">
          <div className="w-full flex justify-between items-center p-5 bg-white shadow-sm">
            <div></div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <BellIcon className="cursor-pointer text-gray-600 hover:text-green-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
                <UserRound className="text-gray-600" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Suspense fallback={<div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>}>
              {/* This client component handles the URL parameters */}
              <ClientFeatureWrapper 
                user={user} 
                selectedComponent={selectedComponent}
                setSelectedComponent={setSelectedComponent}
                ComponentToRender={ComponentToRender}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

// This internal component handles the useSearchParams
import { useSearchParams } from "next/navigation";

function ClientFeatureWrapper({ 
  user, 
  selectedComponent, 
  setSelectedComponent, 
  ComponentToRender 
}: { 
  user: any;
  selectedComponent: string;
  setSelectedComponent: (component: string) => void;
  ComponentToRender: React.FC;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (!user?.role) return;

    const featureParam = searchParams.get("feature");
    if (featureParam) {
      const validFeatures = [
        "drivers",
        "vehicles",
        "shifts",
        "packages",
        "fuels",
        "profile",
        "insights",
      ];

      if (
        validFeatures.includes(featureParam) &&
        hasPermission(user.role as any, featureParam)
      ) {
        setSelectedComponent(featureParam);
      }
    }
  }, [searchParams, user, setSelectedComponent]);

  // Handle permissions check for selected component
  useEffect(() => {
    if (!user?.role) return;

    if (!hasPermission(user.role as any, selectedComponent)) {
      const firstPermitted = [
        "drivers",
        "vehicles",
        "shifts",
        "fuels",
        "profile",
        "packages",
        "insights",
      ].find((feature) => hasPermission(user.role as any, feature));

      if (firstPermitted) {
        setSelectedComponent(firstPermitted);
      }
    }
  }, [user, selectedComponent, setSelectedComponent]);

  return (
    <Protected requiredFeature={selectedComponent}>
      <ComponentToRender />
    </Protected>
  );
}