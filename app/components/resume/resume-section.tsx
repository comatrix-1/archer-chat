import { useResumeForm } from "~/hooks/use-resume-form";
import type {
  Contact,
  Education,
  Experience,
  HonorsAwards,
  LicenseCertification,
  Project,
  Resume,
  Skill,
} from "@prisma/client";
import { EResumeSteps } from "~/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import React, { useCallback, useMemo, useRef } from "react";
import { Textarea } from "~/components/ui/textarea";
import CertificationSection from "~/components/resume/certification-section";
import {EducationSection} from "~/components/resume/education-section";
import { ExperienceSectionDnD, type ExperienceItem } from "~/components/resume/experience-section-dnd";
import type { Control, UseFormSetValue } from "react-hook-form";

// Extend the ExperienceItem type to match the form data
interface ResumeFormExperienceItem extends Omit<ExperienceItem, 'id'> {
  id: string;
  resumeId: string;
}
import HonorsAwardsSection from "~/components/resume/honors-awards-section";
import ProjectSection from "~/components/resume/project-section";
import SkillsSection from "~/components/resume/skills-section";
import { Button } from "~/components/ui/button";
import { ResumeSteps } from "../resume-steps";
import { exportResumeToDocx } from "~/utils/docx-exporter";
import type { ResumeFormData } from "~/hooks/use-resume-form";
import ContactSection from "./contact-section";

// Memoized form components to prevent unnecessary re-renders
const PersonalStep = React.memo(
  ({ control }: { control: Control<ResumeFormData> }) => (
    <>
      <ContactSection control={control} />
      <FormField
      control={control}
      name="objective"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Objective</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder="A passionate software engineer with 5+ years of experience..."
              className="min-h-[120px]"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
));
PersonalStep.displayName = "PersonalStep";

export const ResumeSection = ({
  initialResume,
  resumeStep: initialResumeStep = EResumeSteps.PERSONAL,
}: Readonly<{
  initialResume: Resume & {
    contact: Contact;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
    honorsAwards: HonorsAwards[];
    licenseCertifications: LicenseCertification[];
    projects: Project[];
  };
  resumeStep?: EResumeSteps;
}>) => {
  const [currentStep, setCurrentStep] =
    React.useState<EResumeSteps>(initialResumeStep);
  console.log("Rendering ResumeSection with currentStep: ", currentStep);

  const {
    form,
    formState,
    handleSubmit,
    loading,
    resume,
    skillFields,
    experienceFields,
    educationFields,
    certificationFields,
    honorsAwardsFields,
    projectFields,
    appendSkill,
    appendExperience,
    appendEducation,
    appendCertification,
    appendHonorsAward,
    appendProject,
    removeSkill,
    removeExperience,
    removeEducation,
    removeCertification,
    removeHonorsAward,
    removeProject,
    blocker,
  } = useResumeForm(initialResume);

  const formRef = useRef<HTMLFormElement>(null);

  // Memoize derived values
  const steps = useMemo(() => Object.values(EResumeSteps), []);
  const currentIndex = useMemo(
    () => steps.indexOf(currentStep),
    [currentStep, steps],
  );
  const isFirstStep = useMemo(() => currentIndex === 0, [currentIndex]);
  const isLastStep = useMemo(
    () => currentIndex === steps.length - 1,
    [currentIndex, steps],
  );

  // Memoize the step content to prevent unnecessary re-renders
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case EResumeSteps.PERSONAL:
        return <PersonalStep control={form.control} />;
      case EResumeSteps.EXPERIENCE:
        return (
          <ExperienceSectionDnD
            resumeId={resume?.id || ''}
            control={form.control}
            setValue={form.setValue}
            experienceFields={experienceFields as ExperienceItem[]}
            appendExperience={appendExperience}
            removeExperience={removeExperience}
          />
        );
      case EResumeSteps.EDUCATION:
        return (
          <EducationSection
            educationFields={educationFields}
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            removeEducation={removeEducation}
            appendEducation={(edu) => {
              appendEducation(edu, {
                shouldFocus: false,
              });
            }}
          />
        );
      case EResumeSteps.SKILLS:
        return (
          <SkillsSection
            skills={skillFields}
            control={form.control}
            appendSkill={appendSkill}
            removeSkill={removeSkill}
          />
        );
      case EResumeSteps.CERTIFICATIONS:
        return (
          <CertificationSection
            certificationFields={certificationFields}
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            removeCertification={removeCertification}
            appendCertification={appendCertification}
            resumeId={resume?.id}
          />
        );
      case EResumeSteps.PROJECTS:
        return (
          <ProjectSection
            projectFields={projectFields}
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            removeProject={removeProject}
            appendProject={appendProject}
            resumeId={resume?.id}
          />
        );
      case EResumeSteps.AWARDS:
        return (
          <HonorsAwardsSection
            honorsAwardsFields={honorsAwardsFields}
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            removeHonorsAward={removeHonorsAward}
            appendHonorsAward={appendHonorsAward}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    form.control,
    form.setValue,
    form.getValues,
    experienceFields,
    educationFields,
    skillFields,
    certificationFields,
    projectFields,
    honorsAwardsFields,
    removeExperience,
    removeEducation,
    removeSkill,
    removeCertification,
    removeProject,
    removeHonorsAward,
    appendExperience,
    appendEducation,
    appendSkill,
    appendCertification,
    appendProject,
    appendHonorsAward,
    resume?.id,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => exportResumeToDocx(form.getValues())}
        >
          Export to DOCX
        </Button>
        <Button
          variant={formState.isDirty ? "default" : "secondary"}
          disabled={!formState.isDirty}
          type="submit"
        >
          {formState.isDirty ? "Save Changes" : "No Changes"}
        </Button>
      </div>
      <ResumeSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <Form {...form}>
        <form
          id="resume-form"
          method="post"
          className="space-y-6 p-6 bg-card rounded-lg border transition-colors duration-200"
          ref={formRef}
          onSubmit={handleSubmit}
          action="/api/resume"
        >
          <div className="min-h-[400px] transition-opacity duration-200">
            {stepContent}
          </div>
        </form>
      </Form>
    </div>
  );
};
