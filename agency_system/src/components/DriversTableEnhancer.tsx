"use client";

import React, { useEffect } from "react";

interface DriversTableEnhancerProps {
  children: React.ReactNode;
  onRefresh: () => void;
}

const DriversTableEnhancer: React.FC<DriversTableEnhancerProps> = ({
  children,
  onRefresh,
}) => {
  useEffect(() => {
    const handleShiftUpdate = () => {
      console.log("Drivers table refreshing due to shift update");
      onRefresh();
    };

    window.addEventListener("drivers-data-refresh", handleShiftUpdate);
    window.addEventListener("shift_updated", handleShiftUpdate);

    return () => {
      window.removeEventListener("drivers-data-refresh", handleShiftUpdate);
      window.removeEventListener("shift_updated", handleShiftUpdate);
    };
  }, [onRefresh]);

  return <>{children}</>;
};

export default DriversTableEnhancer;
