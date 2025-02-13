"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Woman from "../../../public/testimonials/Woman1.png";
import Man from "../../../public/testimonials/Man1.png";
import Guy from "../../../public/testimonials/Man2.png";
import Side1 from "../../../public/testimonials/Side1.png";
import Side2 from "../../../public/testimonials/Side2.png";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


const testimonials = [
  {
    name: "Jane Walter",
    role: "CEO, TechCorp",
    message:
      "This platform transformed our business. Highly recommended! It has simplified many processes and made my team more efficient.",
    image: Woman,
  },
  {
    name: "Jalen Smith",
    role: "Marketing Director",
    message:
      "Exceptional service and seamless experience! The support team is always available and the platform is intuitive and easy to use.",
    image: Guy,
  },
  {
    name: "David Brown",
    role: "Freelancer",
    message:
      "A game-changer in the industry. 10/10 experience! I was able to find new clients quickly and manage my projects with ease.",
    image: Man,
  },
];

export function Testimonial() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <div className="bg-[#f2f6f6] py-16 relative max-w-screen-2xl mx-auto">
      <div className="absolute md:flex hidden top-0 left-0 z-10">
        <Image src={Side1} alt="Top Left" width={100} height={100} />
      </div>
      <div className="absolute md:flex hidden top-0 right-0 z-10 ">
        <Image src={Side2} alt="Top Right" width={100} height={100} />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">
        Our Clients Reviews
      </h1>
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-4xl mx-auto py-12"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="flex">
          {testimonials.map((testimony, index) => (
            <CarouselItem
              key={index}
              className="basis-full flex justify-center"
            >
              <div className="relative p-4">
                <Card className="flex flex-col items-center text-center shadow-lg md:w-full w-60 max-w-md">
                  <div className="w-32 h-32 md:-mt-6 -mt-4 z-10 overflow-hidden rounded-full border-4 border-white shadow-lg mb-4">
                    <Image
                      src={testimony.image}
                      alt={testimony.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <CardContent className="md:p-6">
                    <p className="text-gray-700 text-sm italic">{`"${testimony.message}"`}</p>
                  </CardContent>
                </Card>

                <div className="text-center mt-20 ">
                  <h3 className="font-bold text-lg">{testimony.name}</h3>
                  <p className="text-gray-500 text-sm">{testimony.role}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-white rounded-full shadow-lg hover:bg-gray-200">
          <span className="text-lg text-gray-700">{"<"}</span>
        </CarouselPrevious>
        <CarouselNext className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-white rounded-full shadow-lg hover:bg-gray-200">
          <span className="text-lg text-gray-700">{">"}</span>
        </CarouselNext>
      </Carousel>
    </div>
  );
}
