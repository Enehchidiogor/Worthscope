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
  category: "creative" | "tech" | "business" | "science" | "people" | "communication";
};

export const JOBS: Job[] = [
  // CREATIVE
  { id: "j1", title: "Product Designer", company: "Flutterwave", initial: "F", match: 92, tags: ["📍 Lagos, Nigeria", "💼 Full-time", "🎓 Entry Level", "💰 ₦200k–₦350k/month"], why: "Matches your UI Design and Problem Solving skills", readiness: 88, suggestion: "Submit one more portfolio project to improve your chances", posted: "1 day ago", filters: ["all", "nigeria", "entry"], category: "creative" },
  { id: "j2", title: "UI/UX Design Intern", company: "Paystack", initial: "P", match: 85, tags: ["📍 Lagos, Nigeria", "📋 Internship", "💰 ₦80k–₦120k/month"], why: "Matches your UI Design and Communication skills", readiness: 80, suggestion: "Improve your portfolio to increase your chances", posted: "3 days ago", filters: ["all", "nigeria", "intern"], category: "creative" },
  { id: "j5", title: "Graphic Designer", company: "Andela", initial: "A", match: 80, tags: ["🌍 Remote", "💼 Full-time", "💰 ₦150k–₦250k/month"], why: "Matches your visual design strengths", readiness: 78, posted: "2 days ago", filters: ["all", "remote", "entry"], category: "creative" },

  // TECH
  { id: "j4", title: "Frontend Developer Intern", company: "Kuda Bank", initial: "K", match: 71, tags: ["📍 Lagos, Nigeria", "📋 Internship", "💰 ₦60k–₦100k/month"], why: "Matches your Technical Tools and Problem Solving skills", readiness: 70, suggestion: "Level up your Technical Tools skill to 70%+", posted: "1 week ago", filters: ["all", "nigeria", "intern"], category: "tech" },
  { id: "j6", title: "Junior Software Engineer", company: "Interswitch", initial: "I", match: 82, tags: ["📍 Lagos, Nigeria", "💼 Full-time", "🎓 Entry Level"], why: "Matches your Problem Solving skills", readiness: 78, posted: "4 days ago", filters: ["all", "nigeria", "entry"], category: "tech" },
  { id: "j7", title: "Data Analyst Intern", company: "Cowrywise", initial: "C", match: 76, tags: ["🌍 Remote", "📋 Internship"], why: "Matches your Data Literacy", readiness: 72, posted: "6 days ago", filters: ["all", "remote", "intern"], category: "tech" },

  // BUSINESS
  { id: "j3", title: "Junior Product Manager", company: "Cowrywise", initial: "C", match: 78, tags: ["🌍 Remote", "💼 Full-time", "🎓 Entry Level", "💰 ₦180k–₦280k/month"], why: "Matches your Strategic Thinking", readiness: 75, suggestion: "Complete the Research skill missions", posted: "5 days ago", filters: ["all", "remote", "entry"], category: "business" },
  { id: "j8", title: "Business Analyst", company: "Access Bank", initial: "A", match: 80, tags: ["📍 Lagos, Nigeria", "💼 Full-time"], why: "Matches your Business Analysis skills", readiness: 76, posted: "3 days ago", filters: ["all", "nigeria", "entry"], category: "business" },

  // SCIENCE
  { id: "j9", title: "Research Assistant", company: "NIMR", initial: "N", match: 78, tags: ["📍 Lagos, Nigeria", "💼 Full-time"], why: "Matches your Research and Analytical Thinking", readiness: 75, posted: "1 week ago", filters: ["all", "nigeria", "entry"], category: "science" },
  { id: "j10", title: "Lab Technician Intern", company: "Helium Health", initial: "H", match: 72, tags: ["📍 Lagos, Nigeria", "📋 Internship"], why: "Matches your Lab Skills", readiness: 70, posted: "5 days ago", filters: ["all", "nigeria", "intern"], category: "science" },

  // PEOPLE
  { id: "j11", title: "Junior HR Associate", company: "Konga", initial: "K", match: 78, tags: ["📍 Lagos, Nigeria", "💼 Full-time"], why: "Matches your Communication and Empathy", readiness: 76, posted: "2 days ago", filters: ["all", "nigeria", "entry"], category: "people" },
  { id: "j12", title: "Customer Success Intern", company: "Paystack", initial: "P", match: 74, tags: ["🌍 Remote", "📋 Internship"], why: "Matches your Active Listening", readiness: 72, posted: "3 days ago", filters: ["all", "remote", "intern"], category: "people" },

  // COMMUNICATION
  { id: "j13", title: "Junior Content Writer", company: "TechCabal", initial: "T", match: 82, tags: ["🌍 Remote", "💼 Full-time"], why: "Matches your Writing and Storytelling", readiness: 78, posted: "1 day ago", filters: ["all", "remote", "entry"], category: "communication" },
  { id: "j14", title: "Digital Marketing Intern", company: "Jumia", initial: "J", match: 76, tags: ["📍 Lagos, Nigeria", "📋 Internship"], why: "Matches your Media Strategy", readiness: 72, posted: "4 days ago", filters: ["all", "nigeria", "intern"], category: "communication" },
];
