"use client";

import { RichTextEditor } from "@project/remix/app/components/rich-text-editor";
import { DatePicker } from "@project/remix/app/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@project/remix/app/components/ui/form";
import { Input } from "@project/remix/app/components/ui/input";
import type { ResumeFormData } from "@project/remix/app/types/resume";
import { useFormContext, useWatch } from "react-hook-form";

interface ProjectItemProps {
  index: number;
}

export function ProjectItem({ index }: ProjectItemProps) {
  const form = useFormContext<ResumeFormData>();

  const startDateValue = useWatch({
    control: form.control,
    name: `projects.${index}.startDate`,
  });

  const endDateValue = useWatch({
    control: form.control,
    name: `projects.${index}.endDate`,
  });

  const handleDateSelect = (date: Date | undefined, fieldName: 'startDate' | 'endDate', index: number) => {
    if (date) {
        date.setHours(0, 0, 0, 0);
    }
    form.setValue(`projects.${index}.${fieldName}`, date, {
        shouldValidate: true,
        shouldDirty: true,
    });
};

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name={`projects.${index}.title`}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Project Title</FormLabel>
            <FormControl>
              <Input placeholder="Project title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`projects.${index}.startDate`}
        render={({ field }) => (
          <FormItem className="col-span-1">
            <FormLabel>Start Date</FormLabel>
            <FormControl>
              <DatePicker
                selectedDate={field.value ?? undefined}
                onSelect={(date: Date | undefined) => handleDateSelect(date, 'startDate', index)}
                isClearable={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`projects.${index}.endDate`}
        render={({ field }) => (
          <FormItem className="col-span-1">
            <FormLabel>End Date</FormLabel>
            <FormControl>
              <DatePicker
                selectedDate={field.value ?? undefined}
                onSelect={(date: Date | undefined) => handleDateSelect(date, 'endDate', index)}
                isClearable={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`projects.${index}.description`}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Describe the project..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
