"use client";

import type { Experience } from "@prisma/client";
import { EmploymentType, LocationType } from "@prisma/client";
import { Trash2 } from "lucide-react";
import type React from "react";
import { memo } from "react";
import {
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { MonthYearPicker } from "~/components/month-year-picker";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { RichTextEditor } from "../rich-text-editor";

interface ExperienceSectionProps {
  experienceSectionFields: (Omit<
    Experience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType | string;
    locationType: LocationType | string;
  })[];
  control: Control<any>;
  removeExperience: (index: number) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

interface ExperienceItemProps {
  fieldId: string;
  index: number;

  control: Control<any>;
  removeExperience: (index: number) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

const ExperienceItem: React.FC<ExperienceItemProps> = memo(
  ({ fieldId, index, control, getValues, setValue, removeExperience }) => {
    const startDateValue = useWatch({
      control,
      name: `experiences.${index}.startDate`,
    });
    const endDateValue = useWatch({
      control,
      name: `experiences.${index}.endDate`,
    });
    const isPresent = endDateValue === null;

    return (
      <div key={fieldId} className="space-y-4 border p-4 rounded-lg">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-4 flex-1">
            <FormField
              control={control}
              name={`experiences.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`experiences.${index}.employmentType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EmploymentType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ").charAt(0).toUpperCase() +
                            type.replace("_", " ").slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`experiences.${index}.company`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={control}
                name={`experiences.${index}.location`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Johor Bahru, Malaysia"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`experiences.${index}.locationType`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Location Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(LocationType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("_", " ").charAt(0).toUpperCase() +
                              type.replace("_", " ").slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormLabel>Start Date</FormLabel>
                <MonthYearPicker
                  date={startDateValue}
                  onSelect={(date) => {
                    const newDate = date ? new Date(date) : null;
                    if (newDate) {
                      newDate.setHours(0, 0, 0, 0);
                    }
                    setValue(`experiences.${index}.startDate`, newDate, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
                {}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <FormLabel>End Date</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`present-${index}`}
                      checked={isPresent}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValue(`experiences.${index}.endDate`, null, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        } else {
                          setValue(`experiences.${index}.endDate`, new Date(), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`present-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Present
                    </label>
                  </div>
                </div>
                {!isPresent && (
                  <MonthYearPicker
                    date={endDateValue}
                    onSelect={(date) => {
                      const newDate = date ? new Date(date) : null;
                      if (newDate) {
                        newDate.setHours(0, 0, 0, 0);
                      }
                      setValue(`experiences.${index}.endDate`, newDate, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                )}
                {}
              </div>
            </div>
            <FormField
              control={control}
              name={`experiences.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    {}
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {}
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={() => removeExperience(index)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    );
  },
);
ExperienceItem.displayName = "ExperienceItem";

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experienceSectionFields: experienceFields,
  control,
  getValues,
  setValue,
  removeExperience,
}) => {
  if (!experienceFields || experienceFields.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }
  return (
    <div className="space-y-4">
      {experienceFields.map((field, index) => {
        return (
          <ExperienceItem
            key={field.id}
            fieldId={field.id}
            index={index}
            control={control}
            getValues={getValues}
            setValue={setValue}
            removeExperience={removeExperience}
          />
        );
      })}
    </div>
  );
};

export default ExperienceSection;
