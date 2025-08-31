import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { createPageUrl } from '~/utils/create-page-url';
import { BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobApplication } from '~/hooks/useJobApplications';
import { useAuth } from '~/contexts/AuthContext';
import type { ZJobApplicationWithRelations } from '@project/trpc/server/job-application-router/schema';
import { useMasterResume } from '~/hooks/useResume';
import { useGenerateResume } from '~/hooks/useAI';

type Status = 'idle' | 'fetching_job_app' | 'fetching_master_resume' | 'invoking_ai' | 'creating_resume' | 'done' | 'error';

type AIPromptResponse = {
    summary: string;
    experiences: Array<{
        title: string;
        employmentType: string;
        company: string;
        location: string;
        locationType: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    skills: Array<{
        name: string;
        proficiency: string;
        category: string;
    }>;
    projects: Array<{
        name: string;
        description: string;
        technologies: string[];
    }>;
};

interface StatusItemProps {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    isDone: boolean;
    isActive: boolean;
}

const StatusItem = ({ icon: Icon, text, isDone, isActive }: StatusItemProps) => (
    <motion.div
        className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${isActive ? 'bg-amber-100' : 'bg-slate-50'
            } ${isDone ? 'opacity-50' : 'opacity-100'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-green-500' : isActive ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                }`}
        >
            {isDone ? <CheckCircle className="w-6 h-6 text-white" /> : <Icon className="w-6 h-6 text-white" />}
        </div>
        <p className={`text-lg font-semibold ${isDone ? 'text-slate-500' : 'text-slate-800'}`}>
            {text}
        </p>
    </motion.div>
);

export default function AICustomizeResume() {
    console.log('AICustomizeResume()')
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<string>('idle');
    const [error, setError] = useState<string | null>(null);

    const jobApplicationId = searchParams.get('jobApplicationId') || '';
    const { user } = useAuth();
    const { data: jobApp, isLoading } = useJobApplication(jobApplicationId, user?.id || '');

    useEffect(() => {
        if (!jobApplicationId) {
            setError('No job application was selected.');
            setStatus('error');
            return;
        }

        if (jobApplicationId && user) {
            startProcess(jobApplicationId);
        }
    }, [jobApplicationId, user]);

    const { data: masterResume } = useMasterResume();
    const { mutateAsync } = useGenerateResume();

    const startProcess = async (jobApplicationId: string) => {
        if (!user) {
            setError('User not found');
            setStatus('error');
            return;
        }

        try {
            // 1. Fetch Master Resume
            setStatus('fetching_master_resume');

            setTimeout(() => {
                setStatus('invoking_ai');
            }, 1000);

            const aiResult = await mutateAsync({ jobApplicationId });

            // TODO: Implement your InvokeLLM function or use your preferred LLM service
            //   const aiResult = await InvokeLLM<AIPromptResponse>({
            //     prompt,
            //     response_json_schema: schema,
            //   });

            //   if (!aiResult?.summary) {
            //     throw new Error("The AI failed to generate a valid resume. Please try again.");
            //   }

            // 3. Create new resume
            setStatus('creating_resume');
            console.log('aiResult', aiResult);
            // TODO: Implement saveCustomizedResume using your API/trpc
            // const newResume = await saveCustomizedResume(user.id, masterResume.id, jobApplication.id, aiResult);

            // 4. Done - Navigate
            if (aiResult.status === 'success') {
                setStatus('done');
            }
            setTimeout(() => {
                navigate(createPageUrl('resume'));
            }, 1000);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
            setStatus('error');
        }
    };

    const createPrompt = (resume: any, jobApp: ZJobApplicationWithRelations) => {
        const jobDescription = `Job Title: ${jobApp.jobTitle} at ${jobApp.companyName}. Job Description: ${jobApp.remarks || 'No description provided'}`;

        // Create a clean copy without unnecessary fields
        const { id, userId, isMaster, contactId, ...cleanResume } = resume;

        return `You are an expert resume writer. Your task is to customize a master resume for a specific job description.
    Analyze the master resume content and the job description provided.
    Rewrite the resume's summary and the descriptions of experiences and projects to highlight the most relevant qualifications and achievements for this specific job.
    Ensure keywords from the job description are naturally integrated.
    The output must be a JSON object matching the provided schema. Do not include any other text.

    MASTER RESUME CONTENT:
    ${JSON.stringify(cleanResume, null, 2)}

    JOB DESCRIPTION:
    ${jobDescription}`;
    };

    const createResponseSchema = () => ({
        type: "object",
        properties: {
            summary: { type: "string", description: "A professional summary customized for the job." },
            experiences: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        employmentType: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        locationType: { type: "string" },
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                        description: { type: "string", description: "Customized bullet points for this experience." }
                    },
                    required: ["title", "company", "startDate", "description"]
                }
            },
            skills: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        proficiency: { type: "string" },
                        category: { type: "string" }
                    },
                    required: ["name", "proficiency", "category"]
                }
            },
            projects: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string", description: "Customized description for this project." },
                        technologies: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "description"]
                }
            }
        },
        required: ["summary", "experiences", "skills", "projects"]
    });

    const steps = [
        { id: 'fetching_job_app', text: 'Analyzing Job Application...', icon: AlertTriangle },
        { id: 'fetching_master_resume', text: 'Loading Your Master Resume...', icon: AlertTriangle },
        { id: 'invoking_ai', text: 'AI is crafting your new resume...', icon: BrainCircuit },
        { id: 'creating_resume', text: 'Saving your customized resume...', icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex(step => step.id === status);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
            </div>
        );
    }

    if (status === 'error' || error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-slate-800">Error</h2>
                            <p className="text-slate-600">{error || 'An unknown error occurred'}</p>
                            <Button onClick={() => window.history.back()} className="mt-4">
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
            >
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Customization</h1>
                            <p className="text-slate-600 text-lg">
                                Please wait while we tailor your resume for{' '}
                                <span className="font-semibold text-amber-600">{jobApp?.jobTitle || 'the position'}</span>.
                            </p>
                        </div>

                        <AnimatePresence>
                            {status !== 'error' && status !== 'done' && (
                                <motion.div
                                    key="status-list"
                                    className="space-y-4"
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {steps.map((step, index) => (
                                        <StatusItem
                                            key={step.id}
                                            icon={step.icon}
                                            text={step.text}
                                            isDone={currentIndex > index}
                                            isActive={currentIndex === index}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {status === 'done' && (
                                <motion.div
                                    key="done"
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
                                    <p className="text-slate-600 mt-2">Redirecting you to your new resume...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {status === 'error' && (
                                <motion.div
                                    key="error"
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
                                    <p className="text-slate-600 mt-2 bg-red-50 p-3 rounded-lg">{error}</p>
                                    <Button onClick={() => window.history.back()} className="mt-6">
                                        Go Back
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}