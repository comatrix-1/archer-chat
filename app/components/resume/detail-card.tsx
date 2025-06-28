"use client";

import { ChevronDown, GripHorizontal, Trash2, Calendar, GraduationCap, School, Map, Globe, ClipboardList, Info, Wand2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface DetailCardProps {
    id: string;
    index: number;
    title: string;
    onDelete: (id: string) => void;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function DetailCard({
    id,
    index,
    title,
    onDelete,
    children,
    defaultOpen = true,
}: Readonly<DetailCardProps>) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    console.log('Rendering DetailCard with id:', id, 'title:', title, 'isOpen:', isOpen);

    return (
        <div className="rounded-xl border bg-background shadow-sm dark:border-border/30 dark:bg-background/80 transition-all duration-200 hover:shadow-md">
            <button
                className="w-full flex justify-between items-center p-3 sm:p-4 rounded-t-xl rounded-b-none bg-muted hover:bg-secondary border-b border-dashed border-muted cursor-pointer select-none"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(prev => !prev);
                }}
                tabIndex={0}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <button
                        type="button"
                        className="cursor-move rounded-lg p-1 sm:p-1.5 hover:bg-muted/75 active:bg-muted transition-colors"
                        aria-label="Drag to reorder"
                    >
                        <GripHorizontal className="size-4 sm:size-5 text-muted-foreground" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary flex-shrink-0">
                                #{index + 1}
                            </span>
                            <span className="text-muted-foreground italic text-sm truncate">
                                {title || "Untitled"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 ml-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(id);
                        }}
                    >
                        <Trash2 className="size-3.5 sm:size-4" />
                    </Button>
                    <div
                        className={cn(
                            "text-muted-foreground transition-transform duration-200",
                            isOpen ? "rotate-180" : ""
                        )}
                    >
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 sm:p-5 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
}

interface DetailCardFieldProps {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    helpText?: string;
}

export function DetailCardField({
    label,
    icon,
    children,
    className = "",
    helpText,
}: Readonly<DetailCardFieldProps>) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-muted-foreground text-sm">
                    {icon}
                    {label}
                </label>
                {helpText && (
                    <div className="cursor-help" data-state="closed">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}