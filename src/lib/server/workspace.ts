import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { demoTenants } from "@/lib/demo-data";

export const DEMO_USER_EMAIL = "demo@thebidvault.local";
export const ACTIVE_WORKSPACE_COOKIE = "bid-vault-active-workspace";

export type WorkspaceOption = {
  id: string;
  slug: string;
  name: string;
  role: string;
  description: string;
};

export type ViewerContext = {
  mode: "database" | "demo";
  user: {
    email: string;
    name: string;
  };
  workspaces: WorkspaceOption[];
  activeWorkspace: WorkspaceOption | null;
};

function roleLabel(role: string) {
  return role.toLowerCase();
}

function demoWorkspaceDescription(slug: string) {
  const tenant = demoTenants.find((item) => item.slug === slug);
  return tenant?.industryFocus ?? "Government contracting workspace";
}

export async function getViewerContext(): Promise<ViewerContext> {
  const cookieStore = await cookies();
  const requestedWorkspace = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  try {
    const user = await db.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
      include: {
        memberships: {
          include: {
            tenant: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (user && user.memberships.length > 0) {
      const workspaces = user.memberships.map((membership) => ({
        id: membership.tenant.id,
        slug: membership.tenant.slug,
        name: membership.tenant.name,
        role: roleLabel(membership.role),
        description: "Persistent tenant workspace",
      }));

      const activeWorkspace =
        workspaces.find((workspace) => workspace.slug === requestedWorkspace) ??
        workspaces[0] ??
        null;

      return {
        mode: "database",
        user: {
          email: user.email,
          name: user.name ?? "Demo User",
        },
        workspaces,
        activeWorkspace,
      };
    }
  } catch {
    // Fall through to demo context when Postgres is not connected yet.
  }

  const workspaces = demoTenants.map((tenant) => ({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    role: "owner",
    description: demoWorkspaceDescription(tenant.slug),
  }));

  return {
    mode: "demo",
    user: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
    workspaces,
    activeWorkspace:
      workspaces.find((workspace) => workspace.slug === requestedWorkspace) ??
      workspaces[0] ??
      null,
  };
}
