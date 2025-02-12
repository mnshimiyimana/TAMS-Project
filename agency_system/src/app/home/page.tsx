
import React from "react";
import Navbar from "@/components/sections/Navbar";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";


export default function page() {
  
  return (
    <div>
      <Navbar/>
      <Services />
      <About />
    </div>
  );
}
