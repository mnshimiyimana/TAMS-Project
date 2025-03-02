"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ReactNode } from "react";
import { hasPermission, UserRole } from "@/utils/permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedProps {
  children: ReactNode;
  requiredFeature: string;
  fallback?: ReactNode;
}

const Protected = ({ children, requiredFeature, fallback }: ProtectedProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const userRole = user?.role as UserRole | undefined;

  const hasAccess = hasPermission(userRole, requiredFeature);

  useEffect(() => {
    if (!hasAccess && !fallback) {
      router.push("/dashboard");
    }
  }, [hasAccess, router, fallback]);

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-full p-10">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this feature
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default Protected;
