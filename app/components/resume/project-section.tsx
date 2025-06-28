"use client";

import type { Project } from "@prisma/client";
import { Plus } from "lucide-react";
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
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { generateUUID } from "~/utils/security";
import { RichTextEditor } from "../rich-text-editor";
import { DetailCard } from "./detail-card";

interface ProjectSectionProps {
  projectFields: Omit<Project, "resumeId">[];
  control: Control<any>;
  appendProject: (field: Project) => void;
  removeProject: (index: number) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  resumeId: string;
}

interface ProjectItemProps {
  fieldId: string;
  index: number;
  control: Control<any>;
  removeProject: (index: number) => void;
  setValue: UseFormSetValue<any>;
  resumeId: string;
  title: string;
}

const ProjectItem: React.FC<ProjectItemProps> = memo(
  ({
    fieldId,
    index,
    control,
    setValue,
    removeProject,
    title,
  }) => {
    const startDateValue = useWatch({
      control,
      name: `projects.${index}.startDate`,
    });
    const endDateValue = useWatch({
      control,
      name: `projects.${index}.endDate`,
    });
    const isPresent = endDateValue === null;

    return (
      <DetailCard
        key={index}
        id={fieldId}
        index={index}
        title={title}
        onDelete={() => removeProject(index)}
      >
        <FormField
          control={control}
          name={`projects.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Project title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <FormLabel>Start Date</FormLabel>
            <MonthYearPicker
              date={startDateValue}
              onSelect={(date) => {
                const newDate = date ? new Date(date) : null;
                if (newDate) newDate.setHours(0, 0, 0, 0);
                setValue(`projects.${index}.startDate`, newDate, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <FormLabel>End Date</FormLabel>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`project-present-${index}`}
                  checked={isPresent}
                  onCheckedChange={(checked) => {
                    setValue(
                      `projects.${index}.endDate`,
                      checked ? null : new Date(),
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                />
                <label
                  htmlFor={`project-present-${index}`}
                  className="text-sm font-medium"
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
                  if (newDate) newDate.setHours(0, 0, 0, 0);
                  setValue(`projects.${index}.endDate`, newDate, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            )}
          </div>
        </div>
        <FormField
          control={control}
          name={`projects.${index}.description`}
          render={({ field }) => (
            <FormItem>
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
      </DetailCard>
    );
  }
);
ProjectItem.displayName = "ProjectItem";

const ProjectSection: React.FC<ProjectSectionProps> = ({
  projectFields,
  control,
  getValues,
  setValue,
  removeProject,
  appendProject,
  resumeId,
}) => {
  if (!projectFields || projectFields.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }
  return (
    <div className="space-y-4 flex flex-col items-stretch">
      {projectFields.map((field, index) => (
        <ProjectItem
          key={field.id}
          fieldId={field.id}
          index={index}
          control={control}
          setValue={setValue}
          removeProject={removeProject}
          resumeId={resumeId}
          title={field.title}
        />
      ))}
      <Button
        type="button"
        className="w-full max-w-md mx-auto"
        onClick={(e) => {
          e.stopPropagation();
          appendProject({
            id: generateUUID(),
            title: "",
            startDate: new Date(),
            endDate: null,
            description: "",
            resumeId,
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            appendProject({
              id: generateUUID(),
              title: "",
              startDate: new Date(),
              endDate: null,
              description: "",
              resumeId,
            });
          }
        }}
      >
        <Plus size={16} />
        <span>Add Project</span>
      </Button>
    </div>
  );
};

export default ProjectSection;
