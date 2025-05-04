import type {
  Contact,
  Education,
  Experience,
  HonorsAwards,
  LicenseCertification,
  Skill,
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
  experiences: Omit<Experience, "resumeId" | "createdAt" | "updatedAt">[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: Omit<Skill, "resumeId" | "createdAt" | "updatedAt">[];
  licenseCertifications: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  honorsAwards: Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt">[];
};

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
    },
  });
};

const createParagraph = (text: string | (TextRun | string)[], options = {}) => {
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

const TAB_STOP_POSITION = 11520;

export const exportResumeToDocx = async (resumeData: ResumeFormData) => {
  console.log("Exporting data:", resumeData);

  // --- Build Document Sections ---
  const sections = [];

  // Contact Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resumeData.contact.name || "Your Name",
          size: 32,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    (() => {
      // Build contact details conditionally
      const contactDetails: (TextRun | string)[] = [];
      const location = `${resumeData.contact.city || ""}, ${
        resumeData.contact.country || ""
      }`;

      if (location.trim() !== ",") {
        contactDetails.push(new TextRun(location));
      }

      if (resumeData.contact.phone) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" | "));
        contactDetails.push(new TextRun(resumeData.contact.phone));
      }

      if (resumeData.contact.email) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" | "));
        contactDetails.push(new TextRun(resumeData.contact.email));
      }

      if (resumeData.contact.linkedin) {
        if (contactDetails.length > 0) contactDetails.push(new TextRun(" | "));
        contactDetails.push(
          new TextRun({ text: resumeData.contact.linkedin, style: "Hyperlink" })
        );
      }

      return createParagraph(contactDetails, {
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
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
            spacing: { after: 0 },
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
        exp.description
          .split("\n")
          .filter((line) => line.trim())
          .forEach((line) => {
            sections.push(createBullet(line.trim()));
          });
      }
      sections.push(createParagraph("")); // Add space after the entire entry
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
            spacing: { after: 0 },
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
        edu.description
          .split("\n")
          .filter((line) => line.trim())
          .forEach((line) => {
            sections.push(createBullet(line.trim()));
          });
      }
      sections.push(createParagraph(""));
    });
  }

  // Skills Section
  if (resumeData.skills?.length) {
    sections.push(createSectionHeading("Skills"));
    const skillsText = resumeData.skills
      .map(
        (skill) =>
          `${skill.name}${skill.proficiency ? ` (${skill.proficiency})` : ""}`
      )
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
        createParagraph([new TextRun({ text: cert.name, bold: true })], {
          spacing: { after: 0 },
        }), // Cert name, reduce space after
        createParagraph(
          [
            new TextRun(`Issued by: ${cert.issuer || ""}`),
            new TextRun(
              `\t${issueDate}${expiryDate ? " - " + expiryDate : ""}`
            ),
          ],
          {
            tabStops: [
              { type: TabStopType.RIGHT, position: TAB_STOP_POSITION },
            ],
          }
        ),
        ...(cert.credentialId
          ? [createParagraph(`Credential ID: ${cert.credentialId}`)]
          : [])
      );
      sections.push(createParagraph(""));
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
          spacing: { after: 0 },
        }), // Award title, reduce space after
        createParagraph([
          new TextRun(`Issued by: ${award.issuer || ""}`),
          new TextRun(awardDate ? `\t${awardDate}` : ""),
        ]),
        ...(award.description ? [createParagraph(award.description)] : [])
      );
      sections.push(createParagraph(""));
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720, // 720 twips = 0.5 inches
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
            spacing: { line: 276, after: 120 }, // 1.15 line spacing, 6pt after
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
            spacing: { before: 240, after: 60 },
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
