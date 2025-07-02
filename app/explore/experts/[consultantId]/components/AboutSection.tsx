import { User } from "@prisma/client";
import { TConsultantProfile } from "@/types/consultant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserIcon,
  BookOpenIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react";

interface AboutSectionProps {
  userDetails: User;
  consultantDetails: TConsultantProfile;
}

export function AboutSection({
  userDetails,
  consultantDetails,
}: AboutSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* About Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-lg">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">About</h3>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
            {userDetails.name} is a seasoned {consultantDetails.specialization}{" "}
            with{" "}
            <span className="font-semibold text-gray-900">
              {consultantDetails.experience}
            </span>{" "}
            of experience in the{" "}
            <span className="font-semibold text-gray-900">
              {consultantDetails.domain.name}
            </span>{" "}
            sector.
          </p>
        </CardContent>
      </Card>

      {/* Education & Background Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Education & Background
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            {userDetails.name} has experience across multiple industries, with a
            particular focus on specialized domains.
          </p>
          <div className="flex flex-wrap gap-2">
            {consultantDetails?.subDomains?.map(
              (domain: { name: string }, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-gray-400 text-gray-700 hover:bg-gray-100 px-3 py-1.5"
                >
                  {domain.name}
                </Badge>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills & Specialties Card - Full Width */}
      <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-lg">
              <TargetIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Skills & Specialties
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            {userDetails.name} focuses on delivering expertise across multiple
            specialized areas:
          </p>
          <div className="flex flex-wrap gap-3">
            {consultantDetails.tags?.map(
              (tag: { name: string }, index: number) => (
                <Badge
                  key={index}
                  className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium"
                >
                  <TrendingUpIcon className="w-4 h-4 mr-2" />
                  {tag.name}
                </Badge>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
