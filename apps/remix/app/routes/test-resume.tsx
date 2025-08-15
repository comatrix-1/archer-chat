import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useResumes, useCreateResume, useDeleteResume } from '~/hooks/useResume';
import { getUserId } from '~/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json({ userId });
}

export default function TestResumePage() {
  const { userId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  
  // Use our custom hooks
  const { data: resumesData, isLoading, error } = useResumes(userId);
  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  
  const handleCreate = async () => {
    try {
      await createResume.mutateAsync({
        title: `New Resume ${new Date().toLocaleTimeString()}`,
        userId,
        summary: 'Test resume created from the test page',
      });
    } catch (err) {
      console.error('Failed to create resume:', err);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume.mutateAsync({ id, userId });
      } catch (err) {
        console.error('Failed to delete resume:', err);
      }
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Resume Endpoints</h1>
      
      <div className="mb-6">
        <button
          onClick={handleCreate}
          disabled={createResume.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {createResume.isPending ? 'Creating...' : 'Create Test Resume'}
        </button>
      </div>
      
      {isLoading && <p>Loading resumes...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      
      <div className="space-y-4">
        {resumesData?.items.map((resume) => (
          <div key={resume.id} className="p-4 border rounded">
            <h2 className="text-xl font-semibold">{resume.title}</h2>
            {resume.summary && <p className="text-gray-600">{resume.summary}</p>}
            <div className="mt-2 space-x-2">
              <button
                onClick={() => navigate(`/resumes/${resume.id}`)}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                View
              </button>
              <button
                onClick={() => handleDelete(resume.id)}
                disabled={deleteResume.isPending}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
              >
                {deleteResume.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {resumesData?.items.length === 0 && (
        <p>No resumes found. Create one using the button above.</p>
      )}
    </div>
  );
}
