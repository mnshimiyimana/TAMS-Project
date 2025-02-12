import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <Card className="w-80 shadow-lg">
      <CardHeader>
        <p>{icon}</p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {/* <CardContent>
        <p>{content}</p>
      </CardContent> */}
    </Card>
  );
};

export default ServiceCard;
