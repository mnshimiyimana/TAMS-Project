import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";

export function useAuthCheck() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const isAuthorized = user?.role === "superadmin";

  useEffect(() => {
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    if (!isAuthorized) {
      toast.error("Access denied. Superadmin permissions required.");
      router.push("/dashboard");
    }
  }, [user, router, isAuthorized]);

  return { user, isAuthorized, isLoading: !user };
}