import type {
  Contact,
  Education,
  Experience as PrismaExperience, // Alias to avoid conflict with local types if any
  HonorsAwards,
  LicenseCertification,
  Project,
  Skill as PrismaSkill, // Alias
  // Import the enum types themselves
  EmploymentType,
  LocationType,
  SkillCategory,
  SkillProficiency,
} from "@prisma/client";
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
} from "docx";
import pkg from "file-saver";
const { saveAs } = pkg;

// Define the ResumeFormData type here or import it if defined elsewhere
type ResumeFormData = {
  objective: string;
  contact: Contact;
  experiences: (Omit<
    PrismaExperience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType | string;
    locationType: LocationType | string;
  })[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: (Omit<
    PrismaSkill,
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
  projects: Omit<Project, "resumeId" | "createdAt" | "updatedAt">[]; // Assuming Project might have these too
};

// --- Helper function to create styled paragraphs ---
const createSectionHeading = (text: string) => {
  return new Paragraph({
    children: [new TextRun({ text: text, bold: true, allCaps: true })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 0 }, // Add some spacing
    border: {
      bottom: {
        color: "auto",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
};

const createParagraph = (text: string | (TextRun | string)[], options = {}) => {
  const children = Array.isArray(text)
    ? text.map((t) => (typeof t === "string" ? new TextRun(t) : t))
    : [new TextRun(text)];
  // Remove default 'after' spacing, apply only if passed in options
  return new Paragraph({ children, ...options });
};

const createBullet = (text: string) => {
  return new Paragraph({
    text: text,
    bullet: { level: 0 },
    spacing: { after: 0 },
  });
};

const NAME_FONT_SIZE = 32; // 16pt
const TAB_STOP_POSITION = 11520;
const FIRST_PARAGRAPH_BEFORE_SPACING = 12; // 12 twips = 0.008 inches
const AFTER_SPACING = 0;
const MARGIN = 720; // 720 twips = 0.5 inches

export const exportResumeToDocx = async (resumeData: ResumeFormData) => {
  console.log("Exporting data:", resumeData);

  // --- Build Document Sections ---
  const sections = [];

  // Contact Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resumeData.contact.name ?? "Your Name",
          size: NAME_FONT_SIZE,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
    }),
    (() => {
      // Build contact details conditionally
      const contactDetails: (TextRun | string)[] = [];
      const city = resumeData.contact.city ?? "";
      const country = resumeData.contact.country ?? "";
      const location =
        city && country ? `${city}, ${country}` : city || country;

      if (location.trim() !== ",") {
        contactDetails.push(new TextRun(location));
      }

      if (resumeData.contact.phone) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" • "));
        contactDetails.push(new TextRun(resumeData.contact.phone));
      }

      if (resumeData.contact.email) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" • "));
        contactDetails.push(new TextRun(resumeData.contact.email));
      }

      if (resumeData.contact.portfolio) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" • "));
        contactDetails.push(
          new TextRun({
            text: resumeData.contact.portfolio,
            style: "Hyperlink",
          })
        );
      }

      if (resumeData.contact.linkedin) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" • "));
        contactDetails.push(
          new TextRun({ text: resumeData.contact.linkedin, style: "Hyperlink" })
        );
      }

      return createParagraph(contactDetails, {
        alignment: AlignmentType.CENTER,
        spacing: { after: AFTER_SPACING },
      });
    })()
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
        createParagraph(
          [
            new TextRun({ text: exp.title, bold: true }),
            new TextRun(`\t${exp.location || ""} (${exp.locationType || ""})`),
          ],
          {
            spacing: {
              before: FIRST_PARAGRAPH_BEFORE_SPACING,
              after: AFTER_SPACING,
            },
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TAB_STOP_POSITION,
              },
            ],
          }
        ),
        createParagraph(
          [
            new TextRun({ text: `${exp.company}`, bold: true }),
            new TextRun(`\t${startDate} - ${endDate}`),
          ],
          {
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TAB_STOP_POSITION,
              },
            ],
          }
        )
      );
      if (exp.description) {
        // Parse HTML description for DOCX
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(exp.description, "text/html");

          // Iterate through direct children of the body (usually paragraphs or lists)
          doc.body.childNodes.forEach((node) => {
            if (node.nodeName === "P") {
              const text = node.textContent || "";
              if (text.trim()) {
                sections.push(createParagraph(text)); // Use createParagraph helper
              }
            } else if (node.nodeName === "UL") {
              // Handle unordered lists
              node.childNodes.forEach((listItem) => {
                if (listItem.nodeName === "LI") {
                  const text = listItem.textContent || "";
                  if (text.trim()) {
                    sections.push(createBullet(text.trim())); // Use createBullet helper
                  }
                }
              });
            }
          });
        } catch (e) {
          console.error("Error parsing experience description HTML:", e);
          sections.push(createParagraph(exp.description));
        }
      }
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
      let gpaString = "";
      if (edu.gpa) {
        gpaString = `GPA: ${edu.gpa}`;
        if (edu.gpaMax) gpaString += `/${edu.gpaMax}`;
      }
      sections.push(
        createParagraph(
          [
            new TextRun({ text: edu.school, bold: true }),
            new TextRun(`\t${edu.location ?? ""}`),
          ],
          {
            spacing: {
              before: FIRST_PARAGRAPH_BEFORE_SPACING,
              after: AFTER_SPACING,
            },
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TAB_STOP_POSITION,
              },
            ],
          }
        ),
        createParagraph(
          [
            new TextRun(
              `${edu.degree || ""}, ${edu.fieldOfStudy || ""}, ${gpaString}`
            ),
            new TextRun(`\t${startDate} - ${endDate}`),
          ],
          {
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TAB_STOP_POSITION,
              },
            ],
          }
        )
      );
      if (edu.description) {
        // Parse HTML description for DOCX
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(edu.description, "text/html");

          // Iterate through direct children of the body (usually paragraphs or lists)
          doc.body.childNodes.forEach((node) => {
            if (node.nodeName === "P") {
              const text = node.textContent || "";
              if (text.trim()) {
                sections.push(createParagraph(text)); // Use createParagraph helper
              }
            } else if (node.nodeName === "UL") {
              // Handle unordered lists
              node.childNodes.forEach((listItem) => {
                if (listItem.nodeName === "LI") {
                  const text = listItem.textContent || "";
                  if (text.trim()) {
                    sections.push(createBullet(text.trim())); // Use createBullet helper
                  }
                }
              });
            }
          });
        } catch (e) {
          console.error("Error parsing education description HTML:", e);
          // Fallback: add raw text if parsing fails
          sections.push(createParagraph(edu.description));
        }
      }
    });
  }

  // Projects Section
  if (resumeData.projects?.length) {
    sections.push(createSectionHeading("Education"));
    resumeData.projects.forEach((project) => {
      const startDate = project.startDate
        ? new Date(project.startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })
        : "N/A";
      const endDate = project.endDate
        ? new Date(project.endDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })
        : "Present";
      sections.push(
        createParagraph(
          [
            new TextRun({ text: project.title, bold: true }),
            new TextRun(`\t${startDate} - ${endDate}`),
          ],
          {
            spacing: {
              before: FIRST_PARAGRAPH_BEFORE_SPACING,
              after: AFTER_SPACING,
            },
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TAB_STOP_POSITION,
              },
            ],
          }
        )
      );
      if (project.description) {
        // Parse HTML description for DOCX
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(project.description, "text/html");

          // Iterate through direct children of the body (usually paragraphs or lists)
          doc.body.childNodes.forEach((node) => {
            if (node.nodeName === "P") {
              const text = node.textContent || "";
              if (text.trim()) {
                sections.push(createParagraph(text)); // Use createParagraph helper
              }
            } else if (node.nodeName === "UL") {
              // Handle unordered lists
              node.childNodes.forEach((listItem) => {
                if (listItem.nodeName === "LI") {
                  const text = listItem.textContent || "";
                  if (text.trim()) {
                    sections.push(createBullet(text.trim())); // Use createBullet helper
                  }
                }
              });
            }
          });
        } catch (e) {
          console.error("Error parsing project description HTML:", e);
          // Fallback: add raw text if parsing fails
          sections.push(createParagraph(project.description));
        }
      }
    });
  }

  // Skills Section
  if (resumeData.skills?.length) {
    sections.push(createSectionHeading("Skills")); // Keep the main heading

    // Group skills by category
    const groupedSkills = resumeData.skills.reduce((acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, typeof resumeData.skills>);

    // Create a paragraph for each category
    Object.entries(groupedSkills).forEach(([category, categorySkills]) => {
      sections.push(
        createParagraph(
          [
            new TextRun({ text: `${category}: `, bold: true }), // Category name bold
            new TextRun(
              categorySkills
                .map(
                  (skill) =>
                    `${skill.name}${
                      skill.proficiency && skill.proficiency !== "N/A"
                        ? ` (${skill.proficiency})`
                        : ""
                    }`
                )
                .join(", ") + "." // Join skills with comma, end with period
            ),
          ],
          { spacing: { after: AFTER_SPACING } }
        ) // Add space after each category line
      );
    });
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
        createParagraph(
          [
            new TextRun({ text: cert.name, bold: true }),
            new TextRun(`${cert.issuer ? ` – ${cert.issuer}` : ""}`),
            new TextRun(
              `\t${issueDate}${expiryDate ? " - " + expiryDate : ""}`
            ),
          ],
          {
            spacing: {
              before: FIRST_PARAGRAPH_BEFORE_SPACING,
              after: AFTER_SPACING,
            },
            tabStops: [
              { type: TabStopType.RIGHT, position: TAB_STOP_POSITION },
            ],
          }
        ),
        ...(cert.credentialId
          ? [createParagraph(`Credential ID: ${cert.credentialId}`)]
          : [])
      );
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
        createParagraph([new TextRun({ text: award.title, bold: true })], {
          spacing: {
            before: FIRST_PARAGRAPH_BEFORE_SPACING,
            after: AFTER_SPACING,
          },
        }), // Award title, reduce space after
        createParagraph([
          new TextRun(`Issued by: ${award.issuer || ""}`),
          new TextRun(awardDate ? `\t${awardDate}` : ""),
        ]),
        ...(award.description ? [createParagraph(award.description)] : [])
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN,
              right: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
            },
          },
        },
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
          run: { size: 22, font: "Times New Roman" }, // 11pt
          paragraph: {
            spacing: { line: 276, after: AFTER_SPACING }, // Set 'after' spacing to 0
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, allCaps: true, font: "Times New Roman" }, // 12pt
          paragraph: {
            spacing: { before: 240, after: AFTER_SPACING },
          },
        },
      ],
    },
  });

  // --- Generate and Download ---
  try {
    const blob = await Packer.toBlob(doc);
    const filename = `Resume - ${
      resumeData.contact.name ?? "User" // Use name from contact
    } - ${new Date().toLocaleDateString()}.docx`;
    saveAs(blob, filename);
    console.log("Document generated and download initiated.");
  } catch (error) {
    console.error("Error generating DOCX:", error);
    alert("Failed to generate Word document.");
  }
};
