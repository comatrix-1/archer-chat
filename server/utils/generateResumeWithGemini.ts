import { GoogleGenAI } from "@google/genai";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

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

    // Fix for __dirname in ES Modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fullPrismaSchemaText = readFileSync(path.resolve(__dirname, '../../prisma/schema.prisma'), 'utf-8');

    // Define the models and enums relevant to the resume content structure
    const dependentModelNames = [
      "Experience", "Education", "Skill",
      "HonorsAwards", "LicenseCertification", "Project"
    ];
    const relevantEnumNames = [
      "EmploymentType", "LocationType", "SkillCategory", "SkillProficiency"
      // Add any other enums directly used by the above models if necessary
    ];

    const schemaParts: string[] = [];

    // 1. Construct the minimal Resume model definition for the prompt
    // This includes only the fields Gemini should generate content for,
    // matching the structure of the `baseResumeTemplate`'s relevant content.
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

    // Helper function to extract full model/enum definition from the schema text
    function extractDefinition(name: string, type: "model" | "enum", sourceText: string): string | null {
      // Regex to find 'model Name { ... }' or 'enum Name { ... }'
      // It looks for 'model/enum Name ', then an opening brace,
      // then any characters (non-greedy) until a closing brace typically on a new line.
      const regex = new RegExp(`(^|\\n)${type} ${name}\\s*\\{[\\s\\S]*?\\n\\}`, "gm");
      const matches = sourceText.match(regex);
      if (matches && matches.length > 0) {
        return matches[0].trim(); // Return the first match, trimmed
      }
      console.warn(`Schema definition for ${type} ${name} not found in prisma.schema.`);
      return null;
    }

    // 2. Extract full definitions for dependent models
    dependentModelNames.forEach(name => {
      const definition = extractDefinition(name, "model", fullPrismaSchemaText);
      if (definition) schemaParts.push(definition);
    });

    // 3. Extract full definitions for enums
    relevantEnumNames.forEach(name => {
      const definition = extractDefinition(name, "enum", fullPrismaSchemaText);
      if (definition) schemaParts.push(definition);
    });

    const filteredPrismaSchema = schemaParts.join("\n\n");

    // Refined prompt to request a JSON resume matching the Prisma Profile schema
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
    
    `;

    let text = "";
    try {
      console.log(`Calling Gemini API (Attempt ${attempt + 1}/${MAX_RETRIES})`);
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      text = response.text || "";

      // Handle possible Markdown code block wrapping (```json ... ``` or ``` ... ```)
      let jsonString = text.trim();
      const codeBlockMatch = jsonString.match(
        /^```(?:json)?\s*([\s\S]*?)\s*```$/i
      );
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }

      // Try to parse the response as JSON
      const resumeJson = JSON.parse(jsonString);

      console.log("generateResumeWithGemini() resume parsed successfully: ", resumeJson);
      // If parsing succeeds, return the result
      return {
        resume: resumeJson,
        coverLetter: "", // Assuming cover letter generation is separate
      };
    } catch (e: any) {
      console.error(`Attempt ${attempt + 1} failed:`, e.message);
      lastError = new Error(`Failed to parse AI response as JSON: ${e.message}\nRaw response: ${text}`);
      attempt++;
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying... (${attempt}/${MAX_RETRIES})`);
        // Optional: Add a small delay before retrying
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // If all retries failed, throw the last recorded error
  console.error(`All ${MAX_RETRIES} attempts failed.`);
  throw lastError || new Error("Failed to generate resume after multiple attempts.");
}
