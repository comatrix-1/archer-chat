"use client";

import type {
  Contact,
  Education,
  Experience,
  HonorsAwards,
  LicenseCertification,
  Resume,
  Skill,
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
import { Button, buttonVariants } from "~/components/ui/button";
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
import { generateUUID } from "~/utils/security";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from "docx"; // Removed unused imports, added BorderStyle
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
  experiences: Omit<Experience, "resumeId" | "createdAt" | "updatedAt">[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: Omit<Skill, "resumeId" | "createdAt" | "updatedAt">[];
  licenseCertifications: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  honorsAwards: Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt">[];
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
  };
}>) {
  const [resume, setResume] = useState(initialResume);
  console.log("ResumeComponent() :: resume: ", resume);
  const hasUnsavedChanges = React.useRef(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const defaultValues = React.useMemo(
    () => ({
      ...resume,
      experiences:
        resume.experiences?.map((exp: Experience) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })) || [],
      educations:
        resume.educations?.map((edu: Education) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        })) || [],
      licenseCertifications:
        resume.licenseCertifications?.map((cert: LicenseCertification) => ({
          ...cert,
          issueDate: cert.issueDate ? new Date(cert.issueDate) : undefined,
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
        })) || [],
      honorsAwards:
        resume.honorsAwards?.map((award: HonorsAwards) => ({
          ...award,
          date: award.date ? new Date(award.date) : undefined,
        })) || [],
    }),
    [resume]
  );

  const form = useForm<ResumeFormData>({
    defaultValues,
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: "licenseCertifications",
  });

  const {
    fields: honorsAwardsFields,
    append: appendHonorsAward,
    remove: removeHonorsAward,
  } = useFieldArray({
    control: form.control,
    name: "honorsAwards",
  });

  const handleAddSkill = () => {
    appendSkill({
      id: generateUUID(),
      name: "",
      proficiency: "",
    });
  };

  const handleAddExperience = () => {
    appendExperience({
      id: generateUUID(),
      title: "",
      employmentType: "",
      company: "",
      startDate: new Date(),
      endDate: null,
      location: "",
      locationType: "",
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

  useEffect(() => {
    hasUnsavedChanges.current = form.formState.isDirty;
  }, [form.formState.isDirty]);

  useEffect(() => {
    if (resume) {
      console.log("resetting resume to: ", resume);
      form.reset({
        ...resume,
        experiences: resume.experiences || [],
        educations: resume.educations || [],
        skills: resume.skills || [],
        honorsAwards: resume.honorsAwards || [],
        licenseCertifications: resume.licenseCertifications || [],
        contact: resume.contact || {
          email: "",
          phone: "",
          linkedin: "",
          portfolio: "",
          city: "",
          country: "",
        },
      });
    }
  }, [resume]);

  const onSubmit = async (data: ResumeFormData) => {
    if (!formRef.current) return;

    // Convert dates to ISO strings
    const isoResumeData = convertDatesToISO(data);

    // Construct the payload to send as JSON (no user fields, just resume)
    const payload = {
      resume: isoResumeData,
    };

    try {
      const response = await fetchWithAuth("/api/resume", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await response.data;

      if (result.success) {
        alert("resume updated successfully!");
        setResume(result.resume);
        form.reset(result.resume);
        hasUnsavedChanges.current = false;
      } else {
        alert(`Error updating resume: ${result.message}, ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while updating the resume. Please try again.");
    }
  };

  const exportToDocx = async (resumeData: ResumeFormData) => {
    console.log("Exporting data:", resumeData);

    // --- Helper function to create styled paragraphs ---
    const createSectionHeading = (text: string) => {
      return new Paragraph({
        children: [new TextRun({ text: text, bold: true, allCaps: true })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 }, // Add some spacing
        border: {
          bottom: {
            color: "auto",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        }, // Use style instead of value
      });
    };

    const createParagraph = (
      text: string | (TextRun | string)[],
      options = {}
    ) => {
      const children = Array.isArray(text)
        ? text.map((t) => (typeof t === "string" ? new TextRun(t) : t))
        : [new TextRun(text)];
      return new Paragraph({ children, spacing: { after: 120 }, ...options });
    };

    const createBullet = (text: string) => {
      return new Paragraph({
        text: text,
        bullet: { level: 0 },
        spacing: { after: 60 },
      });
    };

    // --- Build Document Sections ---
    const sections = [];

    // Contact Section
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: resumeData.contact.email, size: 32, bold: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
      createParagraph(
        [
          new TextRun(
            `${resumeData.contact.city || ""}, ${
              resumeData.contact.country || ""
            }`
          ),
          new TextRun(` | ${resumeData.contact.phone || ""}`),
          new TextRun(` | ${resumeData.contact.email || ""}`),
          ...(resumeData.contact.linkedin
            ? [
                new TextRun(" | "),
                new TextRun({
                  text: resumeData.contact.linkedin,
                  style: "Hyperlink",
                }),
              ]
            : []),
        ],
        { alignment: AlignmentType.CENTER, spacing: { after: 240 } }
      )
    );

    // Objective Section
    if (resumeData.objective) {
      sections.push(createSectionHeading("Objective"));
      sections.push(createParagraph(resumeData.objective));
    }

    // Experience Section
    if (resumeData.experiences?.length) {
      sections.push(createSectionHeading("Work Experience"));
      resumeData.experiences.forEach((exp) => {
        const startDate = exp.startDate
          ? new Date(exp.startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
          : "N/A";
        const endDate = exp.endDate
          ? new Date(exp.endDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
          : "Present";
        sections.push(
          createParagraph([
            new TextRun({ text: exp.title, bold: true }),
            new TextRun({ text: ` | ${exp.company}`, bold: true }),
          ]),
          createParagraph([
            new TextRun(`${exp.location || ""} (${exp.locationType || ""})`),
            new TextRun(`\t${startDate} - ${endDate}`), // Use tab characters for alignment (adjust tabs in Word if needed)
          ])
        );
        if (exp.description) {
          // Simple split by newline for bullets, improve as needed
          exp.description
            .split("\n")
            .filter((line) => line.trim())
            .forEach((line) => {
              sections.push(createBullet(line.trim()));
            });
        }
        sections.push(createParagraph("")); // Add space after entry
      });
    }

    // Education Section
    if (resumeData.educations?.length) {
      sections.push(createSectionHeading("Education"));
      resumeData.educations.forEach((edu) => {
        const startDate = edu.startDate
          ? new Date(edu.startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
          : "N/A";
        const endDate = edu.endDate
          ? new Date(edu.endDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
          : "Present";
        // Simplified GPA string creation
        let gpaString = "";
        if (edu.gpa) {
          gpaString = `GPA: ${edu.gpa}`;
          if (edu.gpaMax) {
            gpaString += `/${edu.gpaMax}`;
          }
        }
        sections.push(
          createParagraph([new TextRun({ text: edu.school, bold: true })]),
          createParagraph([
            new TextRun(`${edu.degree || ""}, ${edu.fieldOfStudy || ""}`),
            new TextRun(edu.location ? `${edu.location}` : ""),
            new TextRun(`\t${startDate} - ${endDate}`), // Use tab characters
          ]),
          ...(gpaString ? [createParagraph(gpaString)] : []),
          ...(edu.description ? [createParagraph(edu.description)] : [])
        );
        sections.push(createParagraph("")); // Add space after entry
      });
    }

    // Skills Section
    if (resumeData.skills?.length) {
      sections.push(createSectionHeading("Skills"));
      // Simple comma-separated list, could be improved with categories or bullets
      // Simplified skill string creation
      const skillsText = resumeData.skills
        .map((skill) => {
          let text = skill.name;
          if (skill.proficiency) text += ` (${skill.proficiency})`;
          return text;
        })
        .join(", ");
      sections.push(createParagraph(skillsText));
    }

    // Certifications Section
    if (resumeData.licenseCertifications?.length) {
      sections.push(createSectionHeading("Licenses & Certifications"));
      resumeData.licenseCertifications.forEach((cert) => {
        const issueDate = cert.issueDate
          ? new Date(cert.issueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
          : "N/A";
        const expiryDate = cert.expiryDate
          ? `Expires: ${new Date(cert.expiryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}`
          : "No Expiry";
        sections.push(
          createParagraph([new TextRun({ text: cert.name, bold: true })]),
          createParagraph([
            new TextRun(`Issued by: ${cert.issuer || ""}`), // Move tabs to TextRun
            new TextRun(`\t|\tIssued: ${issueDate}`),
            new TextRun(`\t|\t${expiryDate}`),
          ]),
          ...(cert.credentialId
            ? [createParagraph(`Credential ID: ${cert.credentialId}`)]
            : [])
        );
        sections.push(createParagraph("")); // Add space after entry
      });
    }

    // Honors & Awards Section
    if (resumeData.honorsAwards?.length) {
      sections.push(createSectionHeading("Honors & Awards"));
      resumeData.honorsAwards.forEach((award) => {
        const awardDate = award.date
          ? new Date(award.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
          : "";
        sections.push(
          createParagraph([new TextRun({ text: award.title, bold: true })]),
          createParagraph([
            new TextRun(`Issued by: ${award.issuer || ""}`),
            new TextRun(awardDate ? `\t${awardDate}` : ""),
          ]),
          ...(award.description ? [createParagraph(award.description)] : [])
        );
        sections.push(createParagraph("")); // Add space after entry
      });
    }

    // --- Create Document ---
    const doc = new Document({
      sections: [
        {
          properties: {
            // Standard 1-inch margins
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440, // 1440 twips = 1 inch
              },
            },
          }, // Add page margins, etc. here if needed
          children: sections,
        },
      ],
      styles: {
        // Optional: Define default styles
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 22, // 11pt font size
              font: "Times New Roman",
            },
            paragraph: {
              spacing: { line: 276, after: 120 }, // Single spacing, 6pt after
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 24, // 13pt
              bold: true,
              allCaps: true,
              font: "Times New Roman",
            },
            paragraph: {
              spacing: { before: 240, after: 60 }, // Space before, less after
              // Define tab stops: one right-aligned near the right margin
            },
          },
        ],
      },
    });

    // --- Generate and Download ---
    try {
      const blob = await Packer.toBlob(doc);
      const filename = `Resume - ${
        resumeData.contact.email || "User"
      } - ${new Date().toLocaleDateString()}.docx`;
      saveAs(blob, filename);
      console.log("Document generated and download initiated.");
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("Failed to generate Word document.");
    }
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges.current &&
      currentLocation.pathname !== nextLocation.pathname
  );

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
          onSubmit={form.handleSubmit(onSubmit)}
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
                onClick={() => exportToDocx(form.getValues())} // Use current form values
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
