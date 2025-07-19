import React from 'react';
import { useForm, useFieldArray, Controller, type Control, type FieldArrayWithId } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useResumeStore } from '../../states/resumeStore';
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

const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

const educationSchema = z.object({
  education: z.array(educationItemSchema),
});

type EducationFormValues = z.infer<typeof educationSchema>;

export function Education() {
  const educationData = useResumeStore((state) => state.resume.education);
  const addEducation = useResumeStore((state) => state.addEducation);
  const removeEducation = useResumeStore((state) => state.removeEducation);
  const updateEducation = useResumeStore((state) => state.updateEducation);
  const reorderEducation = useResumeStore((state) => state.reorderEducation);

  const { control, handleSubmit } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: { education: educationData },
  });

  const { fields, update, remove } = useFieldArray<EducationFormValues>({
    control,
    name: 'education' as const,
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
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove([...fields], oldIndex, newIndex);
        newOrder.forEach((item, index) => {
          update(index, item);
        });
        reorderEducation(newOrder.map(item => item.id));
      }
    }
  };

  const handleRemoveEducation = (index: number, id: string) => {
    console.log('handleRemoveEducation() index: ', index, 'id: ', id);
    remove(index);
    removeEducation(id);
  };

  const onSubmit = (data: EducationFormValues) => {
    for (const edu of data.education) {
      updateEducation(edu.id, edu);
    }
    console.log("Education Updated:", data);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Education</CardTitle>
        <Button onClick={addEducation} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </CardHeader>
      <CardContent>
        <form id="education-form" onSubmit={handleSubmit(onSubmit)}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <SortableEducationItem
                    field={field}
                    index={index}
                    control={control}
                    removeEducation={() => handleRemoveEducation(index, field.id)}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
          {!fields.length && <p className="text-center text-muted-foreground">No education added yet.</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="education-form">Save Education</Button>
      </CardFooter>
    </Card>
  );
}

// Type for education item in the form
interface EducationFormItem {
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
  control: Control<EducationFormValues>;
  removeEducation: () => void;
}

const SortableEducationItem = React.memo(({ field, index, control, removeEducation }: SortableEducationItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = React.useCallback(<K extends keyof EducationFormItem>(
    key: K,
    value: EducationFormItem[K]
  ) => {
    useResumeStore.getState().updateEducation(field.id, { [key]: value } as Partial<EducationFormItem>);
  }, [field.id]);

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-lg p-4 mb-4 bg-white shadow-sm ${isDragging ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center mb-3">
        <div {...listeners} {...attributes} className="cursor-grab p-2 hover:bg-gray-200 rounded-md">
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <div className="ml-3 font-semibold text-lg flex-grow">{field.degree || 'New Degree'}</div>
        <Button variant="ghost" size="icon" onClick={removeEducation} className="ml-auto">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`degree-${index}`}>Degree</Label>
          <Controller
            name={`education.${index}.degree`}
            control={control}
            render={({ field }) => (
              <Input
                id={`degree-${index}`}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleUpdate('degree', e.target.value);
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor={`institution-${index}`}>Institution</Label>
          <Controller
            name={`education.${index}.institution`}
            control={control}
            render={({ field }) => (
              <Input
                id={`institution-${index}`}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleUpdate('institution', e.target.value);
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor={`location-${index}`}>Location</Label>
          <Controller
            name={`education.${index}.location`}
            control={control}
            render={({ field }) => (
              <Input
                id={`location-${index}`}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleUpdate('location', e.target.value);
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor={`startDate-${index}`}>Start Date</Label>
          <Controller
            name={`education.${index}.startDate`}
            control={control}
            render={({ field }) => (
              <Input
                id={`startDate-${index}`}
                type="month"
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleUpdate('startDate', e.target.value);
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor={`endDate-${index}`}>End Date</Label>
          <Controller
            name={`education.${index}.endDate`}
            control={control}
            render={({ field }) => (
              <Input
                id={`endDate-${index}`}
                type="month"
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleUpdate('endDate', e.target.value);
                }}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor={`gpa-${index}`}>GPA</Label>
          <Controller
            name={`education.${index}.gpa`}
            control={control}
            render={({ field }) => (
              <Input
                id={`gpa-${index}`}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handleUpdate('gpa', e.target.value);
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
});

SortableEducationItem.displayName = 'SortableEducationItem';