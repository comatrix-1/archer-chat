"use client";

import { useFieldArray } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { DetailCard, DetailCardField } from "./detail-card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Calendar,
  GraduationCap,
  MapPin,
  Globe,
  Briefcase,
} from "lucide-react";
import { DraggableExperienceList } from "./draggable-experience-list";
import type {
  Control,
  UseFieldArrayAppend,
  UseFormSetValue,
} from "react-hook-form";
import { EmploymentType, LocationType } from "@prisma/client";
import { useResumeForm, type ResumeFormData } from "~/hooks/use-resume-form";
import { generateUUID } from "~/utils/security";

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: EmploymentType;
  locationType: LocationType;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  current: boolean;
  website?: string | null;
}

const NO_ITEMS_DESCRIPTION =
  "No experience added yet. Click the button below to add your first experience.";

interface ExperienceSectionProps {
  resumeId: string;
  control: Control<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  experienceFields: ExperienceItem[];
  appendExperience: UseFieldArrayAppend<ResumeFormData, "experiences">;
  removeExperience: (index: number) => void;
}

export function ExperienceSectionDnD({
  resumeId,
  control,
  setValue,
  experienceFields,
  appendExperience,
  removeExperience,
}: ExperienceSectionProps) {
  console.log('experienceFields:', experienceFields);
  const handleReorder = (reorderedItems: { id: string }[]) => {
    // Create a map of the current fields by ID for quick lookup
    const fieldsMap = new Map(experienceFields.map((field) => [field.id, field]));

    // Reorder the fields while preserving all their data
    const reorderedFields: ExperienceItem[] = reorderedItems
      .map(({ id }) => {
        const field = fieldsMap.get(id);
        if (!field) throw new Error(`Field with id ${id} not found`);
        return field;
      })
      .map(({ id, ...rest }) => ({
        ...rest,
        id,
      }));

    // Update the form with the reordered fields
    setValue("experiences", reorderedFields);
  };

  const handleAppendExperience = () => {
    const newExperience: ExperienceItem = {
      id: generateUUID(),
      title: "",
      company: "",
      location: "",
      employmentType: EmploymentType.FULL_TIME,
      locationType: LocationType.ON_SITE,
      startDate: new Date(),
      endDate: null,
      description: "",
      current: false,
      website: null,
    };
    appendExperience(newExperience);
  };

  if (!experienceFields.length) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">{NO_ITEMS_DESCRIPTION}</p>
        <Button type="button" onClick={handleAppendExperience}>
          Add Experience
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DraggableExperienceList
        items={experienceFields}
        onReorder={handleReorder}
        getItemId={(item) => item.id}
      >
        {(item, index) => (
          <DetailCard
            key={item.id}
            id={item.id}
            index={index}
            title={item.title || "Untitled Experience"}
            onDelete={() => removeExperience(index)}
          >
            <DetailCardField
              label="Job Title"
              icon={<Briefcase className="h-4 w-4" />}
            >
              <Input
                placeholder="e.g., Senior Software Engineer"
                {...control.register(`experiences.${index}.title`)}
              />
            </DetailCardField>

            <DetailCardField
              label="Company"
              icon={<GraduationCap className="h-4 w-4" />}
            >
              <Input
                placeholder="e.g., Acme Inc."
                {...control.register(`experiences.${index}.company`)}
              />
            </DetailCardField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCardField
                label="Location"
                icon={<MapPin className="h-4 w-4" />}
              >
                <Input
                  placeholder="e.g., San Francisco, CA"
                  {...control.register(`experiences.${index}.location`)}
                />
              </DetailCardField>

              <DetailCardField
                label="Website"
                icon={<Globe className="h-4 w-4" />}
              >
                <Input
                  placeholder="e.g., acme.com"
                  {...control.register(`experiences.${index}.website` as const)}
                />
              </DetailCardField>

              <DetailCardField
                label="Start Date"
                icon={<Calendar className="h-4 w-4" />}
              >
                <Input
                  type="month"
                  placeholder="Start date"
                  {...control.register(`experiences.${index}.startDate`)}
                />
              </DetailCardField>

              <DetailCardField
                label="End Date"
                icon={<Calendar className="h-4 w-4" />}
              >
                <Input
                  type="month"
                  placeholder="End date (or present)"
                  {...control.register(`experiences.${index}.endDate`)}
                />
              </DetailCardField>
            </div>

            <DetailCardField
              label="Description"
              icon={<Briefcase className="h-4 w-4" />}
            >
              <Textarea
                placeholder="Describe your role and achievements"
                rows={4}
                {...control.register(`experiences.${index}.description`)}
              />
            </DetailCardField>
          </DetailCard>
        )}
      </DraggableExperienceList>

      <Button type="button" onClick={handleAppendExperience}>
        Add Another Experience
      </Button>
    </div>
  );
}
