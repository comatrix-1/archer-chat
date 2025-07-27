"use client";

import { Check } from "lucide-react";
import { Card } from "@project/remix/app/components/ui/card";
import type { EResumeSteps } from "@project/remix/app/types/resume"
import { cn } from "@project/remix/app/lib/utils";
import { steps } from "@project/remix/app/types/resume";

const StepIcon = ({ 
  active = false, 
  completed = false, 
  step 
}: { 
  active?: boolean; 
  completed?: boolean; 
  step: number 
}) => (
  <div 
    className={cn(
      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
      completed 
        ? "bg-primary text-primary-foreground" 
        : active 
          ? "border-2 border-primary text-primary bg-background"
          : "border-2 border-muted-foreground/25 text-muted-foreground bg-background"
    )}
  >
    {completed ? <Check className="h-4 w-4" /> : step}
  </div>
);

interface ResumeStepsProps {
  currentStep: EResumeSteps;
  setCurrentStep: (step: EResumeSteps) => void;
}

export function ResumeSteps({ currentStep, setCurrentStep }: Readonly<ResumeStepsProps>) {
  console.log('Rendering ResumeSteps with currentStep:', currentStep);
  return (
    <Card className="p-6">
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === step.id;
            const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;
            const isLast = index === steps.length - 1;

            return (
              <div 
                key={step.id} 
                className="flex-1 flex flex-col items-center relative"
              >
                <div className="flex flex-col items-center w-full">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "rounded-full p-1.5 mb-2 transition-all duration-300",
                    )}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={step.title}
                  >
                    <StepIcon 
                      active={isActive} 
                      completed={isCompleted} 
                      step={stepNumber} 
                    />
                  </button>
                  <span 
                    className={cn(
                      "text-xs font-medium text-center mt-1 px-2",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
