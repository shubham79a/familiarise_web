import Image from "next/image";
import { User, ConsultationPlan, SubscriptionPlan } from "@prisma/client";
import { TConsultantProfile } from "@/types/consultant";
import { TSlotTiming } from "@/types/slots";
import PricingToggle from "./PricingToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSignIcon, ClockIcon, CalendarIcon } from "lucide-react";

import { PricingOption } from "../defaults";

interface ConsultationPricingProps {
  userDetails: User;
  consultantDetails: TConsultantProfile;
  handleConsultationBooking: () => Promise<void>;
  handleSubscriptionBooking: (option: PricingOption) => Promise<void>;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  renderCalendar: () => JSX.Element[];
  slotTimings: TSlotTiming[];
  selectedSlot: TSlotTiming | null;
  setSelectedSlot: (slot: TSlotTiming | null) => void;
  timezone: string;
}

export function ConsultationPricing({
  userDetails,
  consultantDetails,
  handleConsultationBooking,
  handleSubscriptionBooking,
  selectedDate,
  setSelectedDate,
  currentDate,
  setCurrentDate,
  renderCalendar,
  slotTimings,
  selectedSlot,
  setSelectedSlot,
  timezone,
}: Readonly<ConsultationPricingProps>) {
  const formatPricingOptions = (
    plans: (ConsultationPlan | SubscriptionPlan)[],
    type: "consultation" | "subscription",
  ): PricingOption[] => {
    return plans.map((plan) => {
      if (type === "consultation" && "durationInHours" in plan) {
        return {
          title: `${plan.durationInHours} Hour${plan.durationInHours > 1 ? "s" : ""}`,
          description: `${plan.durationInHours} hour consultation`,
          price: plan.price,
          duration: `${plan.durationInHours} hour${plan.durationInHours > 1 ? "s" : ""}`,
        };
      } else if (type === "subscription" && "durationInMonths" in plan) {
        return {
          title: `${plan.durationInMonths} Month${plan.durationInMonths > 1 ? "s" : ""}`,
          description: `${plan.durationInMonths} month subscription`,
          price: plan.price,
          duration: `${plan.durationInMonths}`,
          features: [
            `${plan.callsPerWeek} call${plan.callsPerWeek > 1 ? "s" : ""} per week`,
            `${plan.videoMeetings} video meeting${plan.videoMeetings > 1 ? "s" : ""}`,
            `${plan.emailSupport} email support`,
          ],
        };
      }
      return {
        title: "",
        description: "",
        price: 0,
        duration: "",
      };
    });
  };

  const consultationOptions = formatPricingOptions(
    consultantDetails.consultationPlans.sort(
      (a, b) => a.durationInHours - b.durationInHours,
    ),
    "consultation",
  );
  const subscriptionOptions = formatPricingOptions(
    consultantDetails.subscriptionPlans.sort(
      (a, b) => a.durationInMonths - b.durationInMonths,
    ),
    "subscription",
  );

  // Get the primary consultation plan for quick pricing display
  const primaryPlan = consultantDetails.consultationPlans[0];

  return (
    <div className="space-y-6">
      {/* Quick Pricing Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-0 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Consultation Pricing
            </CardTitle>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Featured
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          {primaryPlan && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center text-5xl font-bold">
                  <DollarSignIcon className="w-8 h-8 mr-1" />
                  {primaryPlan.price}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <ClockIcon className="w-4 h-4" />
                  <span>{primaryPlan.durationInHours} hour consultation</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Flexible Scheduling</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <ClockIcon className="w-4 h-4" />
                  <span>Instant Booking</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Pricing Component */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-0">
          <PricingToggle
            consultationOptions={consultationOptions}
            subscriptionOptions={subscriptionOptions}
            consultantDetails={consultantDetails}
            userDetails={userDetails}
            handleConsultationBooking={handleConsultationBooking}
            handleSubscriptionBooking={handleSubscriptionBooking}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            renderCalendar={renderCalendar}
            slotTimings={slotTimings}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            timezone={timezone}
          />
        </CardContent>
      </Card>
    </div>
  );
}
