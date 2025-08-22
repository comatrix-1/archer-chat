"use client";

import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@project/remix/app/components/ui/button";
import { Form } from "@project/remix/app/components/ui/form";
import { cn } from "@project/remix/app/lib/utils";
import type { ResumeFormData } from "@project/remix/app/types/resume";
import { generateUUID } from "@project/remix/app/utils/security";
import { SortableItem } from "../ui/sortable-item";
import { AwardsItem } from "./awards-item";
import { SectionCard } from "./section-card";
import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";

export function AwardsSection() {
  const form = useFormContext<ZResumeWithRelations>();

  const { fields, move, remove, append } = useFieldArray({
    control: form.control,
    name: 'awards',
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
    console.log('handleDragEnd() active: ', active, ' over: ', over)
    if (over && active.data.current && over.data.current) {
      const oldIndex = active.data.current.sortable.index;
      const newIndex = over.data.current.sortable.index;
      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('handleDragEnd() moving')
        move(oldIndex, newIndex);
      }
    }
  };

  const addHonorsAward = () => {
    append({
      title: "",
      issuer: "",
      date: new Date(),
      description: "",
    });
  };

  return (
    <SectionCard title="Honors & Awards" description="Add your honors and awards.">
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
                  dragHandleAriaLabel="Drag to reorder honor/award"
                  removeButtonAriaLabel="Remove honor/award"
                >
                  <AwardsItem index={index} />
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
          <Button
            type="button"
            className={cn("w-full max-w-md my-2 mx-auto flex items-center gap-2 justify-center")}
            onClick={addHonorsAward}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                addHonorsAward();
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Add Honor or Award
          </Button>
        </Form>
      </div>
    </SectionCard>
  );
};
