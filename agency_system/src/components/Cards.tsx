import React from "react";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardProps {
  icon: string;
  title: string;
  description: string;
  width?: string;
  centered?: boolean;
  bolded?: boolean;
}

const Cards: React.FC<CardProps> = ({
  title,
  description,
  icon,
  width = "lg:w-96 w-80",
  centered = false,
  bolded = false,
}) => {
  return (
    <Card className={`${width} shadow-lg `}>
      <CardHeader className={`md:p-5 p-4 space-y-4 ${centered ? "text-center flex justify-center items-center flex-col" : ""}`}>
        <Image src={icon} alt={title} width={50} height={50} />
        <CardTitle className={`${bolded ? "text-xl text-bold" : ""}`}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {/* <CardContent>
        <p>{content}</p>
      </CardContent> */}
    </Card>
  );
};

export default Cards;
