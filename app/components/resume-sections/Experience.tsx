import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useResumeStore } from '../../states/resumeStore';
import type { 
  ExperienceFormValues, 
  SortableExperienceItemProps 
} from './types';

import { GripVertical, Plus, Trash2 } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';



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

  const { control, handleSubmit, reset } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experiences: [] }, // Will be reset with actual data
  });

  React.useEffect(() => {
    reset({ experiences: experiences });
  }, [experiences, reset]);

  const { fields, move } = useFieldArray({
    control,
    name: 'experiences',
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
                <SortableExperienceItem
                  key={field.id}
                  field={field}
                  index={index}
                  control={control}
                  removeExperience={() => removeExperience(field.id)}
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



const SortableExperienceItem = ({
  field,
  index,
  control,
  removeExperience,
  handleUpdate,
}: SortableExperienceItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border rounded-lg p-4 mb-4 bg-white shadow-sm ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-center mb-3">
        <div {...listeners} {...attributes} className="cursor-grab p-2 hover:bg-gray-200 rounded-md">
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <div className="ml-3 font-semibold text-lg flex-grow">
          {field.jobTitle || 'New Position'}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={removeExperience}
          className="ml-auto"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`jobTitle-${field.id}`}>Job Title</Label>
          <Controller
            name={`experiences.${index}.jobTitle`}
            control={control}
            render={({ field }) => (
              <Input
                id={`jobTitle-${field.name}`}
                value={field.value}
                placeholder="e.g., Senior Software Engineer"
                onChange={(e) => {
                  field.onChange(e);
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
            render={({ field }) => (
              <Input
                id={`company-${field.name}`}
                value={field.value}
                placeholder="e.g., Tech Corp Inc."
                onChange={(e) => {
                  field.onChange(e);
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
            render={({ field }) => (
              <Input
                id={`location-${field.name}`}
                value={field.value || ''}
                placeholder="e.g., San Francisco, CA"
                onChange={(e) => {
                  field.onChange(e);
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
            render={({ field }) => (
              <Input
                id={`startDate-${field.name}`}
                type="month"
                value={field.value || ''}
                placeholder="Start Date"
                onChange={(e) => {
                  field.onChange(e);
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
            render={({ field }) => (
              <Input
                id={`endDate-${field.name}`}
                type="month"
                value={field.value || ''}
                placeholder="End Date (or present)"
                onChange={(e) => {
                  field.onChange(e);
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
  );
};

SortableExperienceItem.displayName = 'SortableExperienceItem'; // For debugging