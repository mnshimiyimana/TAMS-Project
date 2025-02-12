"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import logo from "../../../public/logo.png";
import bgImage from "../../../public/bg_image.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="relative w-full bg-cover bg-center py-4 px-6"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-white text-2xl font-bold">
          <Image src={logo} alt="Logo" width={150} height={50} />
        </Link>

        <ul className="hidden md:flex space-x-8 text-white text-lg">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/services" className="hover:underline">
              Services
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <button className="text-green-500 font-medium px-4 py-2">
              Login
            </button>
          </Link>

          <Link href="/signup">
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={30} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black bg-opacity-80 text-white p-5 flex flex-col space-y-4">
          <Link href="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/services" onClick={() => setIsOpen(false)}>
            Services
          </Link>
          <Link href="/about" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          {/* Mobile Login Button */}
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <button className="text-green-500 font-medium px-4 py-2 w-full">
              Login
            </button>
          </Link>

          {/* Mobile Signup Button */}
          <Link href="/signup" onClick={() => setIsOpen(false)}>
            <button className="bg-green-500 text-white px-6 py-2 w-full rounded-lg">
              Sign Up
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
