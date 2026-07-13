import type { Applicant, ApplicantStatus } from "@/lib/types";

/* English screening test — MUST match the order used by the public careers
 * form on the website. `answer` is the correct option index. */
export const ENGLISH_TEST: { q: string; options: string[]; answer: number }[] = [
  {
    q: 'A customer texts: "Can I move my cleaning to Friday morning?" What are they asking for?',
    options: ["To cancel the service", "To reschedule to Friday morning", "To pay an invoice", "To add another room"],
    answer: 1,
  },
  {
    q: "Choose the grammatically correct sentence:",
    options: [
      "She don't have no availability today.",
      "She doesn't have any availability today.",
      "She not have availability today.",
      "She haven't availability today.",
    ],
    answer: 1,
  },
  {
    q: 'Fill in the blank: "Thank you for calling Rox Cleaning. How ___ I help you?"',
    options: ["can", "am", "does", "to"],
    answer: 0,
  },
  {
    q: 'A client says: "I\'m running behind schedule." This means the client is:',
    options: ["Early", "On time", "Late / delayed", "Cancelling"],
    answer: 2,
  },
  {
    q: "Which is the most polite reply to an upset customer?",
    options: [
      "That's not my problem.",
      "You are wrong.",
      "I'm so sorry for the inconvenience — let me fix that right away.",
      "Call back later.",
    ],
    answer: 2,
  },
];

export interface Score {
  total: number;
  correct: number;
  breakdown: { englishTest: number; englishSelf: number; experience: number; availability: number; logistics: number };
}

export function scoreApplicant(a: Applicant): Score {
  const ans = a.test_answers ?? {};
  let correct = 0;
  ENGLISH_TEST.forEach((t, i) => {
    if (ans[`q${i}`] === t.answer) correct++;
  });
  const englishTest = correct * 12; // 5 × 12 = 60 max

  const englishSelf = { fluent: 15, advanced: 11, intermediate: 6, basic: 2 }[a.english_self ?? ""] ?? 0;

  let experience = 0;
  if (a.has_experience === "yes") {
    experience = { "<1": 4, "1-2": 7, "3-5": 9, "5+": 10 }[a.years_experience ?? ""] ?? 6;
  }

  const availability = { full_time: 10, part_time: 6, weekends: 4, other: 3 }[a.availability ?? ""] ?? 0;

  const logistics = (a.legal_to_work === "yes" ? 3 : 0) + (a.has_transport === "yes" ? 2 : 0);

  const total = englishTest + englishSelf + experience + availability + logistics;
  return { total, correct, breakdown: { englishTest, englishSelf, experience, availability, logistics } };
}

export function scoreTone(total: number): "green" | "amber" | "red" {
  if (total >= 75) return "green";
  if (total >= 55) return "amber";
  return "red";
}

export const APPLICANT_STATUSES: ApplicantStatus[] = ["new", "screening", "interview", "hired", "rejected"];
export function applicantStatusLabel(s: ApplicantStatus): string {
  return { new: "New", screening: "Screening", interview: "Interview", hired: "Hired", rejected: "Rejected" }[s];
}
export function applicantStatusTone(s: ApplicantStatus): "gray" | "magenta" | "blue" | "amber" | "green" | "red" {
  return { new: "magenta", screening: "amber", interview: "blue", hired: "green", rejected: "red" }[s] as
    | "gray" | "magenta" | "blue" | "amber" | "green" | "red";
}
