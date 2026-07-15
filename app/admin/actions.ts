"use server";

import { redirect } from "next/navigation";
import { grantTrainer, revokeTrainer, verifyTrainer } from "@/lib/trainer";
import { logAudit } from "@/lib/audit";

export async function trainerLogin(formData: FormData): Promise<void> {
  const email = (formData.get("email") ?? "").toString();
  const passcode = (formData.get("passcode") ?? "").toString();
  if (!verifyTrainer(email, passcode)) {
    await logAudit({ actorEmail: email, action: "admin.login_failed" });
    redirect("/admin/login?error=1");
  }
  await grantTrainer();
  await logAudit({ actorEmail: email, action: "admin.login" });
  redirect("/admin");
}

export async function trainerLogout(): Promise<void> {
  await revokeTrainer();
  redirect("/admin/login");
}
