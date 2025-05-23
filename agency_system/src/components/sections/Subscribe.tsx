"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import Mail from "../../../public/testimonials/mail.svg";

export function Subscribe() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status.type === "success" && status.message) {
      timeoutId = setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      let response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.status === 503) {
        setStatus({
          type: "info",
          message: "Our service is starting up. Please try again in a moment.",
        });

        await new Promise((resolve) => setTimeout(resolve, 5000));

        setStatus({ type: "", message: "" });

        response = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
      }

      let data;

      // Try to parse the response as JSON
      try {
        data = await response.json();
      } catch (error) {
        if (response.status === 502 || response.status === 503) {
          throw new Error(
            "Our service is starting up. Please try again in a minute."
          );
        } else {
          throw new Error("Received an invalid response from the server.");
        }
      }

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setStatus({
        type: "success",
        message: "Thank you for subscribing!",
      });
      setEmail("");
    } catch (error: unknown) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to subscribe. Please try again in a minute.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 px-4 lg:px-0 md:px-4">
      <div className="max-w-4xl mx-auto text-center bg-[#ecfffb] py-20 rounded-2xl rounded-tl-3xl">
        <h2 className="lg:text-3xl md:text-2xl text-xl font-semibold mb-4 text-gray-700">
          Subscribe to get information, latest news, and other interesting
          offers about agency management.
        </h2>

        <form
          onSubmit={handleSubmit}
          className="md:py-8 py-4 md:px-0 px-4 max-w-2xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 w-full max-w-md">
              <Image
                src={Mail}
                alt="Mail Icon"
                width={24}
                height={24}
                className="mr-3"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 outline-none border-none"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300 w-full md:w-auto disabled:bg-green-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </div>

          {status.message && (
            <div
              className={`mt-4 ${
                status.type === "error"
                  ? "text-red-500"
                  : status.type === "info"
                  ? "text-blue-500"
                  : "text-green-600"
              } transition-opacity duration-300`}
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
