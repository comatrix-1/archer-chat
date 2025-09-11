import type { Schema } from "@google/genai";
import { GoogleGenAI, Type } from "@google/genai";

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
    const genAI = new GoogleGenAI({ apiKey });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: "A professional summary customized for the job.",
        },
        experiences: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              employmentType: {
                type: Type.STRING,
                enum: [
                  "FULL_TIME",
                  "PART_TIME",
                  "CONTRACT",
                  "INTERNSHIP",
                  "FREELANCE",
                  "SELF_EMPLOYED",
                ],
              },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              locationType: {
                type: Type.STRING,
                enum: ["ON_SITE", "REMOTE", "HYBRID"],
              },
              startDate: {
                type: Type.STRING,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              endDate: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              description: {
                type: Type.STRING,
                description:
                  "Customized bullet points for this experience, in HTML format.",
              },
            },
            required: [
              "title",
              "employmentType",
              "company",
              "location",
              "locationType",
              "startDate",
              "description",
            ],
          },
        },
        educations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              school: { type: Type.STRING },
              degree: { type: Type.STRING },
              fieldOfStudy: { type: Type.STRING },
              startDate: {
                type: Type.STRING,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              endDate: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              gpa: { type: Type.NUMBER, nullable: true },
              description: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Customized description for this education, in HTML format.",
              },
            },
            required: ["school", "degree", "fieldOfStudy", "startDate"],
          },
        },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
            },
            required: ["name"],
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startDate: {
                type: Type.STRING,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              endDate: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              description: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Customized description for this project, in HTML format.",
              },
            },
            required: ["title", "startDate"],
          },
        },
        awards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              issuer: { type: Type.STRING },
              date: {
                type: Type.STRING,
                nullable: true,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
              description: { type: Type.STRING, nullable: true },
            },
            required: ["title", "issuer"],
          },
        },
        certifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              issuer: { type: Type.STRING },
              issueDate: {
                type: Type.STRING,
                description:
                  "Date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              },
            },
            required: ["name", "issuer", "issueDate"],
          },
        },
      },
      required: [
        "summary",
        "experiences",
        "educations",
        "skills",
        "projects",
        "awards",
        "certifications",
      ],
    };

    const prompt = `
    You are a professional resume generator. Given the following information (job title, job description, master resume), tailor the following master resume for the job into a resume of approximately 1-2 pages, in JSON format.
    You may re-word and re-phrase the content to make it more suitable for the job title and description.
    The output must be a valid JSON object that conforms to the provided schema. Some description fields such as experience description have HTML markup, please return the same HTML markup format, while making changes to content as necessary.
    Please ensure the resume is professional, highlights relevant skills and experiences, and is suitable for the specified job title.

    Job Title: ${title}
    Job Description: ${jobDescription}
    Master Resume: ${JSON.stringify(resume, null, 2)}

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

    try {
      console.log(`Calling Gemini API (Attempt ${attempt + 1}/${MAX_RETRIES})`);
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });
      const rawResponseText = result.text;

      if (!rawResponseText)
        throw new Error(
          "generateResumeWithGemini() nothing returned from GenAI"
        );

      // The response text is already a JSON string because of responseMimeType.
      const resumeJson = JSON.parse(rawResponseText);

      console.log(
        "generateResumeWithGemini() resume parsed successfully: ",
        resumeJson
      );

      return {
        resume: resumeJson,
        coverLetter: "",
      };
    } catch (e: any) {
      console.error(`Attempt ${attempt + 1} failed:`, e.message);
      lastError = new Error(
        `Failed to parse AI response as JSON: ${e.message}`
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
