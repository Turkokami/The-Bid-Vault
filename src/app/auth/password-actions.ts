"use server";

import { z } from "zod";
import { createPasswordResetToken, resetPasswordWithToken } from "@/lib/server/auth";
import { Resend } from "resend";

export type PasswordActionState = {
  error?: string;
  success?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.ALERT_FROM_EMAIL ?? "alerts@thebidvault.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://thebidvault.com";

export async function requestPasswordResetAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const token = await createPasswordResetToken(email.data);

    if (token) {
      const resetUrl = `${APP_URL}/reset-password?token=${token}`;
      await resend.emails.send({
        from: FROM,
        to: email.data,
        subject: "Reset your Bid Vault password",
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0b1324;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1324;padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr>
          <td style="background:#050816;border:1px solid rgba(52,211,153,0.2);border-radius:16px;padding:32px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#6ee7b7;">The Bid Vault</p>
            <h1 style="margin:12px 0 0;font-size:22px;font-weight:700;color:#f1f5f9;">Reset your password</h1>
            <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link expires in 1 hour.
            </p>
            <div style="margin:24px 0;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#059669;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;">
                Reset password →
              </a>
            </div>
            <p style="margin:0;font-size:12px;color:#475569;">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
    }
    // Always return success to avoid revealing whether the email exists
    return { success: "If an account exists for that email, a reset link is on its way." };
  } catch {
    return { error: "Something went wrong. Please try again in a moment." };
  }
}

export async function resetPasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "Invalid reset link. Please request a new one." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  try {
    await resetPasswordWithToken(token, password);
    return { success: "Password updated. You can now sign in with your new password." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not reset password. Request a new link." };
  }
}
