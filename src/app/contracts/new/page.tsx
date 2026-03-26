import { NewContractForm } from "@/app/contracts/new/new-contract-form";

export default function NewContractPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          New contract
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Add a contract opportunity to the vault.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This form already includes server-side validation. The next step after
          UI completion is wiring it to Prisma create mutations.
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">
        <NewContractForm />
      </section>
    </div>
  );
}
