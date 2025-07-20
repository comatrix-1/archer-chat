import type React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

type SortableItemProps = {
  id: string;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
  dragHandleClassName?: string;
  dragHandleAriaLabel?: string;
  removeButtonAriaLabel?: string;
  [key: string]: unknown; // Allow additional props
};

export function SortableItem({
  id,
  onRemove,
  children,
  className = '',
  dragHandleClassName = 'cursor-grab p-2 hover:bg-gray-200 rounded-md',
  dragHandleAriaLabel = 'Drag to reorder',
  removeButtonAriaLabel = 'Remove item',
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isOpen, setIsOpen] = useState(true);

  const { role, ...restAttributes } = attributes;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 mb-4 bg-white shadow-sm ${isDragging ? 'ring-2 ring-blue-500' : ''} ${className}`}
    >
      <div className="flex items-center mb-3">
        <button
          type="button"
          {...listeners}
          {...restAttributes}
          className={`flex items-center justify-center ${dragHandleClassName}`}
          aria-label={dragHandleAriaLabel}
          aria-expanded={isOpen}
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </button>

        {isOpen && (
          <div className="flex-grow">
            {children}
          </div>
        )}

        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="ml-auto"
            aria-label={removeButtonAriaLabel}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}

SortableItem.displayName = 'SortableItem';
