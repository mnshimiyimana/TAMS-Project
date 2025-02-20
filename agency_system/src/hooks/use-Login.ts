import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { signIn } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogin() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      localStorage.setItem("token", user.token);
      setIsLoggedIn(true);
      toast.success("Signed in successfully!");

      router.push("/dashboard");
    }
  }, [user, router]);

  const login = async (email: string, password: string) => {
    dispatch(signIn({ email, password }));
  };

  return { login, isLoading, error, isLoggedIn };
}
