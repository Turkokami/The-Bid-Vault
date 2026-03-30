export default function SamSearchLoading() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="h-3 w-28 rounded-full bg-emerald-400/20" />
        <div className="mt-4 h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
        <div className="mt-4 h-5 w-full max-w-3xl rounded-full bg-white/10" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="h-4 w-32 rounded-full bg-emerald-400/20" />
          <div className="mt-5 space-y-4">
            <div className="h-14 rounded-2xl bg-white/10" />
            <div className="h-14 rounded-2xl bg-white/10" />
            <div className="h-14 rounded-2xl bg-white/10" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="h-4 w-36 rounded-full bg-emerald-400/20" />
          <div className="mt-5 space-y-4">
            <div className="h-40 rounded-[1.5rem] bg-white/10" />
            <div className="h-40 rounded-[1.5rem] bg-white/10" />
            <div className="h-40 rounded-[1.5rem] bg-white/10" />
          </div>
        </div>
      </section>
    </div>
  );
}
