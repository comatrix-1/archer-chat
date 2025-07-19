import React from 'react';
import { useController } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { DragHandle } from '../common/DragHandle';
import type { DescriptionBulletsProps } from './types';

interface DescriptionBulletsComponentProps extends Readonly<DescriptionBulletsProps> {}

export function DescriptionBullets({ control, index, fieldId, onUpdate }: DescriptionBulletsComponentProps) {
  const { field } = useController({
    name: `experiences.${index}.description`,
    control,
  });

  const handleBulletChange = (bulletIndex: number, value: string) => {
    const newBullets = [...field.value];
    newBullets[bulletIndex] = value;
    field.onChange(newBullets);
    onUpdate('description', newBullets);
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    const newBullets = field.value.filter((_, i) => i !== bulletIndex);
    field.onChange(newBullets);
    onUpdate('description', newBullets);
  };

  const handleAddBullet = () => {
    field.onChange([...field.value, '']);
  };

  return (
    <div className="mt-4">
      <Label>Description Bullet Points</Label>
      {Array.isArray(field.value) && field.value.map((bullet: string, bulletIndex: number) => (
        <div key={`${fieldId}-bullet-${bulletIndex}-${bullet.substring(0, 10)}`} className="flex items-center mb-2">
          <div className="mr-2">
            <DragHandle />
          </div>
          <Textarea
            value={bullet}
            onChange={(e) => handleBulletChange(bulletIndex, e.target.value)}
            onBlur={() => onUpdate('description', field.value)}
            className="flex-grow min-h-[80px]"
            placeholder="Enter a bullet point (e.g., Achieved X by doing Y)"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveBullet(bulletIndex)}
            className="ml-2 text-red-500"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddBullet}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Bullet Point
      </Button>
    </div>
  );
}

export default DescriptionBullets;
