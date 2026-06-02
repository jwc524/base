import { cn } from "@/lib/utils";

export function MetaEmpty({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block min-w-[1ch] text-center text-xs text-white/25 tabular-nums",
        className,
      )}
      aria-hidden
    >
      —
    </span>
  );
}
