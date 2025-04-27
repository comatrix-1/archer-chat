import { GoogleGenAI } from "@google/genai";

interface GenerateResumeParams {
  title: string;
  jobDescription: string;
  profile: any;
}

export async function generateResumeWithGemini({ title, jobDescription, profile }: GenerateResumeParams): Promise<{ resume: string; coverLetter: string }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const prompt = `You are a professional resume and cover letter generator. Given the following information, generate a tailored resume and cover letter for the user.\n\nJob Title: ${title}\nJob Description: ${jobDescription}\nUser Profile: ${JSON.stringify(profile, null, 2)}\n\nFirst, generate a resume. Then, generate a cover letter. Clearly separate the two sections.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const text = response.text || '';

  // Try to split resume and cover letter
  const [resume, coverLetter] = text.split(/cover letter[:\n]/i).map((s: string) => s.trim());
  return {
    resume: resume || text,
    coverLetter: coverLetter || '',
  };
}
