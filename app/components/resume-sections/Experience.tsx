import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useResumeStore } from '../../states/resumeStore';
import type { ExperienceFormValues } from './types';

import { Plus } from 'lucide-react';
import { DescriptionBullets } from './DescriptionBullets';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/ui/sortable-item';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';

interface ExperienceItemProps {
  field: {
    id: string;
    jobTitle: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description: string[];
  };
  index: number;
  control: Control<ExperienceFormValues>;
  removeExperience: () => void;
  handleUpdate: (key: keyof ExperienceItemProps['field'], value: string | string[]) => void;
}



const experienceItemSchema = z.object({
  id: z.string(),
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.array(z.string()).transform(arr => arr.filter(Boolean)), // Filter out empty strings
});

const experienceSchema = z.object({
  experiences: z.array(experienceItemSchema),
});



export function Experience() {
  const experiences = useResumeStore((state) => state.resume.experiences);
  const addExperience = useResumeStore((state) => state.addExperience);
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const removeExperience = useResumeStore((state) => state.removeExperience);
  const reorderExperiences = useResumeStore((state) => state.reorderExperiences);

  const { control, handleSubmit, setValue } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experiences: experiences },
  });

  // Update form when experiences change from the store
  React.useEffect(() => {
    setValue('experiences', experiences);
  }, [experiences, setValue]);

  const { fields, move, remove } = useFieldArray({
    control,
    name: 'experiences',
    keyName: 'formId', // Prevent key conflicts with our existing 'id' field
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
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        // Use the move function from useFieldArray instead of manually updating
        move(oldIndex, newIndex);
        reorderExperiences(arrayMove(fields, oldIndex, newIndex).map(item => item.id));
      }
    }
  };

  const handleRemoveExperience = (index: number, id: string) => {
    remove(index);
    removeExperience(id);
  };

  const onSubmit = (data: ExperienceFormValues) => {
    for (const exp of data.experiences) {
      const updatedExp = {
        ...exp,
        description: exp.description.filter(Boolean),
      };
      updateExperience(exp.id, updatedExp);
    }
    console.log("Experiences Updated:", data);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Work Experience</CardTitle>
        <Button onClick={addExperience} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      </CardHeader>
      <CardContent>
        <form id="experience-form" onSubmit={handleSubmit(onSubmit)}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <ExperienceItem
                  key={field.id}
                  field={field}
                  index={index}
                  control={control}
                  removeExperience={() => handleRemoveExperience(index, field.id)}
                  handleUpdate={(key, value) => updateExperience(field.id, { ...field, [key]: value })}
                />
              ))}
            </SortableContext>
          </DndContext>
          {!fields.length && <p className="text-center text-muted-foreground">No experience added yet.</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="experience-form">Save Experience</Button>
      </CardFooter>
    </Card>
  );
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({
  field,
  index,
  control,
  removeExperience,
  handleUpdate,
}) => {
  return (
    <SortableItem
      id={field.id}
      onRemove={removeExperience}
      className="mb-4"
      dragHandleAriaLabel="Drag to reorder experience"
      removeButtonAriaLabel="Remove experience"
    >
      <div className="w-full">
        <div className="font-semibold text-lg mb-4">
          {field.jobTitle || 'New Position'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`jobTitle-${field.id}`}>Job Title</Label>
            <Controller
              name={`experiences.${index}.jobTitle`}
              control={control}
              render={({ field: controllerField }) => (
                <Input
                  id={`jobTitle-${field.id}`}
                  value={controllerField.value}
                  placeholder="e.g., Senior Software Engineer"
                  onChange={(e) => {
                    controllerField.onChange(e);
                    handleUpdate('jobTitle', e.target.value);
                  }}
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor={`company-${field.id}`}>Company</Label>
            <Controller
              name={`experiences.${index}.company`}
              control={control}
              render={({ field: controllerField }) => (
                <Input
                  id={`company-${field.id}`}
                  value={controllerField.value}
                  placeholder="e.g., Tech Corp Inc."
                  onChange={(e) => {
                    controllerField.onChange(e);
                    handleUpdate('company', e.target.value);
                  }}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor={`location-${field.id}`}>Location</Label>
            <Controller
              name={`experiences.${index}.location`}
              control={control}
              render={({ field: controllerField }) => (
                <Input
                  id={`location-${field.id}`}
                  value={controllerField.value || ''}
                  placeholder="e.g., San Francisco, CA"
                  onChange={(e) => {
                    controllerField.onChange(e);
                    handleUpdate('location', e.target.value);
                  }}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor={`startDate-${field.id}`}>Start Date</Label>
            <Controller
              name={`experiences.${index}.startDate`}
              control={control}
              render={({ field: controllerField }) => (
                <Input
                  id={`startDate-${field.id}`}
                  type="month"
                  value={controllerField.value || ''}
                  placeholder="Start Date"
                  onChange={(e) => {
                    controllerField.onChange(e);
                    handleUpdate('startDate', e.target.value);
                  }}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor={`endDate-${field.id}`}>End Date</Label>
            <Controller
              name={`experiences.${index}.endDate`}
              control={control}
              render={({ field: controllerField }) => (
                <Input
                  id={`endDate-${field.id}`}
                  type="month"
                  value={controllerField.value || ''}
                  placeholder="End Date (or present)"
                  onChange={(e) => {
                    controllerField.onChange(e);
                    handleUpdate('endDate', e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>

        <DescriptionBullets
          control={control}
          index={index}
          fieldId={field.id}
          onUpdate={(key, value) => handleUpdate(key, value)}
        />
      </div>
    </SortableItem>
  );
};

ExperienceItem.displayName = 'ExperienceItem'; // For debugging