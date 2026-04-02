import { redirect } from "next/navigation";
import { createWorkspaceAction } from "@/app/auth/actions";
import { WorkspaceCreateForm } from "@/components/workspace-create-form";
import { getAuthenticatedUser } from "@/lib/server/auth";

export default async function NewWorkspacePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  const createForUser = createWorkspaceAction.bind(null, user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Workspace setup</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Add another workspace for your team.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          This gives you a separate place to manage opportunities, saved codes, and planning for another business or division.
        </p>
      </section>

      <WorkspaceCreateForm action={createForUser} />
    </div>
  );
}
