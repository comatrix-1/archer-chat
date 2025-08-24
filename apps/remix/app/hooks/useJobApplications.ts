import { trpc } from "@project/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	JobApplicationStatus,
	ZCreateJobApplicationInput,
	ZUpdateJobApplicationInput,
} from "@project/trpc/server/job-application-router/schema";
import type {
	ZJobApplicationWithRelations,
	ZJobApplicationListResponse,
} from "@project/trpc/server/job-application-router/schema";

type JobApplicationListOptions = {
	status?: JobApplicationStatus;
	limit?: number;
	cursor?: string | null;
};

type QueryKey = [
	string,
	{
		status?: JobApplicationStatus;
		limit: number;
		cursor?: string | null;
	},
];

export function useJobApplications(options: JobApplicationListOptions = {}) {
	const { status, limit = 20, cursor = null } = options;

	return useQuery<ZJobApplicationListResponse, Error>({
		queryKey: ["jobApplications", { status, limit, cursor }],
		queryFn: async ({ queryKey }) => {
			const [, params] = queryKey as QueryKey;
			const result = await trpc.jobApplication.list.query({
				status: params.status,
				limit: params.limit,
				cursor: params.cursor || undefined,
			});

			// Map the TRPC response to our application types
			return {
				items: result.items.map((item) => ({
					...item,
					// Ensure all required fields have proper defaults if undefined
					id: item.id ?? "",
					companyName: item.companyName,
					jobTitle: item.jobTitle,
					status: item.status,
					jobLink: item.jobLink ?? null,
					resumeId: item.resumeId ?? null,
					coverLetterId: item.coverLetterId ?? null,
					salary: item.salary ?? null,
					remarks: item.remarks ?? null,
					createdAt: item.createdAt ?? new Date(),
					updatedAt: item.updatedAt ?? new Date(),
				})),
				nextCursor: result.nextCursor,
			};
		},
	});
}

export function useJobApplication(id: string, userId: string) {
	return useQuery<ZJobApplicationWithRelations | null>({
		queryKey: ["jobApplication", id],
		queryFn: () => trpc.jobApplication.getById.query({ id }),
		enabled: !!id && !!userId,
	});
}

export function useCreateJobApplication() {
	const queryClient = useQueryClient();

	return useMutation<
		ZJobApplicationWithRelations,
		Error,
		ZCreateJobApplicationInput
	>({
		mutationFn: (data: ZCreateJobApplicationInput) =>
			trpc.jobApplication.create.mutate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
		},
	});
}

export function useUpdateJobApplication() {
	const queryClient = useQueryClient();

	return useMutation<
		ZJobApplicationWithRelations,
		Error,
		ZUpdateJobApplicationInput
	>({
		mutationFn: (data: ZUpdateJobApplicationInput) => {
			return trpc.jobApplication.update.mutate(data);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
			queryClient.invalidateQueries({
				queryKey: ["jobApplication", variables.id],
			});
		},
	});
}

export function useDeleteJobApplication() {
	const queryClient = useQueryClient();

	return useMutation<{ success: boolean }, Error, string>({
		mutationFn: (id: string) => trpc.jobApplication.delete.mutate({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
		},
	});
}
