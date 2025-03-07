"use client";

import { useState } from "react";
import Drivers from "@/components/dashboard/Drivers";
import Vehicles from "@/components/dashboard/Vehicles";
import Shifts from "@/components/dashboard/Shifts";
import Fuels from "@/components/dashboard/Fuels";
import Insights from "@/components/dashboard/Insights";
import Profile from "@/components/dashboard/Profile";
import Packages from "@/components/dashboard/Packages";


const components: Record<string, React.FC> = {
  drivers: Drivers,
  vehicles: Vehicles,
  shifts: Shifts,
  fuels: Fuels,
  packages:Packages,
  insights: Insights,
  profile: Profile,
  
};

export function useSelectedComponent() {
  const [selectedComponent, setSelectedComponent] =
    useState<keyof typeof components>("drivers");

  const ComponentToRender = components[selectedComponent];

  return { selectedComponent, setSelectedComponent, ComponentToRender };
}
