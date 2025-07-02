import {
  StarIcon,
  MapPinIcon,
  BriefcaseIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@prisma/client";
import { TConsultantProfile } from "@/types/consultant";
import Image from "next/image";

interface ProfileHeaderProps {
  userDetails: User;
  consultantDetails: TConsultantProfile;
}

export function ProfileHeader({
  userDetails,
  consultantDetails,
}: ProfileHeaderProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* Profile Image */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative">
              <Image
                src={userDetails.image || "/placeholder.svg"}
                alt={userDetails.name || "Profile"}
                width={150}
                height={150}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                {userDetails.name}
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                {consultantDetails.specialization}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={`${i}-${consultantDetails.rating}`}
                    className={`w-5 h-5 ${
                      i < consultantDetails.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {consultantDetails.rating}.0
              </span>
              <span className="text-gray-500">(150+ reviews)</span>
            </div>

            {/* Key Stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  {consultantDetails.experience}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCapIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  {consultantDetails.domain.name}
                </span>
              </div>
              {userDetails.currentTimezone && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">
                    {userDetails.currentTimezone}
                  </span>
                </div>
              )}
            </div>

            {/* Specialization Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <Badge
                variant="secondary"
                className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium"
              >
                {consultantDetails.specialization}
              </Badge>
              {consultantDetails?.subDomains
                ?.slice(0, 2)
                .map((domain: { name: string }, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 text-sm"
                  >
                    {domain.name}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
