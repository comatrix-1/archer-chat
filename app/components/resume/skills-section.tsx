"use client";

import { SkillCategory, SkillProficiency } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
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
import { cn } from "~/lib/utils";
import { generateUUID } from "~/utils/security";

interface SkillField {
  id: string;
  name: string;
  proficiency: SkillProficiency;
  category: SkillCategory;
}

interface SkillsSectionProps {
  skills: SkillField[];
  control: any;
  appendSkill: (skill: SkillField) => void;
  removeSkill: (index: number) => void;
}

const SKILL_CATEGORY_OPTIONS = Object.values(SkillCategory);
const SKILL_PROFICIENCY_OPTIONS = Object.values(SkillProficiency);

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  control,
  appendSkill,
  removeSkill,
}) => {
  const groupedSkills = useMemo(() => {
    return skills.reduce(
      (acc, skill, index) => {
        const category = skill.category || SkillCategory.TECHNICAL;
        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push({ ...skill, originalIndex: index });
        return acc;
      },
      {} as Record<string, (SkillField & { originalIndex: number })[]>,
    );
  }, [skills]);

  if (!skills || skills.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }

  return (
      <div className="space-y-4 flex flex-col items-stretch">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div
            key={category}
            className="space-y-3 border-l-2 pl-4 border-muted"
          >
            <h3 className="text-md font-semibold text-muted-foreground">
              {category}
            </h3>
            {categorySkills.map((field) => (
              <div
                key={field.id}
                className="group flex items-end justify-between w-full gap-2 py-1 text-sm"
              >
                {}
                <div className="w-1/4">
                  <FormField
                    control={control}
                    name={`skills.${field.originalIndex}.category`}
                    render={({ field: renderField }) => (
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
                                  {cat
                                    .replace("_", " ")
                                    .charAt(0)
                                    .toUpperCase() +
                                    cat
                                      .replace("_", " ")
                                      .slice(1)
                                      .toLowerCase()}
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
                <div className="w-2/4">
                  <FormField
                    control={control}
                    name={`skills.${field.originalIndex}.name`}
                    render={({ field: renderField }) => (
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
                <div className="w-1/4">
                  <FormField
                    control={control}
                    name={`skills.${field.originalIndex}.proficiency`}
                    render={({ field: renderField }) => (
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
                              {}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
      <Button
        type="button"
        className={cn("w-full max-w-md my-2 mx-auto")}
        onClick={(e) => {
          e.stopPropagation();
          appendSkill({
            id: generateUUID(),
            name: "",
            proficiency: SkillProficiency.BEGINNER,
            category: SkillCategory.TECHNICAL,
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            appendSkill({
              id: generateUUID(),
              name: "",
              proficiency: SkillProficiency.BEGINNER,
              category: SkillCategory.TECHNICAL,
            });
          }
        }}
      >
        <Plus size={16} />
        <span>Add skill</span>
      </Button>
      </div>
  );
};

export default SkillsSection;
