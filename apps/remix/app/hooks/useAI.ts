import { trpc } from '@project/trpc/client';
import { useMutation } from '@tanstack/react-query';
import type { GenerateResumeInput, GenerateCoverLetterInput } from '@project/trpc/server/ai-router/schema';

export function useGenerateResume() {
  return useMutation({
    mutationFn: (input: { jobDescription: string; customInstructions?: string }) => {
      return trpc.ai.generateResume.mutate({
        jobDescription: input.jobDescription,
        customInstructions: input.customInstructions,
      });
    },
  });
}

// TODO: implement
// export function useGenerateCoverLetter() {
//   return useMutation({
//     mutationFn: (input: Omit<GenerateCoverLetterInput, 'resume'>) => {
//       return trpc.ai.generateCoverLetter.mutate({
//         resumeId: input.resumeId,
//         jobDescription: input.jobDescription,
//         companyName: input.companyName,
//         jobTitle: input.jobTitle,
//         customInstructions: input.customInstructions,
//       });
//     },
//   });
// }
