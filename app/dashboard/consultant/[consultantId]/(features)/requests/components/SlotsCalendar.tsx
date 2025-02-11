"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { addDays, format, isSameDay, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState, useMemo } from "react"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface SlotsCalendarProps {
  availableSlots: string[]
  existingAppointments: string[]
  onSlotSelect: (slot: string) => void
  selectedSlots: string[]
  requiredSlots: number
  scheduleType: "WEEKLY" | "CUSTOM"
  consultantTimezone: string
  appointmentType: string
  callsPerWeek?: number
  durationInMonths?: number
}

// Convert a local date to UTC string
const toUTCString = (date: Date) => {
  const utcDate = new Date(date)
  utcDate.setMinutes(utcDate.getMinutes() + utcDate.getTimezoneOffset())
  return utcDate.toISOString()
}

// Convert UTC string to local date
const fromUTCString = (utcString: string) => {
  const date = new Date(utcString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date
}

export default function SlotsCalendar({
  availableSlots = [],
  existingAppointments = [],
  onSlotSelect,
  selectedSlots = [],
  requiredSlots,
  scheduleType,
  consultantTimezone,
  appointmentType,
  callsPerWeek = 1,
  durationInMonths = 1
}: Readonly<SlotsCalendarProps>) {
  console.log('SlotsCalendar Props:', {
    availableSlots,
    existingAppointments,
    selectedSlots,
    requiredSlots,
    scheduleType,
    consultantTimezone,
    appointmentType,
    callsPerWeek,
    durationInMonths
  })

  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "month">("week")

  // For navigation and display
  const startDate = startOfWeek(currentDate)
  const weekDates = [...Array(7)].map((_, i) => addDays(startDate, i))
  console.log('Week Dates:', weekDates.map(d => d.toISOString()))

  // Keep track of the first day of the subscription period for consistent week calculations
  const [subscriptionStartDate] = useState(() => {
    // Find the first available slot's week start
    if (appointmentType === "SUBSCRIPTION" && availableSlots.length > 0) {
      // Sort slots chronologically
      const sortedSlots = [...availableSlots].sort((a, b) => {
        const dateA = fromUTCString(a)
        const dateB = fromUTCString(b)
        return dateA.getTime() - dateB.getTime()
      })
      // Use the first available slot's week as the start
      const firstAvailableDate = fromUTCString(sortedSlots[0])
      return startOfWeek(firstAvailableDate)
    }
    // Default to current week
    return startOfWeek(new Date())
  })

  // For subscription period validation
  const subscriptionEndDate = useMemo(() => {
    if (!durationInMonths) return null
    const end = new Date(subscriptionStartDate)
    end.setMonth(end.getMonth() + durationInMonths)
    end.setHours(23, 59, 59, 999)
    return end
  }, [subscriptionStartDate, durationInMonths])

  // For week calculations
  const getWeekNumber = (date: Date) => {
    // Ensure both dates are at midnight for consistent week calculations
    const start = new Date(subscriptionStartDate)
    start.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)

    // Calculate the difference in days
    const diffTime = target.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Get the week number (0-based)
    const weekNumber = Math.floor(diffDays / 7)
    return weekNumber < 0 ? 0 : weekNumber
  }

  // Get total weeks in subscription
  const getTotalWeeks = () => {
    if (!durationInMonths || !callsPerWeek) return 1
    return durationInMonths * 4 // Assuming 4 weeks per month
  }

  // Check if a week is full
  const isWeekFull = (weekNumber: number) => {
    if (!callsPerWeek) return false
    const weekSlots = selectedSlots.filter(slot => {
      const slotDate = fromUTCString(slot)
      return getWeekNumber(slotDate) === weekNumber
    })
    return weekSlots.length >= callsPerWeek
  }

  const isSlotAvailable = (slotDate: Date) => {
    // First check if the slot is within subscription period for subscription type
    if (appointmentType === "SUBSCRIPTION") {
      const start = new Date(subscriptionStartDate)
      start.setHours(0, 0, 0, 0)
      const end = subscriptionEndDate ? new Date(subscriptionEndDate) : null
      if (end) {
        end.setHours(23, 59, 59, 999)
        if (slotDate < start || slotDate > end) {
          return false
        }
      }
    }

    // For weekly schedule, check if the time matches any of the weekly slots
    if (scheduleType === "WEEKLY") {
      // Get time in minutes for the slot we're checking (in local time)
      const slotMinutes = slotDate.getHours() * 60 + slotDate.getMinutes()

      // Check if this time slot matches any of the weekly recurring slots
      const matchingWeeklySlot = availableSlots.some(weeklySlot => {
        const weeklyDate = fromUTCString(weeklySlot)
        const weeklyMinutes = weeklyDate.getHours() * 60 + weeklyDate.getMinutes()
        
        // For weekly slots, we only care about matching the time, not the actual date
        return weeklyMinutes === slotMinutes
      })
      
      // Check if this slot is not already booked
      const slotString = toUTCString(slotDate)
      return matchingWeeklySlot && !existingAppointments.includes(slotString)
    } else if (scheduleType === "CUSTOM") {
      // For custom schedule, check exact matches
      const slotString = toUTCString(slotDate)
      return availableSlots.includes(slotString) && !existingAppointments.includes(slotString)
    } else {
      return false
    }
  }

  const handleSlotSelect = (date: Date, hour: number) => {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)

    const isAvailable = isSlotAvailable(slotStart)
    const isInPast = slotStart < new Date()

    if (!isAvailable || isInPast) return

    // For consultations, only allow one slot
    if (appointmentType === "CONSULTATION") {
      onSlotSelect(toUTCString(slotStart))
      return
    }

    // For subscriptions, ensure slots are distributed across weeks
    if (appointmentType === "SUBSCRIPTION" && callsPerWeek && durationInMonths) {
      const slotWeek = getWeekNumber(slotStart)
      
      // Check if we can add more slots to this week
      if (isWeekFull(slotWeek)) {
        toast({
          title: "Week limit reached",
          description: `You can only select ${callsPerWeek} slots per week`,
          variant: "destructive"
        })
        return
      }

      // Check if we've reached the total required slots
      if (selectedSlots.length >= requiredSlots && !selectedSlots.includes(toUTCString(slotStart))) {
        toast({
          title: "Total slots limit reached",
          description: `You can only select ${requiredSlots} slots in total`,
          variant: "destructive"
        })
        return
      }
    }

    onSlotSelect(toUTCString(slotStart))
  }

  const renderTimeCell = (date: Date, hour: number) => {
    // console.log('Rendering time cell:', { date: date.toISOString(), hour })
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)

    const isAvailable = isSlotAvailable(slotStart)
    const isExisting = existingAppointments.includes(toUTCString(slotStart))
    const isSelected = selectedSlots.includes(toUTCString(slotStart))
    const isInPast = slotStart < new Date()

    let status = ""
    if (isExisting) status = "Booked"
    else if (isSelected) {
      if (appointmentType === "CONSULTATION") {
        status = "Selected"
      } else {
        // For subscriptions, show week number and slot number
        const slotWeek = getWeekNumber(slotStart)
        const weekSlots = selectedSlots.filter(slot => {
          const slotDate = fromUTCString(slot)
          return getWeekNumber(slotDate) === slotWeek
        })
        const slotIndex = weekSlots.indexOf(toUTCString(slotStart))
        const totalWeeks = getTotalWeeks()
        status = `Week ${slotWeek + 1}/${totalWeeks}, Slot ${slotIndex + 1}/${callsPerWeek}`
      }
    }
    else if (isAvailable) {
      if (appointmentType === "SUBSCRIPTION") {
        const slotWeek = getWeekNumber(slotStart)
        const slotsInThisWeek = selectedSlots.filter(slot => {
          const slotDate = fromUTCString(slot)
          return getWeekNumber(slotDate) === slotWeek
        }).length
        status = isWeekFull(slotWeek) ? "Week Full" : "Available"
      } else {
        status = "Available"
      }
    }
    else status = "Unavailable"

    let variant: "default" | "outline" | "ghost" | "secondary" = "ghost"
    if (isSelected) variant = "default"
    else if (isAvailable) variant = "outline"
    else if (isExisting) variant = "secondary"

    let bgColor = ""
    if (isSelected) {
      // Create a gradient of colors for multiple selected slots
      const index = selectedSlots.indexOf(toUTCString(slotStart))
      const hue = (index * 360) / requiredSlots
      bgColor = `bg-[hsl(${hue},85%,90%)]`
    }

    return (
      <Button
        key={`${date.toISOString()}-${hour}`}
        variant={variant}
        className={`h-12 w-full relative ${isInPast ? "opacity-50" : ""} ${bgColor}`}
        onClick={() => handleSlotSelect(date, hour)}
        disabled={!isAvailable || isExisting || isInPast}
      >
        <div className="flex flex-col items-center gap-1 text-xs">
          {scheduleType === "WEEKLY" && isAvailable && <span>🔄</span>}
          <span className={isSelected ? "font-medium" : ""}>{status}</span>
        </div>
      </Button>
    )
  }

  const renderWeekView = () => (
    <div className="flex flex-col h-[65vh] max-h-[600px]">
      <div className="grid grid-cols-8 gap-1">
        <div className="w-20"></div>
        {weekDates.map((date, i) => (
          <div key={i} className="text-center">
            <div className="font-bold">{DAYS[i]}</div>
            <div className="text-sm text-muted-foreground">
              {format(date, "d")}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div className="w-20 text-right pr-2 py-2 text-sm sticky left-0 bg-background z-10">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDates.map((date, i) => (
                <div key={i}>
                  {renderTimeCell(date, hour)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return (
      <div className="grid grid-cols-7 gap-1 h-[65vh] max-h-[600px] overflow-y-auto">
        {DAYS.map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] border p-2 bg-gray-50/50" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1)
          // Get all slots for this day
          const daySlots = Array.from({ length: 24 }, (_, hour) => {
            const slotDate = new Date(date)
            slotDate.setHours(hour, 0, 0, 0)
            return {
              date: slotDate,
              isAvailable: isSlotAvailable(slotDate)
            }
          }).filter(({ isAvailable }) => isAvailable).map(({ date }) => date)

          const existingSlots = existingAppointments
            .map(slot => fromUTCString(slot))
            .filter(slotDate => slotDate.getDate() === date.getDate() && slotDate.getMonth() === date.getMonth())

          const selectedDaySlots = selectedSlots
            .map(slot => fromUTCString(slot))
            .filter(slotDate => slotDate.getDate() === date.getDate() && slotDate.getMonth() === date.getMonth())
          const isToday = isSameDay(date, new Date())

          return (
            <div 
              key={i} 
              className={`min-h-[100px] border p-2 ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <div className={`font-bold mb-1 ${isToday ? "text-primary" : ""}`}>
                {i + 1}
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                {daySlots.map((slot, j) => {
                  const slotDate = new Date(slot)
                  const isInPast = slotDate < new Date()
                  const isSelected = selectedDaySlots.some(s => s.getTime() === slot.getTime())
                  const isExisting = existingSlots.some(s => s.getTime() === slot.getTime())

                  const isAvailable = isSlotAvailable(slot)

                  let status = ""
                  if (isExisting) status = "Booked"
                  else if (isSelected) {
                    if (appointmentType === "CONSULTATION") {
                      status = "Selected"
                    } else {
                      // For subscriptions, show week number and slot number
                      const slotWeek = getWeekNumber(slotDate)
                      const weekSlots = selectedSlots.filter(s => {
                        const slotDate = fromUTCString(s)
                        return getWeekNumber(slotDate) === slotWeek
                      })
                      const slotIndex = weekSlots.findIndex(s => fromUTCString(s).getTime() === slot.getTime())
                      const totalWeeks = getTotalWeeks()
                      status = `Week ${slotWeek + 1}/${totalWeeks}, Slot ${slotIndex + 1}/${callsPerWeek}`
                    }
                  }
                  else if (isAvailable) {
                    if (appointmentType === "SUBSCRIPTION") {
                      const slotWeek = getWeekNumber(slotDate)
                      const slotsInThisWeek = selectedSlots.filter(s => {
                        const slotDate = fromUTCString(s)
                        return getWeekNumber(slotDate) === slotWeek
                      }).length
                      status = isWeekFull(slotWeek) ? "Week Full" : "Available"
                    } else {
                      status = "Available"
                    }
                  }
                  else status = "Unavailable"

                  let variant: "default" | "outline" | "ghost" | "secondary" = "ghost"
                  if (isSelected) variant = "default"
                  else if (isAvailable) variant = "outline"
                  else if (isExisting) variant = "secondary"

                  let bgColor = ""
                  if (isSelected) {
                    // Create a gradient of colors for multiple selected slots
                    const index = selectedSlots.indexOf(toUTCString(slot))
                    const hue = (index * 360) / requiredSlots
                    bgColor = `bg-[hsl(${hue},85%,90%)]`
                  }

                  return (
                    <Button
                      key={j}
                      variant={variant}
                      size="sm"
                      className={`w-full text-xs justify-start ${isInPast ? "opacity-50" : ""} ${bgColor}`}
                      onClick={() => !isInPast && handleSlotSelect(slotDate, slotDate.getHours())}
                      disabled={!isAvailable || isExisting || isInPast}
                    >
                      <div className="flex items-center gap-2">
                        <span>{format(slotDate, "HH:mm")}</span>
                        {scheduleType === "WEEKLY" && isAvailable && <span>🔄</span>}
                        <span className="text-muted-foreground">{status}</span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const navigatePrevious = () => {
    if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))
    } else {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
    }
  }

  const navigateNext = () => {
    if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))
    } else {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
          >
            Month
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={navigatePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-bold">
          {format(currentDate, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={navigateNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {view === "week" ? renderWeekView() : renderMonthView()}

      <div className="flex justify-between items-center">
        <div className="text-sm">
          Selected: {selectedSlots.length} / {requiredSlots} slots
        </div>
        <div className="text-sm text-muted-foreground">
          {Intl.DateTimeFormat().resolvedOptions().timeZone} (Browser Time)
        </div>
      </div>
    </div>
  )
}
