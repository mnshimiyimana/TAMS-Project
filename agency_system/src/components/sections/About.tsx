import React from "react";
import Calendar from "../../../public/about/calendar.svg";
import Chart from "../../../public/about/chart.svg";
import History from "../../../public/about/history.svg";
import Map from "../../../public/about/map.svg";
import Selection from "../../../public/about/selection.svg";
import Taxi from "../../../public/about/taxi.svg";
import WaterSport from "../../../public/about/water-sport.svg";
import Cards from "../Cards";
import WorldMap from "../../../public/about/world_map.png";
import FeatureItem from "../FeatureItem";

export default function page() {
  const abouts = [
    {
      title: "15+",
      description: "Agencies",
      icon: Calendar,
      width: "md:w-56 sm:w-40",
      centered: true,
      bolded: true,
    },
    {
      title: "15k+",
      description: "Happy Clients",
      icon: Chart,
      width: "md:w-56 sm:w-40",
      centered: true,
      bolded: true,
    },
    {
      title: "650+",
      description: "Drivers",
      icon: Map,
      width: "md:w-56 sm:w-40",
      centered: true,
      bolded: true,
    },
    {
      title: "2k+",
      description: "Travel History",
      icon: History,
      width: "md:w-56 sm:w-40",
      centered: true,
      bolded: true,
    },
  ];

  const features = [
    {
      icon: Selection,
      title: "Choose Destination",
      description:
        "Book your trips quickly and easily with our platform and wait no time on the waiting lines",
      bgColor: "bg-[#f0bb1f]",
    },
    {
      icon: WaterSport,
      title: "Make Payment",
      description:
        "Quick payments with your transactions are well secured and encrypted.",
      bgColor: "bg-[#f15a2b]",
    },
    {
      icon: Taxi,
      title: "Reach Destination on Selected Date",
      description:
        "We're here to make your journey preparation as smooth as possible",
      bgColor: "bg-[#006380]",
    },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="relative w-full h-full bg-[#f2f6f6]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center py-4 px-16"
          style={{ backgroundImage: `url(${WorldMap.src})` }}
        ></div>

        <div className=" relative flex flex-col items-center gap-8 py-28 lg:px-0 px-10">
          <h1 className="text-3xl font-bold">
            We always try to give you the best service
          </h1>
          <p className="text-sm">
            We always try to make our customer Happy. We provide all kind of
            facilities. Your Satisfaction is our main priority.
          </p>
          <div className="grid grid-cols-2 text-bold items-center md:grid-cols-2 lg:grid-cols-4 gap-20">
            {abouts.map((service, index) => (
              <Cards
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                width={service.width}
                centered={service.centered}
                bolded={service.bolded}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:py-20 py-20" id="Discover">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold">Booking Your Tickets</h1>
          <p className="text-sm text-gray-600 md:px-0 px-10 md:pt-0 pt-3">
            The only convenient way to book your tickets easily and faster
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 px-6 md:px-28 ">
          <div className="md:py-10 w-full">
            <div className="flex flex-col gap-6">
              {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
              ))}
            </div>
          </div>
          <div className="hidden lg:flex h-96 w-full bg-radiant-blue items-center"></div>
        </div>
      </div>
    </div>
  );
}
