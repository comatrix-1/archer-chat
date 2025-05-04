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

export const exportResumeToDocx = async (resumeData: ResumeFormData) => {
  console.log("Exporting data:", resumeData);

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
          new TextRun(`\t${startDate} - ${endDate}`),
        ])
      );
      if (exp.description) {
        exp.description
          .split("\n")
          .filter((line) => line.trim())
          .forEach((line) => {
            sections.push(createBullet(line.trim()));
          });
      }
      sections.push(createParagraph(""));
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
        createParagraph([new TextRun({ text: edu.school, bold: true })]),
        createParagraph([
          new TextRun(`${edu.degree || ""}, ${edu.fieldOfStudy || ""}`),
          new TextRun(edu.location ? `${edu.location}` : ""),
          new TextRun(`\t${startDate} - ${endDate}`),
        ]),
        ...(gpaString ? [createParagraph(gpaString)] : []),
        ...(edu.description ? [createParagraph(edu.description)] : [])
      );
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
        createParagraph([new TextRun({ text: cert.name, bold: true })]),
        createParagraph([
          new TextRun(`Issued by: ${cert.issuer || ""}`),
          new TextRun(`\t|\tIssued: ${issueDate}`),
          new TextRun(`\t|\t${expiryDate}`),
        ]),
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
        createParagraph([new TextRun({ text: award.title, bold: true })]),
        createParagraph([
          new TextRun(`Issued by: ${award.issuer || ""}`),
          new TextRun(awardDate ? `\t${awardDate}` : ""),
        ]),
        ...(award.description ? [createParagraph(award.description)] : [])
      );
      sections.push(createParagraph(""));
    });
  }

  // --- Create Document ---
  // (Document creation logic remains the same as before)
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
        },
        children: sections, // Use the populated sections array
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
          paragraph: { spacing: { line: 276, after: 120 } }, // 1.15 line spacing, 6pt after
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
