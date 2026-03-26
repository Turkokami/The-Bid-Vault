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
