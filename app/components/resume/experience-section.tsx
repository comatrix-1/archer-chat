"use client";

import React, { memo } from "react"; // Import memo
import {
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"; // Import Select components
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import type { Experience } from "@prisma/client";
import { EmploymentType, LocationType } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { MonthYearPicker } from "~/components/month-year-picker"; // Import MonthYearPicker
import { Checkbox } from "~/components/ui/checkbox"; // Import Checkbox
import { RichTextEditor } from "../rich-text-editor"; // Import RichTextEditor

interface ExperienceSectionProps {
  // Update the type for experienceSectionFields to reflect enums
  experienceSectionFields: (Omit<
    Experience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType | string;
    locationType: LocationType | string;
  })[];
  control: Control<any>; // Use Control type
  removeExperience: (index: number) => void;
  setValue: UseFormSetValue<any>; // Use UseFormSetValue type
  getValues: UseFormGetValues<any>; // Use UseFormGetValues type
}

interface ExperienceItemProps {
  fieldId: string; // Pass the unique ID for the key prop
  index: number;
  // field: (Omit<Experience, "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"> & { employmentType: EmploymentType | string; locationType: LocationType | string }); // If passing the whole field object

  control: Control<any>;
  removeExperience: (index: number) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

// Create a separate component for each experience item
const ExperienceItem: React.FC<ExperienceItemProps> = memo(
  ({ fieldId, index, control, getValues, setValue, removeExperience }) => {
    // Watch the end date value for reactivity - Now called at the top level of ExperienceItem
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
              render={(
                { field } // field.value should be an EmploymentType or string
              ) => (
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
                render={(
                  { field } // field.value should be a LocationType or string
                ) => (
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
                  date={getValues(`experiences.${index}.startDate`)}
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
                {/* We might need a FormMessage here if validation is added */}
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
                          // Set a default date or leave null for user to pick
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
                    date={endDateValue} // Use watched value
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
                {/* We might need a FormMessage here if validation is added */}
              </div>
            </div>
            <FormField
              control={control}
              name={`experiences.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    {/* Replace Textarea with RichTextEditor */}
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange} // Pass the onChange handler from RHF
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Keep remove button separate if needed, or integrate */}
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
  }
);
ExperienceItem.displayName = "ExperienceItem"; // Add display name for better debugging

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
          // Render the new ExperienceItem component
          <ExperienceItem
            key={field.id} // Use field.id from useFieldArray for stable keys
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
