"use client";

import React from "react";
import { AppSidebar } from "@/components/dashboard/Sidebar";
import { BellIcon, UserRound } from "lucide-react";
import { useSelectedComponent } from "@/hooks/useSelectedComponent";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const { selectedComponent, setSelectedComponent, ComponentToRender } =
    useSelectedComponent();

  return (
    <SidebarProvider className="flex">
      <div className="flex h-screen  ">
        <AppSidebar onSelect={setSelectedComponent} selected={selectedComponent} />
        <SidebarTrigger />
        <div>
          <div className="flex justify-end p-7">
            <div className="flex items-end gap-4">
              <BellIcon className="cursor-pointer" />
              <UserRound className="cursor-pointer" />
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center p-10">
            <ComponentToRender />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
