"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

function s(fd: FormData, k: string): string {
  return (fd.get(k) ?? "").toString().trim();
}

async function origin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signIn(formData: FormData): Promise<void> {
  const email = s(formData, "email");
  const password = s(formData, "password");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  await logAudit({ actorEmail: email, action: "auth.login" });
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData): Promise<void> {
  const email = s(formData, "email");
  const password = s(formData, "password");
  const full_name = s(formData, "full_name");
  const job_title = s(formData, "job_title");
  const department = s(formData, "department");
  const cohort = s(formData, "cohort");

  if (password.length < 6) {
    redirect(`/signup?error=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await origin()}/auth/confirm`,
      data: { full_name, job_title, department, cohort },
    },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  await logAudit({ actorEmail: email, action: "auth.signup" });

  // If the project auto-confirms, a session exists → straight into the app.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }
  // Otherwise a confirmation email was sent.
  redirect("/login?check_email=1");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function changePassword(formData: FormData): Promise<void> {
  const password = s(formData, "password");
  const confirm = s(formData, "confirm");

  if (password.length < 6) {
    redirect(`/account?error=${encodeURIComponent("Password must be at least 6 characters.")}`);
  }
  if (password !== confirm) {
    redirect(`/account?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }
  await logAudit({ actorEmail: user.email, action: "auth.password_change" });
  redirect("/account?updated=1");
}
