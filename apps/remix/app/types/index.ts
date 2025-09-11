export type TUser = {
  id: string;
  email?: string;
  name?: string;
  photoURL?: string;
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