"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveWorkspace } from "@/app/actions/workspace";
import type { WorkspaceOption } from "@/lib/server/workspace";

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceSlug,
}: {
  workspaces: WorkspaceOption[];
  activeWorkspaceSlug?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Workspace
      </span>
      <select
        defaultValue={activeWorkspaceSlug ?? ""}
        onChange={(event) => {
          const nextSlug = event.target.value;
          startTransition(async () => {
            await setActiveWorkspace(nextSlug);
            router.refresh();
          });
        }}
        className="bg-transparent text-sm text-white outline-none"
        disabled={pending}
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.slug} className="bg-slate-950">
            {workspace.name}
          </option>
        ))}
      </select>
    </label>
  );
}
