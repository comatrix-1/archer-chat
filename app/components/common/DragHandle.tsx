// src/components/common/DragHandle.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // Or use Heroicon

export function DragHandle() {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: 'drag-handle', // This ID is arbitrary for the handle itself, not the item
  });

  // Note: For the drag handle, we usually want to apply listeners/attributes to the handle element itself,
  // not the container that is the reference for the sortable item.
  // The item itself will be referenced using `setNodeRef` outside this component.

  return (
    <div
      ref={setNodeRef} // This is important if the handle IS the draggable element
      {...attributes}
      {...listeners}
      className="cursor-grab p-2 hover:bg-gray-200 rounded-md"
    >
      <GripVertical className="h-5 w-5 text-gray-500" />
    </div>
  );
}