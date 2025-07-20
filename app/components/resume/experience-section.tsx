"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import type { ResumeFormData } from "~/types/resume";
import { generateUUID } from "~/utils/security";
import { SortableItem } from "../ui/sortable-item";
import ExperienceItem, { EEmploymentType, ELocationType } from "./experience-item";

const ExperienceSection = () => {
  const form = useFormContext<ResumeFormData>();

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

  const { fields, move, remove, append } = useFieldArray({
    control: form.control,
    name: 'experiences',
    keyName: 'formId', // Prevent key conflicts with our existing 'id' field
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('handleDragEnd() active: ', active, ' over: ', over)
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('handleDragEnd() moving')
        move(oldIndex, newIndex);
      }
    }
  };

  const addExperience = () => {
    append({
      id: generateUUID(),
      title: "",
      employmentType: EEmploymentType.FULL_TIME,
      locationType: ELocationType.ON_SITE,
      company: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      description: "",
    });
  };


  return (
    <div className="space-y-4">
      <Form {...form}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(field => field.id)}
            strategy={verticalListSortingStrategy}
          >

            {fields.map((field, index) => {
              return (
                <SortableItem
                  key={field.id}
                  id={field.id}
                  onRemove={() => remove(index)}
                  className="mb-4"
                  dragHandleAriaLabel="Drag to reorder experience"
                  removeButtonAriaLabel="Remove experience"
                >
                  <ExperienceItem
                    index={index}
                  />
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          className={cn("w-full max-w-md my-2 mx-auto flex items-center gap-2 justify-center")}
          onClick={(e) => {
            console.log('addExperience()')
            e.stopPropagation();
            addExperience();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              addExperience();
            }
          }}
        >
          <Plus size={16} />
          <span>Add Experience</span>
        </Button>
      </Form>
    </div>
  );
};

export default ExperienceSection;
