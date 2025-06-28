"use client";
import type { Education } from "@prisma/client";
import { Plus } from "lucide-react";
import type React from "react";
import { memo } from "react";
import { useWatch } from "react-hook-form";
import { MonthYearPicker } from "~/components/month-year-picker";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { RichTextEditor } from "../rich-text-editor";
import { DetailCard } from "./detail-card";
interface EducationItemProps {
  field: Omit<Education, "resumeId" | "createdAt" | "updatedAt"> & {
    id: string;
  };
  index: number;
  control: any;
  setValue: any;
  removeEducation: (index: number) => void;
  title: string;
}

const EducationItem: React.FC<EducationItemProps> = memo(
  ({ field, index, control, setValue, removeEducation, title }) => {
    const startDate = useWatch({
      control,
      name: `educations.${index}.startDate`,
    });
    const endDate = useWatch({
      control,
      name: `educations.${index}.endDate`,
    });
    return (
      <DetailCard
        key={field.id}
        id={field.id}
        index={index}
        title={title}
        onDelete={() => removeEducation(index)}
      >
        <FormField
          control={control}
          name={`educations.${index}.school`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <FormControl>
                <Input placeholder="School name" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`educations.${index}.degree`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <FormControl>
                <Input placeholder="Degree" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`educations.${index}.fieldOfStudy`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl>
                <Input placeholder="Field of study" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <FormLabel>Start Date</FormLabel>
            <MonthYearPicker
              date={startDate ?? null}
              onSelect={(date) => {
                if (!date) return;
                const newDate = new Date(date);
                setValue(`educations.${index}.startDate`, newDate);
              }}
            />
          </div>
          <div className="flex-1">
            <FormLabel>End Date</FormLabel>
            <MonthYearPicker
              date={endDate ?? null}
              onSelect={(date) => {
                if (!date) return;
                const newDate = new Date(date);
                newDate.setHours(0, 0, 0, 0);
                setValue(`educations.${index}.endDate`, newDate);
              }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <FormField
              control={control}
              name={`educations.${index}.location`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Location" {...formField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-1 gap-2">
            <div>
              <FormField
                control={control}
                name={`educations.${index}.gpa`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>GPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="GPA"
                        step={0.1}
                        {...formField}
                        onChange={(e) =>
                          formField.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={control}
                name={`educations.${index}.gpaMax`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>Maximum GPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max GPA"
                        {...formField}
                        onChange={(e) =>
                          formField.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <FormField
              control={control}
              name={`educations.${index}.description`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={formField.value}
                      onChange={formField.onChange}
                      placeholder="Additional details about your education (e.g., courses, activities, thesis)..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </DetailCard>
    );
  }
);

interface EducationSectionProps {
  educationFields: (Omit<Education, "resumeId" | "createdAt" | "updatedAt"> & {
    id: string;
  })[];
  control: any;
  setValue: any;
  getValues: any;
  removeEducation: (index: number) => void;
  appendEducation: (education: any) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  educationFields,
  control,
  setValue,
  getValues,
  removeEducation,
  appendEducation,
}) => {
  if (!educationFields || educationFields.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }
  return (
    <div className="space-y-4">
      {educationFields.map((field, index) => {
        const title =
          getValues(`educations.${index}.school`) ?? `Education #${index + 1}`;
        return (
          <EducationItem
            key={field.id}
            field={field}
            index={index}
            control={control}
            setValue={setValue}
            removeEducation={removeEducation}
            title={title}
          />
        );
      })}
      <Button
        type="button"
        className={cn(
          "w-full max-w-md my-2 mx-auto flex items-center gap-2 justify-center"
        )}
        onClick={(e) => {
          e.stopPropagation();
          appendEducation({
            school: "",
            degree: "",
            fieldOfStudy: "",
            startDate: new Date(),
            endDate: null,
            current: false,
            description: "",
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            appendEducation({
              school: "",
              degree: "",
              fieldOfStudy: "",
              startDate: new Date(),
              endDate: null,
              current: false,
              description: "",
            });
          }
        }}
      >
        <Plus size={16} />
        <span>Add Education</span>
      </Button>
    </div>
  );
};
export default EducationSection;
