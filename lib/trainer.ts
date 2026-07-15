import "server-only";
import { cookies } from "next/headers";

// App-layer trainer gate for /admin (per docs/SECURITY.md — email-checked
// server-side). Demo-first: credentials default to documented demo values so
// the panel is reachable in the demo, and the owner can override via env.
export function trainerEmail(): string {
  return (process.env.TRAINER_EMAIL || "trainer@demo.com").toLowerCase();
}
export function trainerPasscode(): string {
  return process.env.TRAINER_PASSCODE || "impact2025";
}

const COOKIE = "trainer_session";

export async function isTrainer(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === "ok";
}

export async function grantTrainer(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "ok", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
}

export async function revokeTrainer(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export function verifyTrainer(email: string, passcode: string): boolean {
  return (
    email.trim().toLowerCase() === trainerEmail() &&
    passcode === trainerPasscode()
  );
}
