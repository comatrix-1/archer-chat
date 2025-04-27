import { GoogleGenAI } from "@google/genai";

interface GenerateResumeParams {
  title: string;
  jobDescription: string;
  profile: any;
}

export async function generateResumeWithGemini({ title, jobDescription, profile }: GenerateResumeParams): Promise<{ resume: any; coverLetter: string }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Refined prompt to request a JSON resume matching the Prisma Profile schema
  const prompt = `You are a professional resume generator. Given the following information, generate a resume in JSON format matching this schema:\n\n{\n  \"objective\": \"string\",\n  \"experiences\": [\n    {\n      \"title\": \"string\",\n      \"employmentType\": \"string\",\n      \"company\": \"string\",\n      \"location\": \"string\",\n      \"locationType\": \"string\",\n      \"startDate\": \"YYYY-MM-DD\",\n      \"endDate\": \"YYYY-MM-DD or null\",\n      \"description\": \"string\"\n    }\n  ],\n  \"educations\": [\n    {\n      \"school\": \"string\",\n      \"degree\": \"string\",\n      \"fieldOfStudy\": \"string\",\n      \"startDate\": \"YYYY-MM-DD\",\n      \"endDate\": \"YYYY-MM-DD or null\",\n      \"gpa\": \"number or null\",\n      \"gpaMax\": \"number or null\",\n      \"location\": \"string\",\n      \"description\": \"string\"\n    }\n  ],\n  \"skills\": [\n    {\n      \"name\": \"string\",\n      \"proficiency\": \"string\"\n    }\n  ],\n  \"honorsAwards\": [\n    {\n      \"title\": \"string\",\n      \"issuer\": \"string\",\n      \"date\": \"YYYY-MM-DD\",\n      \"description\": \"string\"\n    }\n  ],\n  \"licenseCertifications\": [\n    {\n      \"name\": \"string\",\n      \"issuer\": \"string\",\n      \"issueDate\": \"YYYY-MM-DD\",\n      \"expiryDate\": \"YYYY-MM-DD or null\",\n      \"credentialId\": \"string\"\n    }\n  ],\n  \"contact\": {\n    \"phone\": \"string\",\n    \"email\": \"string\",\n    \"linkedin\": \"string\",\n    \"portfolio\": \"string\",\n    \"city\": \"string\",\n    \"country\": \"string\"\n  }\n}\n\nDo not include any text outside the JSON. Use the following user/job info:\n- Job Title: ${title}\n- Job Description: ${jobDescription}\n- User Profile: ${JSON.stringify(profile, null, 2)}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const text = response.text || '';

  // Handle possible Markdown code block wrapping (```json ... ``` or ``` ... ```)
  let jsonString = text.trim();
  const codeBlockMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1].trim();
  }

  // Try to parse the response as JSON
  let resumeJson = null;
  try {
    resumeJson = JSON.parse(jsonString);
  } catch (e: any) {
    throw new Error('Failed to parse AI response as JSON: ' + e.message + '\nRaw response: ' + text);
  }

  return {
    resume: resumeJson,
    coverLetter: '',
  };
}
