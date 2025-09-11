"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@project/remix/app/components/ui/button";
import { Form } from "@project/remix/app/components/ui/form";
import { cn } from "@project/remix/app/lib/utils";
import { ZEmploymentType, ZLocationType, type ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";
import { SortableItem } from "../../ui/sortable-item";
import ExperienceItem from "./experience-item";
import { SectionCard } from "../section-card";

const ExperienceSection = () => {
  const form = useFormContext<ZResumeWithRelations>();

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
    if (over && active.data.current && over.data.current) {
      const oldIndex = active.data.current.sortable.index;
      const newIndex = over.data.current.sortable.index;
      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('handleDragEnd() moving')
        move(oldIndex, newIndex);
      }
    }
  };

  const addExperience = () => {
    append({
      title: "",
      employmentType: ZEmploymentType.enum.FULL_TIME,
      locationType: ZLocationType.enum.ON_SITE,
      company: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      description: "",
    });
  };


  return (
    <SectionCard title="Experience" description="Add your work experience.">
      <div className="space-y-4">
        <Form {...form}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(field => field.formId)}
              strategy={verticalListSortingStrategy}
            >

              {fields.map((field, index) => {
                return (
                  <SortableItem
                    key={field.formId}
                    id={field.formId}
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
          >
            <Plus size={16} />
            <span>Add Experience</span>
          </Button>
        </Form>
      </div>
    </SectionCard>
  );
};

export default ExperienceSection;
