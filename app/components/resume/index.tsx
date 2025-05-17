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
  SkillCategory,
  SkillProficiency,
  EmploymentType,
  LocationType,
} from "@prisma/client";
import { Plus } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useBlocker } from "react-router";
import CertificationSection from "~/components/resume/certification-section";
import ContactSection from "~/components/resume/contact-section";
import EducationSection from "~/components/resume/education-section";
import ExperienceSection from "~/components/resume/experience-section";
import HonorsAwardsSection from "~/components/resume/honors-awards-section";
import ProjectSection from "~/components/resume/project-section"; // Import ProjectSection
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
} from "~/components/ui/alert-dialog"; // Keep this
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
import { generateUUID } from "~/utils/security"; // Keep this
import { exportResumeToDocx } from "~/utils/docx-exporter"; // Import the new function
import pkg from "file-saver";
const { saveAs } = pkg;
import { fetchWithAuth } from "../../utils/fetchWithAuth";

function convertDatesToISO<T>(data: T): T {
  if (typeof data === "object" && data !== null) {
    if (data instanceof Date) {
      return data.toISOString() as T;
    }
    if (Array.isArray(data)) {
      return data.map((item) => convertDatesToISO(item)) as T;
    }
    const newData: Record<string, unknown> = {};
    Object.keys(data).forEach((key) => {
      newData[key] = convertDatesToISO((data as Record<string, unknown>)[key]);
    });
    return newData as T;
  }
  return data;
}

type ResumeFormData = {
  objective: string;
  contact: Contact;
  experiences: (Omit<
    Experience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType | string;
    locationType: LocationType | string;
  })[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: (Omit<
    Skill,
    "resumeId" | "createdAt" | "updatedAt" | "category" | "proficiency"
  > & {
    category: SkillCategory | string;
    proficiency: SkillProficiency | string;
  })[];
  licenseCertifications: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  honorsAwards: Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt">[];
  projects: Omit<Project, "resumeId">[]; // Add projects type
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
    projects: Project[]; // Add projects to initial type
  };
}>) {
  const [resume, setResume] = useState(initialResume);
  console.log("ResumeComponent() :: resume: ", resume);
  const hasUnsavedChanges = React.useRef(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const defaultValues = React.useMemo(
    () => ({
      ...resume,
      experiences: resume.experiences?.map((exp: Experience) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })) ?? [],
      educations: resume.educations?.map((edu: Education) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        })) ?? [],
      licenseCertifications: resume.licenseCertifications?.map(
        (cert: LicenseCertification) => ({
          ...cert,
          issueDate: cert.issueDate ? new Date(cert.issueDate) : undefined,
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
        })
      ) ?? [],
      honorsAwards: resume.honorsAwards?.map((award: HonorsAwards) => ({
          ...award,
          date: award.date ? new Date(award.date) : undefined,
        })) ?? [],
      // Add projects default values
      projects: resume.projects?.map((proj: Project) => ({
          ...proj,
          startDate: proj.startDate ? new Date(proj.startDate) : undefined,
          endDate: proj.endDate ? new Date(proj.endDate) : undefined,
        })) ?? [],
    }),
    [resume]
  );

  const form = useForm<ResumeFormData>({
    defaultValues,
    // resolver: zodResolver(resumeSchema) // If you were using Zod
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

  const handleAddSkill = () => {
    appendSkill({
      id: generateUUID(),
      name: "",
      proficiency: SkillProficiency.BEGINNER, // Use enum default
      category: SkillCategory.TECHNICAL, // Use enum default
    });
  };

  const handleAddExperience = () => {
    appendExperience({
      id: generateUUID(),
      title: "",
      employmentType: EmploymentType.FULL_TIME, // Use enum default
      company: "",
      startDate: new Date(),
      endDate: null,
      location: "",
      locationType: LocationType.ON_SITE, // Use enum default
      description: "",
    });
  };

  const handleAddEducation = () => {
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
  };

  const handleAddCertification = () => {
    appendCertification({
      id: generateUUID(),
      name: "",
      issuer: "",
      issueDate: new Date(),
      expiryDate: null,
      credentialId: null,
    });
  };

  const handleAddHonorsAward = () => {
    appendHonorsAward({
      id: generateUUID(),
      title: "",
      issuer: "",
      date: new Date(),
      description: "",
    });
  };

  // Add handler for projects
  const handleAddProject = () => {
    appendProject({
      id: generateUUID(),
      title: "",
      startDate: new Date(),
      endDate: null,
      description: "",
    });
  };

  useEffect(() => {
    hasUnsavedChanges.current = form.formState.isDirty;
  }, [form.formState.isDirty]);

  useEffect(() => {
    if (resume) {
      console.log("resetting resume to: ", resume);
      // Process resume data for form reset, ensuring Date objects
      const processedResumeForEffectReset: ResumeFormData = { // Explicitly type parameters in .map
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
        experiences: resume.experiences?.map((exp: Experience) => ({
          ...exp, // Spreads Prisma Experience (strict enums, potentially date strings if 'resume' came from API without processing)
          id: exp.id ?? generateUUID(),
          startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
        })) ?? [],
        educations: resume.educations?.map((edu: Education) => ({
          ...edu,
          id: edu.id ?? generateUUID(),
          startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          gpa: edu.gpa ?? null,
          gpaMax: edu.gpaMax ?? null,
        })) ?? [],
        skills: resume.skills?.map((skill: Skill) => ({
          ...skill, // Spreads Prisma Skill (strict enums)
          id: skill.id ?? generateUUID(),
        })) ?? [],
        licenseCertifications:
          resume.licenseCertifications?.map(
            (cert: LicenseCertification) => ({
              ...cert,
              id: cert.id ?? generateUUID(),
              issueDate: cert.issueDate
                ? new Date(cert.issueDate)
                : new Date(),
              expiryDate: cert.expiryDate
                ? new Date(cert.expiryDate)
                : null,
              credentialId: cert.credentialId ?? null,
            })
          ) ?? [],
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
            startDate: proj.startDate
              ? new Date(proj.startDate)
              : new Date(),
            endDate: proj.endDate ? new Date(proj.endDate) : null,
          })) ?? [],
      };
      form.reset(processedResumeForEffectReset);
    }
  }, [form, resume]);

  const handleSubmit = async (data: ResumeFormData) => {
    try {
      // Convert dates to ISO format
      const processedData = convertDatesToISO(data);
      
      const response = await fetchWithAuth("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update resume");
      }

      // Reset unsaved changes flag after successful save
      hasUnsavedChanges.current = false;
      
      // Reset the form to the saved state
      form.reset(processedData);
      
      alert("Resume updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error updating resume: ${error.message}`);
      } else {
        alert("An error occurred while updating the resume. Please try again.");
      }
    }
  };

  const blocker = useBlocker((to) => {
    if (hasUnsavedChanges.current) {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      
      if (confirmed) {
        // User wants to proceed with navigation
        return true;
      } else {
        // User wants to stay
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    if (blocker.state === "blocked") {
      // Show confirmation dialog
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      
      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

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
          onSubmit={form.handleSubmit(handleSubmit)}
          action="/api/resume"
        >
          <input type="hidden" name="intent" value="update" />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Resume</h1>
            <div className="flex gap-2">
              {" "}
              {/* Group buttons */}
              <Button
                type="button" // Important: Prevent form submission
                variant="outline"
                onClick={() => exportResumeToDocx(form.getValues())} // Call the imported function
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
            {/* Contact Information Accordion Item */}
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

            {/* Skills Accordion Item */}
            <AccordionItem value="skills" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Skills</h2>
                  {/* Replace div with Button */}
                  <Button
                    type="button"
                    className={cn(
                      "p-1 h-auto" // Adjust padding/height as needed
                    )}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddSkill();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                        handleAddSkill();
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

            {/* Work Experience Accordion Item */}
            <AccordionItem
              value="experience"
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Work Experience</h2>
                  {/* Replace div with Button */}
                  <Button
                    type="button"
                    className={cn(
                      "p-1 h-auto" // Adjust padding/height as needed
                    )}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddExperience();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                        handleAddExperience();
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

            {/* Education Accordion Item */}
            <AccordionItem value="education" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Education</h2>
                  {/* Replace div with Button */}
                  <Button
                    type="button"
                    className={cn(
                      "p-1 h-auto" // Adjust padding/height as needed
                    )}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddEducation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                        handleAddEducation();
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

            {/* Projects Accordion Item */}
            <AccordionItem value="projects" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Projects</h2>
                  <Button
                    type="button"
                    className={cn("p-1 h-auto")}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddProject();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleAddProject();
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

            {/* Certifications Accordion Item */}
            <AccordionItem
              value="certifications"
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Certifications</h2>
                  {/* Replace div with Button */}
                  <Button
                    type="button"
                    className={cn(
                      "p-1 h-auto" // Adjust padding/height as needed
                    )}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddCertification();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                        handleAddCertification();
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

            {/* Honors and Awards Accordion Item */}
            <AccordionItem
              value="honorsAwards"
              className="border rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between space-x-2 w-full mr-2">
                  <h2 className="text-lg font-semibold">Honors and Awards</h2>
                  {/* Replace div with Button */}
                  <Button
                    type="button"
                    className={cn(
                      "p-1 h-auto" // Adjust padding/height as needed
                    )}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddHonorsAward();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                        handleAddHonorsAward();
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
              <AlertDialogCancel onClick={() => blocker.reset()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => blocker.proceed()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
