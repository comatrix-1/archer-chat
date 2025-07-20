import React from 'react';
import { useForm, useFieldArray, Controller, type Control, type FieldArrayWithId, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// No longer using Zustand for form state
import { Plus, Trash2, GripVertical } from 'lucide-react';
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
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
// Using default keyboard coordinates from @dnd-kit/core
import { CSS } from '@dnd-kit/utilities';
import type { ResumeFormData } from '~/types/resume';



export function Education() {
  const form = useFormContext<ResumeFormData>();

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'educations',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        // Default keyboard coordinate getter logic
        if (event instanceof KeyboardEvent) {
          const keyboardEvent = event;
          switch (keyboardEvent.key) {
            case 'ArrowLeft':
              return { x: -1, y: 0 };
            case 'ArrowRight':
              return { x: 1, y: 0 };
            case 'ArrowUp':
              return { x: 0, y: -1 };
            case 'ArrowDown':
              return { x: 0, y: 1 };
            default:
              return { x: 0, y: 0 };
          }
        }
        return { x: 0, y: 0 };
      },
    })
  );

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


  const handleAddEducation = () => {
    append({
      id: crypto.randomUUID(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: ''
    });
  };

  const handleRemoveEducation = (index: number) => {
    remove(index);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Education</CardTitle>
        <Button onClick={handleAddEducation} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </CardHeader>
      <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <SortableEducationItem
                    field={field}
                    index={index}
                    control={control}
                    removeEducation={() => handleRemoveEducation(index)}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
          {!fields.length && <p className="text-center text-muted-foreground">No education added yet.</p>}
      </CardContent>
      <CardFooter>
        <Button type="submit" form="education-form">Save Education</Button>
      </CardFooter>
    </Card>
  );
}

// Type for education item in the form
export interface EducationFormItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

// Helper component for each sortable education item
interface SortableEducationItemProps {
  field: FieldArrayWithId<{ education: EducationFormItem[] }, 'education'>;
  index: number;
  control: Control<ResumeFormData>;
  removeEducation: () => void;
}

const SortableEducationItem = React.memo(({ field, index, control, removeEducation }: SortableEducationItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition as string,
    zIndex: isDragging ? 1 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-lg p-4 mb-4 bg-white shadow-sm ${isDragging ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center mb-3">
        <div {...listeners} {...attributes} className="cursor-grab p-2 hover:bg-gray-200 rounded-md">
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <div className="ml-3 font-semibold text-lg flex-grow">
          <Controller
            name={`education.${index}.degree`}
            control={control}
            render={({ field }) => <span>{field.value || 'New Degree'}</span>}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={removeEducation} className="ml-auto">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`education.${index}.degree`}>Degree</Label>
          <Controller
            name={`education.${index}.degree`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`education.${index}.degree`}
                placeholder="e.g., Bachelor of Science"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`education.${index}.institution`}>Institution</Label>
          <Controller
            name={`education.${index}.institution`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`education.${index}.institution`}
                placeholder="e.g., University of Example"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`education.${index}.location`}>Location</Label>
          <Controller
            name={`education.${index}.location`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`education.${index}.location`}
                placeholder="e.g., City, Country"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`education.${index}.startDate`}>Start Date</Label>
          <Controller
            name={`education.${index}.startDate`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                id={`education.${index}.startDate`}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`education.${index}.endDate`}>End Date</Label>
          <Controller
            name={`education.${index}.endDate`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                id={`education.${index}.endDate`}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`education.${index}.gpa`}>GPA (Optional)</Label>
          <Controller
            name={`education.${index}.gpa`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`education.${index}.gpa`}
                placeholder="e.g., 3.8/4.0"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
});

SortableEducationItem.displayName = 'SortableEducationItem';