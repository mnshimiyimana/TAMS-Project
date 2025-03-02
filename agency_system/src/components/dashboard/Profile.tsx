"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import UserProfile from "../profile/UserProfile";
import AdminProfile from "../profile/AdminProfile";
import ManagerProfile from "../profile/ManagerProfile";
import FuelProfile from "../profile/FuelProfile";

export default function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  switch (user?.role) {
    case "admin":
      return <AdminProfile />;
    case "manager":
      return <ManagerProfile />;
    case "fuel":
      return <FuelProfile />;
    case "superadmin":
      return <AdminProfile />;
    default:
      return <UserProfile />;
  }
}