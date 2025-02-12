
import React from "react";
import calendars from "../../../public/calendars.svg";
import Hotel from "../../../public/carbon_hotel.svg";
import plane from "../../../public/cil_paper-plane.svg";
import Cards from "../Cards";



export default function page() {
  const services = [
    {
      title: "Drivers and vehicles management System",
      description:
        "We help you manage and coordinate the operationsin your agency.",
      icon: calendars,
    },
    {
      title: "Fuel Management",
      description:
        "You can easily book your according to your budget hotel by our website.",
      icon: Hotel,
    },
    {
      title: "Shift and Round Management",
      description:
        "We provide you the best plan within a short time explore more.",
      icon: plane,
    },
  ];
  return (
    <div>
      <div className="flex flex-col items-center gap-8 py-20">
        <h1 className="text-3xl font-bold">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {services.map((service, index) => (
            <Cards
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
