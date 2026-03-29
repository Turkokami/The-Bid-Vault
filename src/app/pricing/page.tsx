import Link from "next/link";
import { PricingSignupForm } from "@/components/pricing-signup-form";
import { buttonStyles } from "@/components/ui/button";
import { serviceTiers } from "@/lib/demo-data";

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Pricing</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Choose the subscription that fits how your team finds and tracks contracts.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Pick a plan, review what is included, and start your subscription. Every plan is designed to make government contract search and tracking easier to manage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="#signup" className={buttonStyles({ variant: "primary", size: "lg" })}>
            Start your subscription
          </Link>
          <Link href="/dashboard" className={buttonStyles({ variant: "ghost", size: "lg" })}>
            Explore the app first
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {serviceTiers.map((tier) => (
          <article
            key={tier.id}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-300">{tier.name}</p>
                <p className="mt-1 text-sm text-slate-400">{tier.audience}</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                {tier.priceLabel}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">{tier.description}</p>

            <div className="mt-5 space-y-3">
              {tier.features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
                >
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href={`#signup`}
                className={buttonStyles({ variant: tier.id === "tier-growth" ? "primary" : "secondary", size: "md", fullWidth: true })}
              >
                Choose {tier.name}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <PricingSignupForm tiers={serviceTiers} defaultTierId="tier-growth" />
    </div>
  );
}
