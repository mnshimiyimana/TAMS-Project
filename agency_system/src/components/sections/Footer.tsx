"use client";

import * as React from "react";
import Image from "next/image";
import Logo from "../../../public/testimonials/FooterLogo.svg";

export function Footer() {
    const rows = 5;
  return (
    <footer className="bg-[#f2f6f6] w-full py-12 md:px-4 px-8">
      <div className="max-w-[1200px] mx-auto flex flex-wrap justify-between items-start gap-x-6 gap-y-8">

        <div className="flex flex-col justify-center">
          <Image src={Logo} alt="Company Logo" width={120} height={40} />
          <p className="mt-4 text-gray-700 text-lg font-semibold">
            Book your trip in minutes, get full <br /> control for much longer.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Agencies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Services
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">More Titles</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-gray-900">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Drivers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Shifts
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end justify-end w-full md:w-auto">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex justify-center">
              {Array.from({ length: i + 1 }).map((_, j) => (
                <span
                  key={j}
                  className={`text-2xl font-normal mx-1 ${
                    i === 0 ? "text-red-500" : i === rows - 1 ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  +
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-300 mt-8 pt-4 text-center text-gray-600 text-sm">
        All rights reserved &copy; TAMS 2025
      </div>
    </footer>
  );
}
