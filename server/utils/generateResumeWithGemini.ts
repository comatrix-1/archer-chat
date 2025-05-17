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

    // Refined prompt to request a JSON resume matching the Prisma Profile schema
    const prompt = `
    You are a professional resume generator. Given the following information (job title, job description, master resume), tailor the following master resume for the job into a resume of approximately 1-2 pages, in JSON format.
    The output JSON structure should closely match the structure of the provided 'Master Resume' example below.
  
    Job Title: ${title}\n-
    Job Description: ${jobDescription}\n-
    Master Resume: ${JSON.stringify(resume, null, 2)}
    
    Please ensure the resume is professional, highlights relevant skills and experiences, and is suitable for the specified job title.
    Please ensure the output is a single, valid JSON object with no syntax errors. Pay close attention to commas required between elements in arrays and properties in objects.`;

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
