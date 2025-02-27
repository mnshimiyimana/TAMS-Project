"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook to protect routes that require authentication
 * @param redirectTo - Where to redirect unauthenticated users
 * @param options - Additional options like requiring specific roles
 */
export function useAuthProtection(
  redirectTo: string = "/auth/sign-in",
  options: { requiredRoles?: string[] } = {}
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Check if token exists
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        toast.error("Please log in to access this page");
        router.push(redirectTo);
        return;
      }

      // Check role requirements if specified
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        const userData = localStorage.getItem("user");
        
        if (!userData) {
          setIsAuthenticated(false);
          toast.error("User data not found. Please log in again.");
          router.push(redirectTo);
          return;
        }

        try {
          const user = JSON.parse(userData);
          if (!options.requiredRoles.includes(user.role)) {
            setIsAuthenticated(false);
            toast.error("You don't have permission to access this page");
            router.push("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsAuthenticated(false);
          toast.error("Invalid user data. Please log in again.");
          router.push(redirectTo);
          return;
        }
      }

      setIsAuthenticated(true);
    };

    checkAuth();
    setIsLoading(false);
  }, [redirectTo, router, options.requiredRoles]);

  return { isLoading, isAuthenticated };
}