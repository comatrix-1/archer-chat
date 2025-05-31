import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

interface GenerateResumeParams {
  title: string;
  jobDescription: string;
  resume: any;
}

export async function generateResumeWithGemini({
  title,
  jobDescription,
  resume,
}: GenerateResumeParams): Promise<{ resume: any; coverLetter: string }> {
  console.log("generateResumeWithGemini()");
  const MAX_RETRIES = 2;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables");
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRIES) {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fullPrismaSchemaText = readFileSync(
      path.resolve(__dirname, "../../prisma/schema.prisma"),
      "utf-8",
    );

    const dependentModelNames = [
      "Experience",
      "Education",
      "Skill",
      "HonorsAwards",
      "LicenseCertification",
      "Project",
    ];
    const relevantEnumNames = [
      "EmploymentType",
      "LocationType",
      "SkillCategory",
      "SkillProficiency",
    ];

    const schemaParts: string[] = [];

    const minimalResumeModelString = `
model Resume {
  objective             String?
  experiences           Experience[]
  educations            Education[]
  skills                Skill[]
  honorsAwards          HonorsAwards[]
  licenseCertifications LicenseCertification[]
  projects              Project[]
}`;
    schemaParts.push(minimalResumeModelString.trim());

    function extractDefinition(
      name: string,
      type: "model" | "enum",
      sourceText: string,
    ): string | null {
      const regex = new RegExp(
        `(^|\\n)${type} ${name}\\s*\\{[\\s\\S]*?\\n\\}`,
        "gm",
      );
      const matches = sourceText.match(regex);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
      console.warn(
        `Schema definition for ${type} ${name} not found in prisma.schema.`,
      );
      return null;
    }

    dependentModelNames.forEach((name) => {
      const definition = extractDefinition(name, "model", fullPrismaSchemaText);
      if (definition) schemaParts.push(definition);
    });

    relevantEnumNames.forEach((name) => {
      const definition = extractDefinition(name, "enum", fullPrismaSchemaText);
      if (definition) schemaParts.push(definition);
    });

    const filteredPrismaSchema = schemaParts.join("\n\n");

    const prompt = `
    You are a professional resume generator. Given the following information (job title, job description, master resume), tailor the following master resume for the job into a resume of approximately 1-2 pages, in JSON format.
    You may re-word and re-phrase the content to make it more suitable for the job title and description.
    The output JSON structure should closely match the structure of the provided prisma schema example below. There are only <schema><job-title><job-description><master-resume> brackets containing the information you need, ignore all other angled brackets. Some description fields such as experience description have HTML markup, please return the same HTML markup format, while making changes to content as necessary.
    Please ensure the resume is professional, highlights relevant skills and experiences, and is suitable for the specified job title.
    Please ensure the output is a single, valid JSON object with no syntax errors. Pay close attention to commas required between elements in arrays and properties in objects.

    <schema>
${filteredPrismaSchema}
</schema>\n
    <job-title>${title}</job-title>\n-
    <job-description>${jobDescription}</job-description>\n-
    <master-resume>${JSON.stringify(resume, null, 2)}</master-resume>/n

    Please approach this step-by-step:
    1. Find key words and phrases from the job title and description.
    2. Pick the most relevant pieces of content from the master resume, there is no need to include all items.
    3. Tailor the content to make it more suitable for the job title and description, ensuring keywords are included.
    4. Return the content in JSON format.

    Here are some guidelines for the resume:
    * The resume should be professional and highlight relevant skills and experiences.
    * Each experience item should have between 3-6 bullet points.
    * The resume should be between 1-2 pages long.
    * Make the output as human as possible and Applicant Tracking System (ATS) friendly.
    * Customize the resume to the job post .
    * Use the keywords mentioned in the job post. 
    * Do NOT change the company names, job titles, or the dates of employment. These details are factual and must remain 100% accurate for legal reasons, but modify everything else in the resume to match the job post's requested skills and qualifications. 
    `;

    let text = "";
    try {
      console.log(`Calling Gemini API (Attempt ${attempt + 1}/${MAX_RETRIES})`);
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      text = response.text || "";

      let jsonString = text.trim();
      const codeBlockMatch = jsonString.match(
        /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
      );
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }

      const resumeJson = JSON.parse(jsonString);

      console.log(
        "generateResumeWithGemini() resume parsed successfully: ",
        resumeJson,
      );

      return {
        resume: resumeJson,
        coverLetter: "",
      };
    } catch (e: any) {
      console.error(`Attempt ${attempt + 1} failed:`, e.message);
      lastError = new Error(
        `Failed to parse AI response as JSON: ${e.message}\nRaw response: ${text}`,
      );
      attempt++;
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying... (${attempt}/${MAX_RETRIES})`);
      }
    }
  }

  console.error(`All ${MAX_RETRIES} attempts failed.`);
  throw (
    lastError || new Error("Failed to generate resume after multiple attempts.")
  );
}
