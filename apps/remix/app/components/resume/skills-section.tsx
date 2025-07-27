import { SectionCard } from "@project/remix/app/components/resume/section-card";
import { Badge } from "@project/remix/app/components/ui/badge";
import { Button } from "@project/remix/app/components/ui/button";
import { Input } from "@project/remix/app/components/ui/input";
import type { ResumeFormData } from "@project/remix/app/types/resume";
import { generateUUID } from "@project/remix/app/utils/security";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

export function SkillsSection() {
  const form = useFormContext<ResumeFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'skills',
    keyName: 'formId',
  });

  const [currentSkill, setCurrentSkill] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSkill.trim()) {
      append({
        id: generateUUID(),
        name: currentSkill.trim(),
      });
      setCurrentSkill("");
    }
  };

  return (
    <SectionCard title="Skills" description="Add relevant skills. Press Enter or click 'Add' to add a skill.">
      <div className="space-y-4">
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a skill"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {fields && fields.length > 0 ? (
            fields.map((field, index) => (
              <Badge
                key={field.id}
                variant="secondary"
                className="text-sm px-2 pl-5"
              >
                {field.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Remove skill"
                >
                  <Trash2 className="size-3.5 sm:size-4" />
                </Button>
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground m-auto text-center text-sm">No skills added yet</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
