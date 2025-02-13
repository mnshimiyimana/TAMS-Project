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
    <div className="flex items-center gap-4 p-4 rounded-lg  bg-white">
      <div className={`p-4 rounded-md ${bgColor} flex justify-center items-center`}>
        <Image src={icon} alt={title} width={48} height={28} />
      </div>

      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 md:text-base text-sm">{description}</p>
      </div>
    </div>
  );
};

export default FeatureItem;
