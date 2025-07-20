"use client";

import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Form, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { ResumeFormData } from "~/types/resume";
import { generateUUID } from "~/utils/security";
import { SortableItem } from "../ui/sortable-item";
import { CertificationItem } from "./certification-item";
import { SectionCard } from "./section-card";

export function CertificationSection() {
  const form = useFormContext<ResumeFormData>();
  const { fields, move, append, remove } = useFieldArray({
    control: form.control,
    name: 'certifications',
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

  const addCertification = () => {
    append({
      id: generateUUID(),
      name: '',
      issuer: '',
      issueDate: new Date(),
      expirationDate: null,
      credentialId: '',
      credentialUrl: '',
    });
  };

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

  return (
    <SectionCard title="Certifications" description="Add your certifications.">
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
                    <CertificationItem
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
              console.log('addCertification()')
              e.stopPropagation();
              addCertification();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                addCertification();
              }
            }}
          >
            <Plus size={16} />
            <span>Add Certification</span>
          </Button>
        </Form>
      </div>
    </SectionCard>
  )
}

export default CertificationSection;
