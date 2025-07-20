"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useBlocker } from "react-router";

import { DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { useResumeStore } from "~/states/resumeStore";
import ExperienceItem from "./experience-item";

export enum EEmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FREELANCE = 'FREELANCE',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP',
  SEASONAL = 'SEASONAL',
}

export enum ELocationType {
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE',
}

const experienceItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Job title is required'),
  employmentType: z.nativeEnum(EEmploymentType),
  locationType: z.nativeEnum(ELocationType),
  company: z.string().min(1, 'Company is required'),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  description: z.string(),
});

const experienceSchema = z.object({
  experiences: z.array(experienceItemSchema),
});

type TExperienceItem = z.infer<typeof experienceItemSchema>;
type TExperienceFormValues = z.infer<typeof experienceSchema>;

const ExperienceSection = () => {
  const experiences = useResumeStore((state) => state.resume.experiences);
  const addExperience = useResumeStore((state) => state.addExperience);
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const removeExperience = useResumeStore((state) => state.removeExperience);
  const reorderExperiences = useResumeStore((state) => state.reorderExperiences);
  const setExperiences = useResumeStore((state) => state.setExperiences);

  const form = useForm<TExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experiences: experiences.map((exp: TExperienceItem) => ({
        ...exp,
        endDate: null,
      }))
    },
  });

  useEffect(() => {
    form.setValue('experiences', experiences);
  }, [experiences, form.setValue]);

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

  const { fields, move, remove } = useFieldArray<TExperienceFormValues, 'experiences', 'formId'>({
    control: form.control,
    name: 'experiences',
    keyName: 'formId', // Prevent key conflicts with our existing 'id' field
  });

  // Save form data when component unmounts or when experiences change
  useEffect(() => {
    return () => {
      // Only save if form is valid
      form.trigger().then((isValid) => {
        if (isValid) {
          const formData = form.getValues();
          if (formData.experiences?.length > 0) {
            setExperiences(formData.experiences);
            console.log("Auto-saved valid experiences before unmount");
          }
        } else {
          console.log("Not saving invalid form data");
        }
      });
    };
  }, [form, setExperiences]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('handleDragEnd() active: ', active, ' over: ', over)
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        console.log('handleDragEnd() moving')
        move(oldIndex, newIndex);
        reorderExperiences(arrayMove(fields, oldIndex, newIndex).map(item => item.id));
      }
    }
  };

  const handleRemoveExperience = (index: number, id: string) => {
    remove(index);
    removeExperience(id);
  };

  const onSave = (data: TExperienceFormValues) => {
    setExperiences(data.experiences);
    console.log("Experiences Updated:", data);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
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
                  <ExperienceItem
                    key={field.id}
                    field={field}
                    index={index}
                    control={form.control}
                    setValue={form.setValue}
                    removeExperience={() => handleRemoveExperience(index, field.id)}
                  />
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
        </form>
      </Form>
    </div>
  );
};

export default ExperienceSection;
