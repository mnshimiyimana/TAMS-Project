"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import logo from "../../../public/logo.png";
import bgImage from "../../../public/bg_image.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      if (scrollY >= windowHeight) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
      }

      const sections = ["home", "services", "about", "contact", "Discover"];

      if (scrollY < windowHeight * 0.5) {
        setActiveLink("home");
        return;
      }

      for (const section of sections) {
        if (section === "home") continue; 

        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const topVisible = rect.top < window.innerHeight * 0.5;
          const bottomVisible = rect.bottom > window.innerHeight * 0.3;

          if (topVisible && bottomVisible) {
            setActiveLink(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setActiveLink("home");
    setIsOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveLink(sectionId);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 py-2 transition-all duration-300 ${
          isScrolledPastHero ? "bg-white shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between lg:px-16 px-8">
          <div className="text-xl font-bold" onClick={scrollToTop}>
            {isScrolledPastHero ? (
              // Text logo when scrolled
              <div className="flex flex-col items-start leading-tight cursor-pointer">
                <span className="text-xl text-black font-laila">Agencies</span>
                <span className="text-xl text-black font-laila">System</span>
              </div>
            ) : (
              <div className="relative h-[50px] w-[100px] cursor-pointer">
                <Image
                  src={logo}
                  alt="Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            )}
          </div>

          <ul className="hidden md:flex space-x-8 font-normal text-base">
            <li>
              <button
                onClick={scrollToTop}
                className={`${
                  isScrolledPastHero ? "text-black" : "text-white"
                } ${
                  activeLink === "home" ? "text-green-500 font-medium" : ""
                } hover:text-green-500 transition-colors duration-300`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("services")}
                className={`${
                  isScrolledPastHero ? "text-black" : "text-white"
                } ${
                  activeLink === "services" ? "text-green-500 font-medium" : ""
                } hover:text-green-500 transition-colors duration-300`}
              >
                Services
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("about")}
                className={`${
                  isScrolledPastHero ? "text-black" : "text-white"
                } ${
                  activeLink === "about" ? "text-green-500 font-medium" : ""
                } hover:text-green-500 transition-colors duration-300`}
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contact")}
                className={`${
                  isScrolledPastHero ? "text-black" : "text-white"
                } ${
                  activeLink === "contact" ? "text-green-500 font-medium" : ""
                } hover:text-green-500 transition-colors duration-300`}
              >
                Contact
              </button>
            </li>
          </ul>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/sign-in">
              <button
                className={`${
                  isScrolledPastHero
                    ? "text-green-500 bg-white border border-green-500"
                    : "text-green-500 bg-white"
                } rounded-lg font-medium px-4 py-2 transition-colors duration-300 hover:bg-green-500 hover:text-white`}
              >
                Login
              </button>
            </Link>

            <Link href="/auth/sign-up">
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300">
                Sign Up
              </button>
            </Link>
          </div>

          <button
            className={`md:hidden ${
              isScrolledPastHero ? "text-black" : "text-white"
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={30} />
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-white text-black shadow-lg p-5 flex flex-col space-y-4 md:hidden">
            <button
              onClick={scrollToTop}
              className={`text-left ${
                activeLink === "home" ? "text-green-500 font-medium" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className={`text-left ${
                activeLink === "services" ? "text-green-500 font-medium" : ""
              }`}
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`text-left ${
                activeLink === "about" ? "text-green-500 font-medium" : ""
              }`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`text-left ${
                activeLink === "contact" ? "text-green-500 font-medium" : ""
              }`}
            >
              Contact
            </button>

            <Link href="/auth/sign-in" onClick={() => setIsOpen(false)}>
              <button className="text-green-500 bg-white border border-green-500 rounded-lg font-medium px-4 py-2 w-full hover:bg-green-500 hover:text-white transition-colors duration-300">
                Login
              </button>
            </Link>

            <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
              <button className="bg-green-500 text-white px-6 py-2 w-full rounded-lg hover:bg-green-600 transition-colors duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>

      <section
        className="relative w-full h-screen bg-cover bg-center max-w-screen-2xl mx-auto"
        style={{ backgroundImage: `url(${bgImage.src})` }}
        id="home"
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>
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
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
              onClick={() => scrollToSection("Discover")}
            >
              Discover More
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Navbar;
