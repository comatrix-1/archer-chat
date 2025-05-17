"use client";

import React, { useMemo } from "react"; // Import useMemo
import { Input } from "~/components/ui/input"; // Adjust the import path as necessary
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"; // Adjust the import path as necessary
import { Button } from "~/components/ui/button"; // Adjust the import path as necessary
import { Trash2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { SkillCategory, SkillProficiency } from "@prisma/client"; // Import enums

interface SkillField {
  id: string;
  name: string;
  proficiency: SkillProficiency | string; // Allow string for initial form values if needed, but aim for enum
  category: SkillCategory | string; // Allow string for initial form values, but aim for enum
}

interface SkillsSectionProps {
  skills: SkillField[];
  control: any; // Consider using Control<ResumeFormData> from react-hook-form
  removeSkill: (index: number) => void;
}

// Use enum values for categories and proficiencies
const SKILL_CATEGORY_OPTIONS = Object.values(SkillCategory);
const SKILL_PROFICIENCY_OPTIONS = Object.values(SkillProficiency);

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  control,
  removeSkill,
}) => {
  // Group skills by category using useMemo for performance
  const groupedSkills = useMemo(() => {
    return skills.reduce((acc, skill, index) => {
      const category = skill.category || SkillCategory.TECHNICAL; // Default to TECHNICAL or another suitable default from your enum
      if (!acc[category]) {
        acc[category] = [];
      }
      // Store the original index along with the skill data
      acc[category].push({ ...skill, originalIndex: index });
      return acc;
    }, {} as Record<string, (SkillField & { originalIndex: number })[]>);
  }, [skills]);

  if (!skills || skills.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Iterate over grouped skills */}
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="space-y-3 border-l-2 pl-4 border-muted">
          <h3 className="text-md font-semibold text-muted-foreground">
            {category}
          </h3>
          {categorySkills.map((field) => (
            <div
              key={field.id}
              className="group flex items-end justify-between w-full gap-2 py-1 text-sm"
            >
              {/* Category Selector */}
              <div className="w-1/4">
                <FormField
                  control={control}
                  name={`skills.${field.originalIndex}.category`}
                  render={(
                    { field: renderField } // Renamed to avoid conflict
                  ) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          value={renderField.value}
                          onValueChange={renderField.onChange}
                          defaultValue={renderField.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_CATEGORY_OPTIONS.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.replace("_", " ").charAt(0).toUpperCase() +
                                  cat.replace("_", " ").slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Skill Name Input */}
              <div className="w-2/4">
                <FormField
                  control={control}
                  name={`skills.${field.originalIndex}.name`}
                  render={(
                    { field: renderField } // Renamed to avoid conflict
                  ) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Skill name" {...renderField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Proficiency Selector */}
              <div className="w-1/4">
                <FormField
                  control={control}
                  name={`skills.${field.originalIndex}.proficiency`}
                  render={(
                    { field: renderField } // Renamed to avoid conflict
                  ) => (
                    <FormItem>
                      <FormLabel>Proficiency</FormLabel>
                      <FormControl>
                        <Select
                          value={renderField.value}
                          onValueChange={renderField.onChange}
                          defaultValue={renderField.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_PROFICIENCY_OPTIONS.map((prof) => (
                              <SelectItem key={prof} value={prof}>
                                {prof.charAt(0).toUpperCase() +
                                  prof.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                            {/* If "N/A" or "Experienced" are distinct and needed, consider adding them to your SkillProficiency enum */}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeSkill(field.originalIndex)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkillsSection;
