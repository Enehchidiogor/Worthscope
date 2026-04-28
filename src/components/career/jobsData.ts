// WorthScope — Career Opportunities job data
export type Job = {
  id: string;
  title: string;
  company: string;
  initial: string;
  match: number;
  tags: string[];
  why: string;
  readiness: number;
  suggestion?: string;
  posted: string;
  filters: string[]; // for chip filtering
};

export const JOBS: Job[] = [
  {
    id: "j1",
    title: "Product Designer",
    company: "Flutterwave",
    initial: "F",
    match: 92,
    tags: ["📍 Lagos, Nigeria", "💼 Full-time", "🎓 Entry Level", "💰 ₦200k–₦350k/month"],
    why: "Matches your UI Design, Problem Solving, and Technical Tools skills",
    readiness: 88,
    suggestion: "Submit one more portfolio project to improve your chances",
    posted: "1 day ago",
    filters: ["all", "nigeria", "entry"],
  },
  {
    id: "j2",
    title: "UI/UX Design Intern",
    company: "Paystack",
    initial: "P",
    match: 85,
    tags: ["📍 Lagos, Nigeria", "📋 Internship", "💰 ₦80k–₦120k/month"],
    why: "Matches your UI Design and Communication skills",
    readiness: 80,
    suggestion: "Improve your portfolio to increase your chances",
    posted: "3 days ago",
    filters: ["all", "nigeria", "intern"],
  },
  {
    id: "j3",
    title: "Junior Product Manager",
    company: "Cowrywise",
    initial: "C",
    match: 78,
    tags: ["🌍 Remote", "💼 Full-time", "🎓 Entry Level", "💰 ₦180k–₦280k/month"],
    why: "Matches your Problem Solving and Research skills",
    readiness: 75,
    suggestion: "Complete the Research skill missions to strengthen this match",
    posted: "5 days ago",
    filters: ["all", "remote", "entry"],
  },
  {
    id: "j4",
    title: "Frontend Developer Intern",
    company: "Kuda Bank",
    initial: "K",
    match: 71,
    tags: ["📍 Lagos, Nigeria", "📋 Internship", "💰 ₦60k–₦100k/month"],
    why: "Matches your Technical Tools and Problem Solving skills",
    readiness: 70,
    suggestion: "Level up your Technical Tools skill to 70%+ to be more competitive",
    posted: "1 week ago",
    filters: ["all", "nigeria", "intern"],
  },
];
