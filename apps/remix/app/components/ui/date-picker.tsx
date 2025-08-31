"use client"

import { ChevronDownIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

interface DatePickerProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  isClearable: boolean;
  startMonth?: Date;
  endMonth?: Date;
}

export function DatePicker({ selectedDate, onSelect, disabled, isClearable, startMonth = new Date(new Date().setFullYear(new Date().getFullYear() - 50)), endMonth }: Readonly<DatePickerProps>) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(selectedDate || new Date())

  const formatDate = (date: Date | undefined) => {
    if (!date) {
      return ""
    }
  
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }
  

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate)
    }
  }, [selectedDate])

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal"
          >
            {selectedDate ? formatDate(selectedDate) : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            onSelect={(date) => {
              onSelect(date)
              setOpen(false)
            }}
            disabled={disabled}
            startMonth={startMonth}
            endMonth={endMonth}
          />

          {isClearable ? <div className="w-full flex">
            <Button variant="outline" size="sm" onClick={() => onSelect(undefined)} className="mx-auto mb-2">
              Clear
            </Button>
          </div> : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
