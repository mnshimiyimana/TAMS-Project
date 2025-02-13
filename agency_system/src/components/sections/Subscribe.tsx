"use client";

import * as React from "react";
import Image from "next/image";
import Mail from "../../../public/testimonials/mail.svg";

export function Subscribe() {
  return (
    <div className=" py-16 px-4 lg:px-0 md:px-4">
      <div className="max-w-4xl mx-auto text-center bg-[#ecfffb] py-20 rounded-2xl rounded-tl-3xl ">
        <h2 className="lg:text-3xl md:text-2xl text-xl font-semibold mb-4 text-gray-700">
          Subscribe to get information, latest news, and other interesting
          offers about agency management.
        </h2>

        <div className="flex justify-center items-center md:py-8 py-4 md:px-0 px-4 space-x-4 max-w-2xl mx-auto">
          <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 w-full max-w-md">
            <Image src={Mail} alt="Mail Icon" width={24} height={24} className="mr-3" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full  p-2 outline-none border-none"
            />
          </div>

          <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
