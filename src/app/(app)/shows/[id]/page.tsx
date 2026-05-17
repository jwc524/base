import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatShowDate, formatShowTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { glassCard } from "@/lib/styles";
import { cn } from "@/lib/utils";

type ShowDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShowDetailPage({ params }: ShowDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();

  const show = await prisma.show.findFirst({
    where: { id, ownerId: user.id },
  });

  if (!show) {
    notFound();
  }

  const venueLine = [show.venue, show.city].filter(Boolean).join(" · ");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {show.name}
        </h1>
        <p className="mt-2 text-white/60">{formatShowDate(show.date)}</p>
        {venueLine ? (
          <p className="mt-1 text-sm text-white/60">{venueLine}</p>
        ) : null}
        {show.soundcheckTime ? (
          <p className="mt-1 text-sm text-white/30">
            Soundcheck {formatShowTime(show.soundcheckTime)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={cn(glassCard, "p-6")}>
          <h2 className="text-sm font-medium text-white">Setlist</h2>
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-white/60">No setlist yet</p>
            <Button className="mt-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400">
              Create Setlist
            </Button>
          </div>
        </section>

        <section className={cn(glassCard, "p-6")}>
          <h2 className="text-sm font-medium text-white">Roster</h2>
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-white/60">No members yet</p>
            <Button className="mt-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400">
              Add Member
            </Button>
          </div>
        </section>

        <section className={cn(glassCard, "p-6")}>
          <h2 className="text-sm font-medium text-white">Rehearsals</h2>
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-white/60">No rehearsals yet</p>
            <Button className="mt-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400">
              Add Rehearsal
            </Button>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <Link
          href="/shows"
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          ← Back to shows
        </Link>
      </div>
    </div>
  );
}
