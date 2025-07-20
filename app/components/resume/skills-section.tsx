import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ResumeFormData } from "~/types/resume";
import { useFieldArray, useFormContext } from "react-hook-form";
import { generateUUID } from "~/utils/security";

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
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add relevant skills. Press Enter or click 'Add' to add a skill.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
