import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  moss: "bg-moss/12 text-moss-dark border-moss/20",
  ember: "bg-ember/12 text-ember border-ember/25",
  gray: "bg-ink/8 text-ink/70 border-ink/10",
  red: "bg-red-100 text-red-700 border-red-200",
};

export function Badge({
  tone = "gray",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
