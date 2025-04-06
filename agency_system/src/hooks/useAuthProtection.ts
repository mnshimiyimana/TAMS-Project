"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserRole, hasPermission } from "@/utils/permissions";

interface AuthProtectionOptions {
  requiredRoles?: UserRole[];
  requiredFeatures?: string[];
}

export function useAuthProtection(
  redirectTo: string = "/auth/sign-in",
  options: AuthProtectionOptions = {}
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredAccess, setHasRequiredAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setHasRequiredAccess(false);
        toast.error("Please log in to access this page");
        router.push(redirectTo);
        return;
      }

      setIsAuthenticated(true);

      const userData = localStorage.getItem("user");
      if (!userData) {
        setHasRequiredAccess(false);
        toast.error("User data not found. Please log in again.");
        router.push(redirectTo);
        return;
      }

      try {
        const user = JSON.parse(userData);
        const userRole = user.role as UserRole;

        if (options.requiredRoles && options.requiredRoles.length > 0) {
          if (!options.requiredRoles.includes(userRole)) {
            setHasRequiredAccess(false);
            toast.error("You don't have permission to access this page");
            router.push("/dashboard");
            return;
          }
        }

        if (options.requiredFeatures && options.requiredFeatures.length > 0) {
          const hasFeatureAccess = options.requiredFeatures.every((feature) =>
            hasPermission(userRole, feature)
          );

          if (!hasFeatureAccess) {
            setHasRequiredAccess(false);
            toast.error("You don't have permission to access this feature");
            router.push("/dashboard");
            return;
          }
        }

        setHasRequiredAccess(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setHasRequiredAccess(false);
        toast.error("Invalid user data. Please log in again.");
        router.push(redirectTo);
      }
    };

    checkAuth();
    setIsLoading(false);
  }, [redirectTo, router, options.requiredRoles, options.requiredFeatures]);

  return { isLoading, isAuthenticated, hasRequiredAccess };
}
