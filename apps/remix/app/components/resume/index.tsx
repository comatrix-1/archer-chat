"use client";
import type {
  Contact,
  Education,
  Experience,
  awards,
  LicenseCertification,
  Project,
  Resume,
  Skill,
} from "@prisma/client";
import {
  EmploymentType,
  LocationType,
  SkillCategory,
  SkillProficiency,
} from "@prisma/client";
import { Plus } from "lucide-react";
import * as React from "react";
import CertificationSection from "@project/remix/app/components/resume/certification-section";
import {ContactSection} from "@project/remix/app/components/resume/contact-section";
import {EducationSection} from "@project/remix/app/components/resume/education-section";
import ExperienceSection from "@project/remix/app/components/resume/experience-section";
import HonorsAwardsSection from "@project/remix/app/components/resume/awards-section";
import ProjectSection from "@project/remix/app/components/resume/project-section";
import {SkillsSection} from "@project/remix/app/components/resume/skills-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@project/remix/app/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@project/remix/app/components/ui/alert-dialog";
import { Button } from "@project/remix/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@project/remix/app/components/ui/form";
import { Textarea } from "@project/remix/app/components/ui/textarea";
import { useResumeForm } from "@project/remix/app/hooks/use-resume-form";
import { cn } from "@project/remix/app/lib/utils";
import { exportResumeToDocx } from "@project/remix/app/utils/docx-exporter";
import { generateUUID } from "@project/remix/app/utils/security";

export default function ResumeComponent({
  initialResume,
}: Readonly<{
  initialResume: Resume & {
    contact: Contact;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
    awards: awards[];
    licenseCertifications: LicenseCertification[];
    projects: Project[];
  };
}>) {
  console.log("ResumeComponent() initialResume: ", initialResume);
  const formRef = React.useRef<HTMLFormElement>(null);

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

  if (loading.isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Form {...form}>
        <form
          id="resume-form"
          method="post"
          className="space-y-4"
          ref={formRef}
          onSubmit={handleSubmit}
          action="/api/resume"
        >
          <input type="hidden" name="intent" value="update" />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Resume</h1>
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
          </div>
          <Accordion
            type="single"
            collapsible
            defaultValue="contact"
            className="w-full space-y-4"
          >
            <AccordionItem value="contact" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ContactSection form={form} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="summary" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">Objective</h2>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objective</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Objective" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="skills" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Skills</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      appendSkill({
                        id: generateUUID(),
                        name: "",
                        proficiency: SkillProficiency.BEGINNER,
                        category: SkillCategory.TECHNICAL,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendSkill({
                          id: generateUUID(),
                          name: "",
                          proficiency: SkillProficiency.BEGINNER,
                          category: SkillCategory.TECHNICAL,
                        });
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="py-4 space-y-4">
                  <SkillsSection
                    skills={skillFields}
                    control={form.control}
                    removeSkill={removeSkill}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="experience"
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Work Experience</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      appendExperience({
                        id: generateUUID(),
                        title: "",
                        employmentType: EmploymentType.FULL_TIME,
                        company: "",
                        startDate: new Date(),
                        endDate: null,
                        location: "",
                        locationType: LocationType.ON_SITE,
                        description: "",
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendExperience({
                          id: generateUUID(),
                          title: "",
                          employmentType: EmploymentType.FULL_TIME,
                          company: "",
                          startDate: new Date(),
                          endDate: null,
                          location: "",
                          locationType: LocationType.ON_SITE,
                          description: "",
                        });
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ExperienceSection
                  experienceSectionFields={experienceFields}
                  control={form.control}
                  removeExperience={removeExperience}
                  setValue={form.setValue}
                  getValues={form.getValues}
                  appendExperience={(exp) => {
                    appendExperience(exp, {
                      shouldFocus: false,
                    });
                  }}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="education" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Education</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("adding education");
                      appendEducation({
                        id: generateUUID(),
                        school: "",
                        degree: "",
                        fieldOfStudy: "",
                        startDate: new Date(),
                        endDate: null,
                        gpa: null,
                        gpaMax: null,
                        location: "",
                        description: "",
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendEducation({
                          id: generateUUID(),
                          school: "",
                          degree: "",
                          fieldOfStudy: "",
                          startDate: new Date(),
                          endDate: null,
                          gpa: null,
                          gpaMax: null,
                          location: "",
                          description: "",
                        });
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <EducationSection
                  educationFields={educationFields}
                  control={form.control}
                  setValue={form.setValue}
                  removeEducation={removeEducation}
                  appendEducation={(edu) => {
                    appendEducation(edu, {
                      shouldFocus: false,
                    });
                  }}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="projects" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Projects</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      appendProject({
                        id: generateUUID(),
                        title: "",
                        startDate: new Date(),
                        endDate: null,
                        description: "",
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendProject({
                          id: generateUUID(),
                          title: "",
                          startDate: new Date(),
                          endDate: null,
                          description: "",
                        });
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ProjectSection
                  projectFields={projectFields}
                  control={form.control}
                  setValue={form.setValue}
                  getValues={form.getValues}
                  removeProject={removeProject}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="certifications"
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Certifications</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      appendCertification({
                        id: generateUUID(),
                        name: "",
                        issuer: "",
                        issueDate: new Date(),
                        expiryDate: null,
                        credentialId: null,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendCertification({
                          id: generateUUID(),
                          name: "",
                          issuer: "",
                          issueDate: new Date(),
                          expiryDate: null,
                          credentialId: null,
                        });
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CertificationSection
                  certificationFields={certificationFields}
                  control={form.control}
                  setValue={form.setValue}
                  getValues={form.getValues}
                  removeCertification={removeCertification}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="awards"
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Honors and Awards</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      appendHonorsAward({
                        id: generateUUID(),
                        title: "",
                        issuer: "",
                        date: new Date(),
                        description: "",
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendHonorsAward({
                          id: generateUUID(),
                          title: "",
                          issuer: "",
                          date: new Date(),
                          description: "",
                        });
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <HonorsAwardsSection
                  honorsAwardsFields={honorsAwardsFields}
                  control={form.control}
                  removeHonorsAward={removeHonorsAward}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
      {blocker.state === "blocked" ? (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to leave?
              </AlertDialogTitle>
              <AlertDialogDescription>
                There are unsaved changes
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => blocker.reset?.()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => blocker.proceed?.()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
