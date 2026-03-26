"use server";

import { cookies } from "next/headers";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/server/workspace";

export async function setActiveWorkspace(slug: string) {
  const cookieStore = await cookies();

  if (!slug) {
    cookieStore.delete(ACTIVE_WORKSPACE_COOKIE);
    return;
  }

  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, slug, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
