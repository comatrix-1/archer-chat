import { Button } from "@project/remix/app/components/ui/button"
import { EResumeSteps } from "@project/remix/app/types/resume";

export const ResumeNav = ({
    currentStep,
    setCurrentStep,
}: {
    currentStep: EResumeSteps;
    setCurrentStep: (step: EResumeSteps) => void;
}) => {
    const steps = [
        { id: EResumeSteps.CONTACT, label: 'Contact Info' },
        { id: EResumeSteps.SUMMARY, label: 'Summary' },
        { id: EResumeSteps.EXPERIENCE, label: 'Experience' },
        { id: EResumeSteps.EDUCATION, label: 'Education' },
        { id: EResumeSteps.SKILLS, label: 'Skills' },
        { id: EResumeSteps.PROJECTS, label: 'Projects' },
        { id: EResumeSteps.CERTIFICATIONS, label: 'Certifications' },
        { id: EResumeSteps.AWARDS, label: 'Awards' },
    ];

    return (
        <div className="flex flex-col gap-2 mb-8">
            <div className="flex flex-wrap gap-2">
                {steps.map((step) => (
                    <Button
                        key={step.id}
                        variant={currentStep === step.id ? 'default' : 'outline'}
                        onClick={() => setCurrentStep(step.id)}
                        className="capitalize"
                    >
                        {step.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
