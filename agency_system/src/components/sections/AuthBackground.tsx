import Image from "next/image";
import BgImage from "../../../public/auth/bgImage.png"

const AuthBackground = () => {
  return (
    <div className="hidden lg:flex w-1/2 relative">
      <Image
        src={BgImage}
        alt="Authentication Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-6">
        <div className="text-center px-32">
          <h1 className="text-5xl font-semibold text-start pb-2">
            Transport Agencies Management System
          </h1>
          <p className="text-sm text-start">
            Real-time ticketing capabilities, route planning, and fleet
            management
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthBackground;
