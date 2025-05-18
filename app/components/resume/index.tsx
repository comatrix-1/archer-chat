"use client";
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
import {
  EmploymentType,
  LocationType,
  SkillCategory,
  SkillProficiency,
} from "@prisma/client";
import { Plus } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useBlocker } from "react-router";
import CertificationSection from "~/components/resume/certification-section";
import ContactSection from "~/components/resume/contact-section";
import EducationSection from "~/components/resume/education-section";
import ExperienceSection from "~/components/resume/experience-section";
import HonorsAwardsSection from "~/components/resume/honors-awards-section";
import ProjectSection from "~/components/resume/project-section";
import SkillsSection from "~/components/resume/skills-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { exportResumeToDocx } from "~/utils/docx-exporter";
import { generateUUID } from "~/utils/security";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
type ResumeFormData = {
  objective: string;
  contact: Contact;
  experiences: (Omit<
    Experience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType;
    locationType: LocationType;
  })[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: (Omit<
    Skill,
    "resumeId" | "createdAt" | "updatedAt" | "category" | "proficiency"
  > & {
    category: SkillCategory;
    proficiency: SkillProficiency;
  })[];
  licenseCertifications: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  honorsAwards: Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt">[];
  projects: Omit<Project, "resumeId">[];
};
export default function ResumeComponent({
  initialResume,
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
}>) {
  const [resume, setResume] = useState(initialResume);
  console.log("ResumeComponent() :: resume: ", resume);
  const formRef = React.useRef<HTMLFormElement>(null);
  const form = useForm<ResumeFormData>({
    defaultValues: {
      objective: resume.objective ?? "",
      contact: resume.contact
        ? { ...resume.contact }
        : {
            id: generateUUID(),
            phone: "",
            email: "",
            name: "",
            linkedin: null,
            portfolio: null,
            city: "",
            country: "",
          },
      experiences:
        resume.experiences?.map((exp: Experience) => ({
          ...exp,
          id: exp.id ?? generateUUID(),
          startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
        })) ?? [],
      educations:
        resume.educations?.map((edu: Education) => ({
          ...edu,
          id: edu.id ?? generateUUID(),
          startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          gpa: edu.gpa ?? null,
          gpaMax: edu.gpaMax ?? null,
        })) ?? [],
      skills:
        resume.skills?.map((skill: Skill) => ({
          ...skill,
          id: skill.id ?? generateUUID(),
        })) ?? [],
      licenseCertifications:
        resume.licenseCertifications?.map((cert: LicenseCertification) => ({
          ...cert,
          id: cert.id ?? generateUUID(),
          issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
          credentialId: cert.credentialId ?? null,
        })) ?? [],
      honorsAwards:
        resume.honorsAwards?.map((award: HonorsAwards) => ({
          ...award,
          id: award.id ?? generateUUID(),
          date: award.date ? new Date(award.date) : new Date(),
        })) ?? [],
      projects:
        resume.projects?.map((proj: Project) => ({
          ...proj,
          id: proj.id ?? generateUUID(),
          startDate: proj.startDate ? new Date(proj.startDate) : new Date(),
          endDate: proj.endDate ? new Date(proj.endDate) : null,
        })) ?? [],
    },
  });
  const { control } = form;
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });
  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experiences",
  });
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "educations",
  });
  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "licenseCertifications",
  });
  const {
    fields: honorsAwardsFields,
    append: appendHonorsAward,
    remove: removeHonorsAward,
  } = useFieldArray({
    control,
    name: "honorsAwards",
  });
  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: "projects",
  });

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      form.formState.isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const response = await fetchWithAuth("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response) {
        throw new Error("No response from server");
      }
      const responseData = await response.data;
      setResume(responseData);
      if (blocker) {
        blocker.reset?.();
      }
    } catch (error) {
      console.error("Error saving resume:", error);
    }
  });
  useEffect(() => {
    form.handleSubmit(() => {
      blocker?.reset?.();
    });
  }, [form, blocker]);
  if (!resume) {
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
              {" "}
              {}
              <Button
                type="button"
                variant="outline"
                onClick={() => exportResumeToDocx(form.getValues())}
              >
                Export to DOCX
              </Button>
              <Button
                variant={form.formState.isDirty ? "default" : "secondary"}
                disabled={!form.formState.isDirty}
                type="submit"
              >
                {form.formState.isDirty ? "Save Changes" : "No Changes"}
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
              value="honorsAwards"
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
