import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "../../states/resumeStore";
import { X } from "lucide-react";
import { useState } from "react";

export function Skills() {
  const skills = useResumeStore((state) => state.resume.skills);
  const addSkill = useResumeStore((state) => state.addSkill);
  const removeSkill = useResumeStore((state) => state.removeSkill);

  const [currentSkill, setCurrentSkill] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSkill.trim()) {
      addSkill({ name: currentSkill.trim() });
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
        <form
          onSubmit={handleAddSkill}
          className="flex items-center gap-2 mb-4"
        >
          <Input
            placeholder="e.g., React, Node.js, Project Management"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <Badge
                key={skill.name}
                variant="secondary"
                className="text-lg py-1 px-3"
              >
                {skill.name}
                <button
                  type="button"
                  className="ml-2 rounded-full hover:bg-destructive/80 p-0.5"
                  onClick={() => removeSkill(skill.name)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No skills added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
