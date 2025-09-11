import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { createPageUrl } from '~/utils/create-page-url';
import { BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobApplication } from '~/hooks/useJobApplications';
import { useAuth } from '~/contexts/AuthContext';
import { useGenerateResume } from '~/hooks/useAI';

type Status = 'idle' | 'fetching_master_resume' | 'invoking_ai' | 'creating_resume' | 'done' | 'error';
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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);
    const jobApplicationId = useMemo(() => searchParams.get('jobApplicationId') || '', [searchParams]);
    const { user } = useAuth();
    const { data: jobApp, isLoading } = useJobApplication(jobApplicationId, user?.id || '');
    const { mutateAsync } = useGenerateResume();

    const handleStartGeneration = async () => {
        if (!jobApplicationId) {
            setError('No job application was selected.');
            setStatus('error');
            return;
        }

        if (jobApplicationId && user) {
            setStatus('fetching_master_resume');
            await startProcess(jobApplicationId);
        }
    };

    const startProcess = async (jobApplicationId: string) => {
        if (!user) {
            setError('User not found');
            setStatus('error');
            return;
        }

        try {
            setStatus('fetching_master_resume');
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus('invoking_ai');
            const aiResult = await mutateAsync({ jobApplicationId });
            console.log('aiResult', aiResult);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus('creating_resume');
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (aiResult.status === 'success') {
                setStatus('done');
                setTimeout(() => {
                    navigate(createPageUrl('resume'));
                }, 3000);
            } else {
                throw new Error('Failed to generate resume');
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
            setStatus('error');
        }
    };

    const steps = [
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
                            <p className="text-slate-600 text-lg mb-6">
                                We'll tailor your resume for{' '}
                                <span className="font-semibold text-amber-600">{jobApp?.jobTitle || 'the position'}</span>.
                            </p>
                            {status === 'idle' && (
                                <Button
                                    onClick={handleStartGeneration}
                                    className="bg-amber-600 hover:bg-amber-700 px-8 py-6 text-lg"
                                    size="lg"
                                >
                                    Start Customization
                                </Button>
                            )}
                        </div>

                        <AnimatePresence>
                            {status !== 'idle' && status !== 'error' && status !== 'done' && (
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