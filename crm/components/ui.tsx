import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-graphite">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-graphite/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "gray" | "magenta" | "teal" | "green" | "amber" | "red" | "blue";
const toneClasses: Record<Tone, string> = {
  gray: "bg-graphite/8 text-graphite/70",
  magenta: "bg-magenta/10 text-magenta-dark",
  teal: "bg-teal/10 text-teal",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
  blue: "bg-sky-100 text-sky-700",
};

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-magenta text-white hover:bg-magenta-dark shadow-sm shadow-magenta/25",
    secondary: "border border-black/10 bg-white text-graphite hover:bg-mist",
    ghost: "text-graphite/70 hover:bg-black/5",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const variants = {
    primary: "bg-magenta text-white hover:bg-magenta-dark shadow-sm shadow-magenta/25",
    secondary: "border border-black/10 bg-white text-graphite hover:bg-mist",
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-graphite outline-none transition-colors placeholder:text-graphite/35 focus:border-magenta focus:ring-2 focus:ring-magenta/20";

export const labelClass = "mb-1.5 block text-sm font-medium text-graphite/80";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-16 text-center">
      <p className="font-semibold text-graphite/70">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-graphite/50">{hint}</p>}
    </div>
  );
}
