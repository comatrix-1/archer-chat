'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface MonthYearPickerProps {
  date: Date | null;
  onSelect: (date: Date | null) => void;
}

export function MonthYearPicker({ date, onSelect }: Readonly<MonthYearPickerProps>) {
  console.log('MonthYearPicker() date', date)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const selectedDate = date ? new Date(date) : null;
  console.log('MonthYearPicker() selectedDate', selectedDate)
  const selectedMonth = selectedDate ? selectedDate.getMonth() : null;
  const selectedYear = selectedDate ? selectedDate.getFullYear() : null;

  const handleMonthChange = (month: string) => {
    console.log('MonthYearPicker() handleMonthChange() month', month)
    if (!month) {
      onSelect(null);
      return;
    }

    const newDate = selectedDate ? new Date(selectedDate) : new Date();
    newDate.setMonth(months.indexOf(month));
    onSelect(newDate);
  };

  const handleYearChange = (year: string) => {
    if (!year) {
      onSelect(null);
      return;
    }

    const newDate = selectedDate ? new Date(selectedDate) : new Date();
    newDate.setFullYear(parseInt(year));
    onSelect(newDate);
  };

  return (
    <div className="flex gap-2">
      <Select
        value={selectedMonth !== null ? months[selectedMonth] : undefined}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear?.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
