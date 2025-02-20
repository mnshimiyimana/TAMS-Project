"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { signUp } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";

const signUpSchema = z
  .object({
    agencyName: z.string().min(3, "Agency name must be at least 3 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    location: z.string().min(5, "Location is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
    role: z.enum(["admin", "manager", "fuel"], {
      required_error: "Role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function useSignUpForm() {
    const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: any) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      agencyName: "",
      username: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await dispatch(signUp(data)).unwrap();
      toast.success("Sign-up successful! Please log in.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        toast.error("Sign-up failed: " + err.message);
      } else {
        console.error("Unknown error:", err);
        toast.error("Sign-up failed.");
      }
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    errors,
    isLoading,
    onSubmit,
  };
}
