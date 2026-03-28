import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

  const sizes: Record<ButtonSize, string> = {
    sm: "min-h-10 px-4 py-2 text-xs",
    md: "min-h-11 px-5 py-3 text-sm",
    lg: "min-h-12 px-6 py-3.5 text-sm",
  };

  const variants: Record<ButtonVariant, string> = {
    primary:
      "border border-emerald-300/30 bg-[linear-gradient(180deg,rgba(74,222,128,1)_0%,rgba(34,197,94,0.96)_100%)] text-slate-950 shadow-[0_10px_30px_rgba(34,197,94,0.28),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(110,231,183,1)_0%,rgba(52,211,153,0.98)_100%)] hover:shadow-[0_16px_36px_rgba(34,197,94,0.34),inset_0_1px_0_rgba(255,255,255,0.24)]",
    secondary:
      "border border-white/12 bg-[linear-gradient(180deg,rgba(23,32,49,0.95)_0%,rgba(10,15,27,0.95)_100%)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:border-emerald-400/35 hover:bg-[linear-gradient(180deg,rgba(19,31,44,1)_0%,rgba(11,19,36,1)_100%)] hover:text-emerald-100 hover:shadow-[0_16px_32px_rgba(0,0,0,0.32),0_0_0_1px_rgba(52,211,153,0.08)]",
    ghost:
      "border border-white/10 bg-white/[0.03] text-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-emerald-400/25 hover:bg-emerald-400/[0.08] hover:text-emerald-100 hover:shadow-[0_12px_26px_rgba(0,0,0,0.24)]",
    danger:
      "border border-rose-300/20 bg-[linear-gradient(180deg,rgba(127,29,29,0.85)_0%,rgba(69,10,10,0.92)_100%)] text-rose-50 shadow-[0_10px_26px_rgba(127,29,29,0.22)] hover:-translate-y-0.5 hover:border-rose-300/30 hover:bg-[linear-gradient(180deg,rgba(153,27,27,0.9)_0%,rgba(88,28,28,0.95)_100%)] hover:shadow-[0_14px_32px_rgba(127,29,29,0.28)]",
  };

  return joinClasses(
    base,
    sizes[size],
    variants[variant],
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}
