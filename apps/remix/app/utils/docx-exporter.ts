import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";
import { format } from "date-fns";
import {
	AlignmentType,
	BorderStyle,
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	TabStopType,
	TextRun,
} from "docx";
import pkg from "file-saver";
import { toast } from "sonner";
import { toSentenceCase } from "./to-sentence-case";
const { saveAs } = pkg;

const NAME_FONT_SIZE = 32;
const TAB_STOP_POSITION = 11520;
const FIRST_PARAGRAPH_BEFORE_SPACING = 12;
const AFTER_SPACING = 0;
const MARGIN = 720;

const createSectionHeading = (text: string) => {
	return new Paragraph({
		children: [new TextRun({ text: text, bold: true, allCaps: true })],
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 240, after: 0 },
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

	return new Paragraph({ children, ...options });
};

const createBullet = (children: (TextRun | string)[]) => {
	return new Paragraph({
		children: children.map(t => (typeof t === "string" ? new TextRun(t) : t)),
		bullet: { level: 0 },
		spacing: { after: 0 },
	});
};

const parseTiptapJson = (jsonContent: any): Paragraph[] => {
	if (!jsonContent || !jsonContent.content) {
		return [];
	}

	const paragraphs: Paragraph[] = [];
	const parseNode = (node: any) => {
		const textRuns: TextRun[] = [];

		if (node.content) {
			for (const childNode of node.content) {
				if (childNode.type === 'text') {
					const runOptions: any = {};
					if (childNode.marks) {
						for (const mark of childNode.marks) {
							if (mark.type === 'bold') {
								runOptions.bold = true;
							}
							if (mark.type === 'italic') {
								runOptions.italic = true;
							}
						}
					}
					textRuns.push(new TextRun({ text: childNode.text, ...runOptions }));
				} else if (childNode.type === 'bulletList') {
					paragraphs.push(...parseTiptapJson(childNode));
				} else if (childNode.type === 'listItem') {

					if (childNode.content && childNode.content[0].type === 'paragraph') {
						const listTextRuns: TextRun[] = [];
						for (const subNode of childNode.content[0].content || []) {
							const subRunOptions: any = {};
							if (subNode.marks) {
								for (const subMark of subNode.marks) {
									if (subMark.type === 'bold') { subRunOptions.bold = true; }
									if (subMark.type === 'italic') { subRunOptions.italic = true; }
								}
							}
							listTextRuns.push(new TextRun({ text: subNode.text, ...subRunOptions }));
						}
						paragraphs.push(createBullet(listTextRuns));
					}
				}
			}
		}

		return textRuns;
	};

	for (const node of jsonContent.content) {
		if (node.type === 'paragraph') {
			const children = parseNode(node);
			if (children.length > 0) {
				paragraphs.push(new Paragraph({ children }));
			}
		} else if (node.type === 'bulletList') {

			parseNode(node);
		} else if (node.type === 'listItem') {

			const children = parseNode(node);
			if (children.length > 0) {
				paragraphs.push(createBullet(children));
			}
		}
	}

	return paragraphs;
};

export const exportResumeToDocx = async (resumeData: ZResumeWithRelations) => {
	console.log("Exporting data:", resumeData);

	const sections = [];

	sections.push(
		new Paragraph({
			children: [
				new TextRun({
					text: resumeData.contact.fullName ?? "Your Name",
					size: NAME_FONT_SIZE,
					bold: true,
				}),
			],
			alignment: AlignmentType.CENTER,
			spacing: { after: 0 },
		}),
		(() => {
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
					}),
				);
			}

			if (resumeData.contact.linkedin) {
				if (contactDetails.length > 0) contactDetails.push(new TextRun(" • "));
				contactDetails.push(
					new TextRun({
						text: resumeData.contact.linkedin,
						style: "Hyperlink",
					}),
				);
			}

			return createParagraph(contactDetails, {
				alignment: AlignmentType.CENTER,
				spacing: { after: AFTER_SPACING },
			});
		})(),
	);

	if (resumeData.summary) {
		sections.push(createSectionHeading("Summary"));
		sections.push(...parseTiptapJson(resumeData.summary));
	}

	if (resumeData.experiences?.length) {
		sections.push(createSectionHeading("Work Experience"));
		for (const exp of resumeData.experiences) {
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
						new TextRun(
							`\t${exp.location || ""} (${toSentenceCase(exp.locationType || "")})`,
						),
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
					},
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
					},
				),
			);
			if (exp.description) {
				sections.push(...parseTiptapJson(exp.description));
			}
		}
	}

	if (resumeData.educations?.length) {
		sections.push(createSectionHeading("Education"));
		for (const edu of resumeData.educations) {
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
					},
				),
				createParagraph(
					[
						new TextRun(
							`${edu.degree || ""}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}${gpaString ? `, ${gpaString}` : ""}`,
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
					},
				),
			);
			if (edu.description) {
				sections.push(...parseTiptapJson(edu.description));
			}
		}
	}

	if (resumeData.projects?.length) {
		sections.push(createSectionHeading("Projects"));
		for (const project of resumeData.projects) {
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
					},
				),
			);
			if (project.description) {
				sections.push(...parseTiptapJson(project.description));
			}
		}
	}

	if (resumeData.skills?.length) {
		sections.push(createSectionHeading("Skills"));

		const allSkills = resumeData.skills.map((skill) => skill.name).join(", ");

		sections.push(
			createParagraph([new TextRun(`${allSkills}.`)], {
				spacing: { after: AFTER_SPACING },
			}),
		);
	}

	if (resumeData.certifications?.length) {
		sections.push(createSectionHeading("Licenses & Certifications"));
		for (const cert of resumeData.certifications) {
			const issueDate = cert.issueDate
				? new Date(cert.issueDate).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
				})
				: "N/A";
			const expiryDate = cert.expiryDate
				? `${new Date(cert.expiryDate).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
				})}`
				: "";
			sections.push(
				createParagraph(
					[
						new TextRun({ text: cert.name, bold: true }),
						new TextRun(`${cert.issuer ? ` – ${cert.issuer}` : ""}`),
						new TextRun(
							`\t${issueDate}${expiryDate ? ` - ${expiryDate}` : ""}`,
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
					},
				),
				...(cert.credentialId
					? [createParagraph(`Credential ID: ${cert.credentialId}`)]
					: []),
			);
		}
	}

	if (resumeData.awards?.length) {
		sections.push(createSectionHeading("Honors & Awards"));
		for (const award of resumeData.awards) {
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
				}),
				createParagraph([
					new TextRun(`Issued by: ${award.issuer || ""}`),
					new TextRun(awardDate ? `\t${awardDate}` : ""),
				]),
			);
			if (award.description) {
				sections.push(...parseTiptapJson(award.description));
			}
		}
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
			paragraphStyles: [
				{
					id: "Normal",
					name: "Normal",
					basedOn: "Normal",
					next: "Normal",
					quickFormat: true,
					run: { size: 22, font: "Times New Roman" },
					paragraph: {
						spacing: { line: 276, after: AFTER_SPACING },
					},
				},
				{
					id: "Heading2",
					name: "Heading 2",
					basedOn: "Normal",
					next: "Normal",
					quickFormat: true,
					run: { size: 24, bold: true, allCaps: true, font: "Times New Roman" },
					paragraph: {
						spacing: { before: 240, after: AFTER_SPACING },
					},
				},
			],
		},
	});

	try {
		const blob = await Packer.toBlob(doc);
		const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
		const filename = `Resume - ${timestamp}.docx`;
		saveAs(blob, filename);
		toast.success("Word document generated successfully.");
	} catch (error) {
		console.error("Error generating DOCX:", error);
		toast.error("Failed to generate Word document.");
	}
};