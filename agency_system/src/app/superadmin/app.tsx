"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import SuperAdminPortal from "@/components/superAdminPortal";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function SuperAdminPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    if (user.role !== "superadmin") {
      toast.error("Access denied. Superadmin permissions required.");
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "superadmin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <SidebarProvider className="flex">
      <div className="min-h-screen bg-gray-50 p-6">
        <SuperAdminPortal />
      </div>
    </SidebarProvider>
  );
}
