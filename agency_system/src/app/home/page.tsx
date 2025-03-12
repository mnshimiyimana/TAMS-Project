"use client";

import React from "react";
import Navbar from "@/components/sections/Navbar";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import { Testimonial } from "@/components/sections/Testimonial";
import { Subscribe } from "@/components/sections/Subscribe";
import { Footer } from "@/components/sections/Footer";

export default function page() {
  return (
    <div>
      <Navbar />
      <section id="services">
        <Services />
      </section>
      <section id="about">
        <About />
      </section>
      <Testimonial />
      <section id="contact">
        <Subscribe />
        <Footer />
      </section>
    </div>
  );
}
