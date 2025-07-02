import { useEffect, useMemo, useState } from "react";
import { DayOfWeek } from "@prisma/client";
import { TConsultantProfile } from "@/types/consultant";
import { TSlotTiming } from "@/types/slots";
import { WeeklyAvailability } from "./WeeklyAvailability";
import { CustomAvailability } from "./CustomAvailability";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

interface ConsultantAvailabilityProps {
  consultantDetails: TConsultantProfile;
  timezone: string;
}

// Better typing for slot types
type WeeklySlotData = {
  id: string;
  slotStartTimeInUTC: string;
  slotEndTimeInUTC: string;
};

type CustomSlotData = {
  id: string;
  slotStartTimeInUTC: string;
  slotEndTimeInUTC: string;
};

interface ProcessedSlot {
  id: string;
  localStartTime: string;
  localEndTime: string;
  originalSlot: WeeklySlotData | CustomSlotData;
  isAllocated?: boolean;
  bookingStatus?: "available" | "partially-booked" | "fully-booked";
  slotStartTimeInUTC?: string;
  slotEndTimeInUTC?: string;
  type?: "WEEKLY" | "CUSTOM";
}

type ProcessedSlotsByDay = Record<DayOfWeek, ProcessedSlot[]>;

type DayWithSlots = {
  date: Date;
  slots: ProcessedSlot[];
};

export function ConsultantAvailability({
  consultantDetails,
  timezone,
}: ConsultantAvailabilityProps) {
  const [availabilityData, setAvailabilityData] = useState<
    Record<
      string,
      (TSlotTiming & {
        isAllocated: boolean;
        bookingStatus: "available" | "partially-booked" | "fully-booked";
      })[]
    >
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch unified availability data with allocation status
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!consultantDetails?.id || !timezone) return;

      setIsLoading(true);
      try {
        // Fetch slots for the next 7 days to cover both weekly and custom availability
        const today = new Date();
        const startDateInUtc = startOfDay(today);
        const endDateInUtc = endOfDay(addDays(today, 6));

        const response = await fetch(
          `/api/slots/availability-with-allocation/${consultantDetails.id}?startDateInUtc=${startDateInUtc.toISOString()}&endDateInUtc=${endDateInUtc.toISOString()}&timezone=${timezone}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch availability data");
        }

        const { data } = await response.json();
        setAvailabilityData(data);
      } catch (error) {
        console.error("Error fetching availability data:", error);
        setAvailabilityData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [consultantDetails?.id, timezone]);

  // Process data for WeeklyAvailability component (group by day of week)
  const processedWeeklySlots = useMemo((): ProcessedSlotsByDay => {
    const slotsByDay: ProcessedSlotsByDay = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };

    if (consultantDetails.scheduleType === "WEEKLY") {
      Object.entries(availabilityData).forEach(([dateStr, slots]) => {
        slots
          .filter((slot) => slot.type === "WEEKLY")
          .forEach((slot) => {
            slotsByDay[slot.dayOfWeek].push({
              id: slot.slotId,
              localStartTime: slot.localStartTime,
              localEndTime: slot.localEndTime,
              originalSlot: {
                id: slot.slotOfAvailabilityId,
                slotStartTimeInUTC: slot.slotStartTimeInUTC,
                slotEndTimeInUTC: slot.slotEndTimeInUTC,
              },
              isAllocated: slot.isAllocated,
              bookingStatus: slot.bookingStatus || "available",
              slotStartTimeInUTC: slot.slotStartTimeInUTC,
              slotEndTimeInUTC: slot.slotEndTimeInUTC,
              type: "WEEKLY",
            } as ProcessedSlot);
          });
      });
    }

    return slotsByDay;
  }, [availabilityData, consultantDetails.scheduleType]);

  // Process data for CustomAvailability component (group by date)
  // Note: Allow custom slots for all schedule types to support one-off availability
  const processedCustomSlots = useMemo((): DayWithSlots[] => {
    const today = new Date();
    const days: DayWithSlots[] = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfDay(toZonedTime(today, timezone)), i);
      const dateKey = formatTz(date, "yyyy-MM-dd", { timeZone: timezone });

      const slots: ProcessedSlot[] = (availabilityData[dateKey] || [])
        .filter((slot) => slot.type === "CUSTOM")
        .map((slot) => ({
          id: slot.slotId,
          localStartTime: slot.localStartTime,
          localEndTime: slot.localEndTime,
          originalSlot: {
            id: slot.slotOfAvailabilityId,
            slotStartTimeInUTC: slot.slotStartTimeInUTC,
            slotEndTimeInUTC: slot.slotEndTimeInUTC,
          },
          isAllocated: slot.isAllocated,
          bookingStatus: slot.bookingStatus || "available",
          slotStartTimeInUTC: slot.slotStartTimeInUTC,
          slotEndTimeInUTC: slot.slotEndTimeInUTC,
          type: "CUSTOM",
        }));

      return { date, slots };
    });

    return days;
  }, [availabilityData, timezone]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl shadow-xl border border-gray-200/50 p-8 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl pointer-events-none" />
        <div className="relative">
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Consultant Availability
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span>Loading availability...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-8">
      <div className="text-center lg:text-left mb-8">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
          <div className="p-2 bg-gray-900 rounded-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            Availability Schedule
          </h3>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl">
          {consultantDetails.scheduleType === "WEEKLY"
            ? "Weekly recurring schedule. Use the 'Book Now' button to schedule a meeting."
            : "Custom schedule for the next 7 days. Use the 'Book Now' button to schedule a meeting."}
        </p>
      </div>

      {consultantDetails.scheduleType === "WEEKLY" ? (
        <WeeklyAvailability slotsByDay={processedWeeklySlots} />
      ) : (
        <CustomAvailability days={processedCustomSlots} />
      )}
    </div>
  );
}
