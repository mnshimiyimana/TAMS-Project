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
      className="relative w-full h-screen bg-cover bg-center py-4 px-16"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="container mx-auto flex items-center justify-between relative z-10">
        <Link href="/" className="text-white text-xl font-bold">
          <Image src={logo} alt="Logo" width={100} height={50} />
        </Link>

        <ul className="hidden md:flex space-x-8 font-normal text-white text-base">
          <li>
            <Link
              href="/"
              className="hover:underline decoration-4 hover:decoration-green-500"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="hover:underline decoration-4 hover:decoration-green-500"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="hover:underline decoration-4 hover:decoration-green-500"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:underline decoration-4 hover:decoration-green-500"
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <button className="text-green-500 bg-white rounded-lg font-medium px-4 py-2">
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

      <div className="absolute inset-0 flex items-center justify-center text-center text-white">
        <div className="md:px-20 px-8">
          <h1 className="text-4xl font-bold mb-4">
            Transport agencies management system
          </h1>
          <p className="text-lg mb-6">
            Manage your buses, vehicles, drivers, fuels, shifts with us with a
            booking system on top. Join us and experience the fastest services
            ever.
          </p>
          <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Discover More
          </button>
        </div>
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
            <button className="text-green-500  bg-white rounded-lg font-medium px-4 py-2 w-full">
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
