import Image from "next/image";

export function PlaceholderPanel({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-black/40 shadow-[0_0_20px_rgba(74,222,128,0.18)]">
          <Image
            src="/bid-vault-logo.png"
            alt="The Bid Vault logo"
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
          The Bid Vault module
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{body}</p>
    </section>
  );
}
