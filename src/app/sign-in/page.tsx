import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
import { signInAction } from "@/app/auth/actions";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-black/40">
            <Image
              src="/bid-vault-logo.png"
              alt="The Bid Vault logo"
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            Account access
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Sign in</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Get back into your saved opportunities.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Sign in to your personal workspace to manage saved searches, watchlists, category codes, and planning reminders.
        </p>
      </section>

      <AuthForm mode="sign-in" action={signInAction} />
    </div>
  );
}
