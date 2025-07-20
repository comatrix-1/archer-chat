"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { generateUUID } from "~/utils/security";
import { EducationItem } from "./education-item";
import type { ResumeFormData } from "~/types/resume";
import { SortableItem } from "../ui/sortable-item";

export function EducationSection() {
  const form = useFormContext<ResumeFormData>();

  const { fields, move, remove, append } = useFieldArray({
    control: form.control,
    name: 'educations',
    keyName: 'formId',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        const { code } = event;
        switch (code) {
          case 'ArrowLeft':
          case 'ArrowRight':
            return { x: code === 'ArrowRight' ? 1 : -1, y: 0 };
          case 'ArrowUp':
          case 'ArrowDown':
            return { x: 0, y: code === 'ArrowDown' ? 1 : -1 };
          default:
            return { x: 0, y: 0 };
        }
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('handleDragEnd() active: ', active, ' over: ', over);
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.formId === active.id);
      const newIndex = fields.findIndex((field) => field.formId === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('handleDragEnd() moving');
        move(oldIndex, newIndex);
      }
    }
  };

  const addEducation = () => {
    append({
      id: generateUUID(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: new Date(),
      endDate: new Date(),
      gpa: 0,
    });
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map(field => field.formId)} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => (
              <SortableItem
                key={field.formId}
                id={field.formId}
                onRemove={() => remove(index)}
                className="mb-4"
                dragHandleAriaLabel="Drag to reorder experience"
                removeButtonAriaLabel="Remove experience"
              >
                <EducationItem
                  index={index}
                />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          className={cn("w-full max-w-md my-2 mx-auto flex items-center gap-2 justify-center")}
          onClick={addEducation}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              addEducation();
            }
          }}
        >
          <Plus size={16} />
          <span>Add Education</span>
        </Button>
      </Form>
    </div>
  );
}