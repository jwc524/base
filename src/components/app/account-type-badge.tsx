import { AccountType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AccountTypeBadgeProps = {
  accountType: AccountType;
  className?: string;
};

export function AccountTypeBadge({
  accountType,
  className,
}: AccountTypeBadgeProps) {
  const isArtist = accountType === AccountType.ARTIST;
  const label = isArtist ? "Artist" : "Musician";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px]",
        isArtist
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
          : "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
