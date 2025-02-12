import React from "react";
import Image from "next/image";

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  bgColor?: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  bgColor = "bg-blue-500",
}) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg md:w-1/2 bg-white">
      <div className={`p-3 rounded-md ${bgColor} flex justify-center items-center`}>
        <Image src={icon} alt={title} width={24} height={24} />
      </div>

      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default FeatureItem;
