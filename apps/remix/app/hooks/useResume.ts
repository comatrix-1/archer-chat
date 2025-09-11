import { trpc } from "@project/trpc/client";
import type { ZCreateResumeInput } from "@project/trpc/server/resume-router/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useResumes(userId: string) {
	return useQuery({
		queryKey: ["resumes", userId],
		queryFn: () => trpc.resume.list.query({ userId }),
		enabled: !!userId,
	});
}

export function useResume(id: string) {
	return useQuery({
		queryKey: ["resume", id],
		queryFn: () => trpc.resume.getById.query({ id }),
		enabled: !!id,
	});
}

export function useMasterResume() {
	return useQuery({
		queryKey: ["master-resume"],
		queryFn: () => trpc.resume.getMasterResume.query(),
		enabled: true,
	});
}

export function useCreateResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ZCreateResumeInput) => trpc.resume.create.mutate(data),
		onSuccess: (_, variables) => {
			// Invalidate the resumes query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["resumes", variables.userId],
			});
		},
	});
}

export function useUpdateResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			id: string;
			title?: string;
			summary?: string | null;
		}) => trpc.resume.update.mutate(data),
		onSuccess: (data) => {
			// Invalidate both the specific resume and the list
			queryClient.invalidateQueries({ queryKey: ["resume", data.id] });
			queryClient.invalidateQueries({ queryKey: ["resumes"] });
		},
	});
}

export function useDeleteResume() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { id: string }) => trpc.resume.delete.mutate(data),
		onSuccess: (_, variables) => {
			// Invalidate the resumes query to refetch the list
			queryClient.invalidateQueries({ queryKey: ["resumes"] });
		},
	});
}
