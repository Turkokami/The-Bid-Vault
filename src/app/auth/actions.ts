"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAuthCookie, createUserAccount, authenticateUser, slugifyWorkspaceName } from "@/lib/server/auth";
import { db } from "@/lib/db";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/server/workspace";
import { cookies } from "next/headers";

export type AuthActionState = {
  error?: string;
};

function humanizeAuthError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message;
  if (
    message.includes("ECONNREFUSED") ||
    message.includes("Can't reach database server") ||
    message.includes("connect ECONNREFUSED")
  ) {
    return "This action needs a live database connection. Add a real DATABASE_URL in your environment, then try again.";
  }

  return message || fallback;
}

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  workspaceName: z.string().trim().min(2, "Please enter a workspace name."),
});

const signInSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

const workspaceSchema = z.object({
  workspaceName: z.string().trim().min(2, "Please enter a workspace name."),
});

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    workspaceName: formData.get("workspaceName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We could not create your account." };
  }

  try {
    const user = await createUserAccount(parsed.data);
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_WORKSPACE_COOKIE, user.memberships[0]?.tenant.slug ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (error) {
    return { error: humanizeAuthError(error, "We could not create your account.") };
  }

  redirect("/dashboard");
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We could not sign you in." };
  }

  try {
    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_WORKSPACE_COOKIE, user.memberships[0]?.tenant.slug ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (error) {
    return { error: humanizeAuthError(error, "We could not sign you in.") };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await clearAuthCookie();
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WORKSPACE_COOKIE);
  redirect("/");
}

export async function createWorkspaceAction(
  userId: string,
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = workspaceSchema.safeParse({
    workspaceName: formData.get("workspaceName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We could not create the workspace." };
  }

  const baseSlug = slugifyWorkspaceName(parsed.data.workspaceName) || "workspace";
  let slug = baseSlug;
  let suffix = 2;
  while (await db.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  try {
    const membership = await db.tenantMembership.create({
      data: {
        role: "OWNER",
        user: { connect: { id: userId } },
        tenant: {
          create: {
            name: parsed.data.workspaceName,
            slug,
          },
        },
      },
      include: {
        tenant: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_WORKSPACE_COOKIE, membership.tenant.slug, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (error) {
    return { error: humanizeAuthError(error, "We could not create the workspace.") };
  }

  redirect("/dashboard");
}
