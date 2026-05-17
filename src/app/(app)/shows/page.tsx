import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatShowDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { glassCard } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default async function ShowsPage() {
  const user = await requireUser();

  const shows = await prisma.show.findMany({
    where: { ownerId: user.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Shows
        </h1>
        <Link
          href="/shows/new"
          className={cn(
            buttonVariants(),
            "rounded-lg bg-indigo-500 text-white hover:bg-indigo-400",
          )}
        >
          <Plus className="size-4" />
          New Show
        </Link>
      </div>

      {shows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg text-white/60">No shows yet</p>
          <p className="mt-2 max-w-sm text-sm text-white/30">
            Create your first show to get started
          </p>
          <Link
            href="/shows/new"
            className={cn(
              buttonVariants(),
              "mt-6 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400",
            )}
          >
            Create Show
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shows.map((show) => (
            <Link key={show.id} href={`/shows/${show.id}`}>
              <article
                className={cn(
                  glassCard,
                  "p-5 transition-colors hover:border-white/20 hover:bg-white/[0.07]",
                )}
              >
                <h2 className="font-semibold text-white">{show.name}</h2>
                <p className="mt-2 text-sm text-white/60">
                  {formatShowDate(show.date)}
                </p>
                {show.venue ? (
                  <p className="mt-1 text-sm text-white/60">{show.venue}</p>
                ) : null}
                {show.city ? (
                  <p className="text-sm text-white/30">{show.city}</p>
                ) : null}
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
