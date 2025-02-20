"use client";

import { LogOut, UserPen, Fuel, UsersRound, BusFront, ChartColumnIncreasing, Blinds } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const items = [
  { title: "Drivers", key: "drivers", icon: UsersRound },
  { title: "Vehicles", key: "vehicles", icon: BusFront },
  { title: "Shifts", key: "shifts", icon: Blinds },
  { title: "Fuels", key: "fuels", icon: Fuel },
  { title: "Insights", key: "insights", icon: ChartColumnIncreasing },
  { title: "Profile", key: "profile", icon: UserPen },
];

export function AppSidebar({ onSelect }: { onSelect: (key: string) => void }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/sign-in";
  };

  return (
      <Sidebar className="flex flex-col h-screen text-black">
        <SidebarContent className="flex flex-col flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-2xl text-green-500 py-10">
              TAMS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild>
                      <button onClick={() => onSelect(item.key)} className="flex items-center gap-3 w-full text-left">
                        <item.icon />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {/* Logout Button */}
        <div className="p-4 border-t flex items-center gap-3 cursor-pointer" onClick={handleLogout}>
          <LogOut />
          <span>Logout</span>
        </div>
      </Sidebar>
  );
}
