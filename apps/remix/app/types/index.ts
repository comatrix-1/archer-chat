export type TUser = {
    id: string;
    email?: string;
    name?: string;
    photoURL?: string;
};

export type Job = {
    id: string;
    companyName: string;
    jobTitle: string;
    status: {
        id: string;
        name: string;
        color: string;
    };
    jobLink: string;
    resume: string | null;
    coverLetter: string | null;
    salary: string;
    remarks: string;
};

export type StatusCounts = {
  open?: number;
  applied?: number;
  screening?: number;
  interview?: number;
  offer?: number;
  closed?: number;
  accepted?: number;
  [key: string]: number | undefined;
};

export type DashboardStats = {
  total: number;
  active: number;
  statusCounts: StatusCounts;
  interviewRate: number;
  offerRate: number;
};

export type JobApplication = {
    id: string;
    companyName: string;
    jobTitle: string;
    status: Status;
    jobLink: string;
    resume: string | null;
    resumeId?: string | null;
    coverLetter: string | null;
    salary: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
  };

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type JobApplicationsContextType = {
  jobs: JobApplication[];
  addJob: (job: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<JobApplication>) => void;
  deleteJob: (id: string) => void;
  getJobById: (id: string) => JobApplication | undefined;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: "sending" | "sent" | "error";
};

export type Chat = {
  id: string;
  name: string;
  members: string[];
  recruitmentStatus: string;
  messages: Message[];
  scheduledEvents: { id: string; title: string; date: string }[];
};