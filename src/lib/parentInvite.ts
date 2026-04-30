/* WorthScope — Parent invite token utilities (client-side, MVP)
   Stores invites in localStorage so links work locally without a backend. */

export type ParentInvite = {
  token: string;
  studentFirstName: string;
  studentFullName: string;
  educationLevel?: string;
  classOrLevel?: string;
  email?: string;
  createdAt: number;
};

const STORE_KEY = "worthscope_parent_invites";
const ACCESS_PREFIX = "worthscope_parent_access_"; // + token

function readAll(): Record<string, ParentInvite> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, ParentInvite>) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(map)); } catch {/* noop */}
}

function makeToken(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${rand}${time}`;
}

export function createParentInvite(opts: { email?: string }): ParentInvite {
  let profile: any = {};
  try {
    const raw = localStorage.getItem("worthscope_user_profile");
    if (raw) profile = JSON.parse(raw);
  } catch {/* noop */}

  const fullName: string = profile.fullName || "Your child";
  const firstName: string = profile.firstName || (typeof fullName === "string" ? fullName.split(" ")[0] : "Your child");

  const invite: ParentInvite = {
    token: makeToken(),
    studentFirstName: firstName,
    studentFullName: fullName,
    educationLevel: profile.educationLevel,
    classOrLevel: profile.classOrLevel,
    email: opts.email,
    createdAt: Date.now(),
  };

  const all = readAll();
  all[invite.token] = invite;
  writeAll(all);
  return invite;
}

export function getParentInvite(token: string): ParentInvite | null {
  if (!token) return null;
  const all = readAll();
  return all[token] || null;
}

export function buildInviteUrl(token: string): string {
  return `${window.location.origin}/parent/${token}`;
}

export function markAccessGranted(token: string) {
  try { sessionStorage.setItem(ACCESS_PREFIX + token, "1"); } catch {/* noop */}
}

export function hasAccessGranted(token: string): boolean {
  try { return sessionStorage.getItem(ACCESS_PREFIX + token) === "1"; } catch { return false; }
}
