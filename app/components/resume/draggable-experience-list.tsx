"use client";

import { useState, type ReactNode } from 'react';

interface DraggableExperienceListProps<T> {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  children: (item: T, index: number) => ReactNode;
  getItemId?: (item: T) => string;
  ariaLabel?: string;
}

export function DraggableExperienceList<T extends { id: string }>({
  items,
  onReorder,
  children,
  getItemId = (item: T) => item.id,
  ariaLabel = 'Draggable list of items',
}: DraggableExperienceListProps<T>) {
  // Track drag state for visual feedback
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData('text/plain');
    const targetId = (e.currentTarget as HTMLElement).dataset.id;
    
    if (!droppedId || !targetId || droppedId === targetId) return;

    const currentIndex = items.findIndex(item => getItemId(item) === droppedId);
    const targetIndex = items.findIndex(item => getItemId(item) === targetId);
    
    if (currentIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    
    onReorder(newItems);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Handle keyboard reorder if needed
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className="space-y-2"
        role="list"
        aria-label={ariaLabel}
      >
        {items.map((item, index) => {
          const itemId = getItemId(item);
          return (
            <button
              key={itemId}
              data-id={itemId}
              draggable
              className="w-full text-left rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 cursor-grab active:cursor-grabbing"
              onDragStart={(e) => handleDragStart(e, itemId)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              role="listitem"
              aria-label={`Item ${index + 1} of ${items.length}`}
              type="button"
            >
              {children(item, index)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
