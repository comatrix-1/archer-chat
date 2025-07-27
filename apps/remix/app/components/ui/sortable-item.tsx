import { memo, useCallback, useState } from 'react';
import { ChevronDown, GripHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@project/remix/app/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@project/remix/app/lib/utils';

interface SortableItemProps {
  id: string;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
  dragHandleClassName?: string;
  dragHandleAriaLabel?: string;
  removeButtonAriaLabel?: string;
  defaultOpen?: boolean;
  [key: string]: unknown; // Allow additional props
}

const SortableItemComponent = ({
  id,
  onRemove,
  children,
  className = '',
  dragHandleClassName = 'cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1.5 hover:bg-muted/50',
  dragHandleAriaLabel = 'Drag to reorder',
  removeButtonAriaLabel = 'Remove item',
  defaultOpen = true,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { role, ...restAttributes } = attributes;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const toggleOpen = useCallback((e: React.MouseEvent) => {
    // Don't toggle if clicking on drag handle or remove button
    if ((e.target as HTMLElement).closest('button[aria-label*="Drag"]') ||
        (e.target as HTMLElement).closest('button[aria-label*="Remove"]')) {
      return;
    }
    setIsOpen(prev => !prev);
  }, []);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative',
    touchAction: 'none',
  };

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  }, [onRemove]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-xl border bg-background shadow-sm dark:border-border/30 dark:bg-background/80',
        'hover:shadow-md transition-shadow duration-200',
        isDragging && 'ring-2 ring-ring ring-offset-2',
        className
      )}
      data-draggable-id={id}
    >
      <button 
        className="w-full flex justify-between items-center p-3 sm:p-4 rounded-t-xl rounded-b-none bg-muted hover:bg-secondary border-b border-dashed border-muted select-none cursor-pointer transition-colors"
        onClick={toggleOpen}
        type="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <button
            type="button"
            {...listeners}
            {...restAttributes}
            className={cn(
              'flex items-center justify-center',
              dragHandleClassName
            )}
            aria-label={dragHandleAriaLabel}
          >
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-2">
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )} />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-muted-foreground text-sm font-medium truncate">
                  {isOpen ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleRemove}
            aria-label={removeButtonAriaLabel}
          >
            <Trash2 className="size-3.5 sm:size-4" />
          </Button>
        )}
      </button>

      <div 
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isOpen}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const SortableItem = memo(SortableItemComponent);

SortableItem.displayName = 'SortableItem';
