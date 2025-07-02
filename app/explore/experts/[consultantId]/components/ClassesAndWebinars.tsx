import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassPlan, WebinarPlan } from "@prisma/client";
import {
  CalendarIcon,
  ClockIcon,
  Users2Icon,
  BookOpenIcon,
  GlobeIcon,
  DollarSignIcon,
  GraduationCapIcon,
  PackageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ClassesAndWebinarsProps {
  classPlans: ClassPlan[];
  webinarPlans: WebinarPlan[];
}

export const ClassesAndWebinars: React.FC<ClassesAndWebinarsProps> = ({
  classPlans,
  webinarPlans,
}) => {
  const router = useRouter();
  const renderClassPlanCard = (classPlan: ClassPlan) => (
    <Card
      key={classPlan.id}
      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1"
    >
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
            {classPlan.title}
          </h3>
          {classPlan.certificateProvided && (
            <Badge className="bg-gray-900 text-white text-xs font-medium">
              Certificate
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-300 text-gray-700"
          >
            <GlobeIcon className="w-3 h-3" />
            {classPlan.language}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-300 text-gray-700"
          >
            <GraduationCapIcon className="w-3 h-3" />
            {classPlan.level}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-300 text-gray-700"
          >
            <Users2Icon className="w-3 h-3" />
            {classPlan.maxParticipants} participants
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Schedule TBA</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span>
              {classPlan.durationInMonths} month
              {classPlan.durationInMonths > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">
          {classPlan.description}
        </p>

        <div className="space-y-4 mb-6 flex-grow">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <BookOpenIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Prerequisites
              </p>
              <p className="text-sm text-gray-600">{classPlan.prerequisites}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <PackageIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Materials</p>
              <p className="text-sm text-gray-600">
                {classPlan.materialProvided}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DollarSignIcon className="w-5 h-5 text-gray-900" />
            <span className="text-2xl font-bold text-gray-900">
              ${classPlan.price}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-auto border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 font-semibold py-3"
          onClick={() =>
            router.push(`/explore/programs/plans/classes/${classPlan.id}`)
          }
        >
          Register Now
        </Button>
      </CardContent>
    </Card>
  );

  const renderWebinarPlanCard = (webinarPlan: WebinarPlan) => (
    <Card
      key={webinarPlan.id}
      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1"
    >
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
            {webinarPlan.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-300 text-gray-700"
          >
            <GlobeIcon className="w-3 h-3" />
            {webinarPlan.language}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-300 text-gray-700"
          >
            <GraduationCapIcon className="w-3 h-3" />
            {webinarPlan.level}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-gray-300 text-gray-700"
          >
            <Users2Icon className="w-3 h-3" />
            {webinarPlan.maxParticipants} participants
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Schedule TBA</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span>
              {webinarPlan.durationInHours} hour
              {webinarPlan.durationInHours > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">
          {webinarPlan.description}
        </p>

        <div className="space-y-4 mb-6 flex-grow">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <BookOpenIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Prerequisites
              </p>
              <p className="text-sm text-gray-600">
                {webinarPlan.prerequisites}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <PackageIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Materials</p>
              <p className="text-sm text-gray-600">
                {webinarPlan.materialProvided}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <DollarSignIcon className="w-5 h-5 text-gray-900" />
            <span className="text-2xl font-bold text-gray-900">
              ${webinarPlan.price}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-auto border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 font-semibold py-3"
          onClick={() =>
            router.push(`/explore/programs/plans/webinars/${webinarPlan.id}`)
          }
        >
          Register Now
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {classPlans.length > 0 && (
        <section className="space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Class Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Comprehensive learning programs designed to develop your skills
              over time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {classPlans.map((classPlan) => renderClassPlanCard(classPlan))}
          </div>
        </section>
      )}

      {webinarPlans.length > 0 && (
        <section className="space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Webinar Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Interactive sessions focused on specific topics and immediate
              learning outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {webinarPlans.map((webinarPlan) =>
              renderWebinarPlanCard(webinarPlan),
            )}
          </div>
        </section>
      )}
    </div>
  );
};
