"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

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
}

export function DatePicker({ selectedDate, onSelect, disabled, isClearable }: Readonly<DatePickerProps>) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal"
          >
            {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={(date) => {
              onSelect(date)
              setOpen(false)
            }}
            disabled={disabled}
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
