import Image from "next/image";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-[1.3rem] border border-emerald-400/30 bg-black/40">
            <Image src="/bid-vault-logo.png" alt="The Bid Vault" fill sizes="56px" className="object-contain p-1.5" />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            New password
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Choose a new password.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Pick something strong. Once saved, your old password will stop working immediately.
        </p>
      </section>

      <ResetPasswordForm token={token ?? ""} />
    </div>
  );
}
