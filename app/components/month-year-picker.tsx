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
  startDate?: Date;
  endDate?: Date;
}

export function MonthYearPicker({ 
  date, 
  onSelect, 
  startDate = new Date(new Date().getFullYear() - 50, 0, 1),
  endDate = new Date()
}: Readonly<MonthYearPickerProps>) {
  console.log('MonthYearPicker() date', date);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i
  );
  console.log('MonthYearPicker() :: years: ', years);
  
  // Filter months based on start/end years
  const getAvailableMonths = (year: number) => {
    if (year === startYear && year === endYear) {
      // Same year, filter months between start and end
      return months.filter((_, i) => 
        i >= startDate.getMonth() && i <= endDate.getMonth()
      );
    } else if (year === startYear) {
      // Start year, only include months after start month
      return months.slice(startDate.getMonth());
    } else if (year === endYear) {
      // End year, only include months before end month
      return months.slice(0, endDate.getMonth() + 1);
    }
    return months; // Full year available
  };
  
  const availableMonths = getAvailableMonths(date ? new Date(date).getFullYear() : new Date().getFullYear());

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
          {availableMonths.map((month) => (
            <SelectItem 
              key={month} 
              value={month}
              disabled={!months.includes(month) || false} // Ensure boolean value
            >
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
          {years.map((year) => {
            const isYearDisabled = 
              (year === startYear && date && new Date(date).getMonth() < startDate.getMonth()) ||
              (year === endYear && date && new Date(date).getMonth() > endDate.getMonth());
              
            return (
              <SelectItem 
                key={year} 
                value={year.toString()}
                disabled={Boolean(isYearDisabled)}
              >
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
