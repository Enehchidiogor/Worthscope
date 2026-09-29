/* WorthScope — Certificates.
   Two kinds, both issued client-side (no deployment dependency):
   - "phase": awarded when every mission in a roadmap phase is complete —
     a phase is the closest thing this app has to a single "course".
   - "career": one capstone certificate, awarded once when overall roadmap
     progress reaches CAREER_CERT_THRESHOLD, naming the career the user was
     matched/predicted to (whatever produced their chosen career — the old
     assessment, the voice flow, or the new AI/fallback prediction all funnel
     into the same getChosenCareer() record).
   Idempotent: each is issued at most once per phase / once ever. */

import { getProfile, getChosenCareer } from "@/lib/userState";

export const CAREER_CERT_THRESHOLD = 98;

export type PhaseCertificate = {
  kind: "phase";
  id: string; // `phase_${phaseNumber}` — stable, used for de-dup
  careerPath: string;
  phaseNumber: number;
  phaseTitle: string;
  recipientName: string;
  issuedAt: string;
};

export type CareerCertificate = {
  kind: "career";
  id: "career"; // singleton
  careerPath: string;
  recipientName: string;
  issuedAt: string;
};

export type Certificate = PhaseCertificate | CareerCertificate;

const LS_CERTS = "worthscope_certificates";

function recipientName(): string {
  const p = getProfile();
  return p?.fullName?.trim() || p?.firstName?.trim() || "WorthScope Learner";
}

function loadAll(): Certificate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_CERTS);
    return raw ? (JSON.parse(raw) as Certificate[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: Certificate[]) {
  try {
    localStorage.setItem(LS_CERTS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("worthscope:certificates"));
  } catch {
    // Non-critical.
  }
}

export function getCertificates(): Certificate[] {
  return loadAll().sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
}

export function hasPhaseCertificate(phaseNumber: number): boolean {
  return loadAll().some((c) => c.kind === "phase" && c.phaseNumber === phaseNumber);
}

export function hasCareerCertificate(): boolean {
  return loadAll().some((c) => c.kind === "career");
}

/** Call after a phase's missions are all complete. Returns the new certificate, or null if already issued. */
export function issuePhaseCertificate(careerPath: string, phaseNumber: number, phaseTitle: string): PhaseCertificate | null {
  const id = `phase_${phaseNumber}`;
  const all = loadAll();
  if (all.some((c) => c.id === id)) return null;
  const cert: PhaseCertificate = {
    kind: "phase",
    id,
    careerPath,
    phaseNumber,
    phaseTitle,
    recipientName: recipientName(),
    issuedAt: new Date().toISOString(),
  };
  saveAll([...all, cert]);
  return cert;
}

/** Call whenever overall roadmap progress changes. Returns the new certificate once, at the threshold. */
export function issueCareerCertificateIfEligible(overallPct: number): CareerCertificate | null {
  if (overallPct < CAREER_CERT_THRESHOLD) return null;
  const all = loadAll();
  if (all.some((c) => c.kind === "career")) return null;
  const career = getChosenCareer();
  if (!career?.title) return null;
  const cert: CareerCertificate = {
    kind: "career",
    id: "career",
    careerPath: career.title,
    recipientName: recipientName(),
    issuedAt: new Date().toISOString(),
  };
  saveAll([...all, cert]);
  return cert;
}
