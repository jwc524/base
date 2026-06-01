import { notFound } from "next/navigation";
import { SetlistBuilder } from "@/components/setlist/setlist-builder";
import { requireUser } from "@/lib/auth";
import { getSetlistDetail } from "@/lib/setlist-queries";

type SetlistBuilderPageProps = {
  params: Promise<{ id: string; setlistId: string }>;
};

export default async function SetlistBuilderPage({
  params,
}: SetlistBuilderPageProps) {
  const { id: showId, setlistId } = await params;
  const user = await requireUser();

  const setlist = await getSetlistDetail(setlistId, user.id);

  if (!setlist || setlist.showId !== showId) {
    notFound();
  }

  return <SetlistBuilder showId={showId} initialSetlist={setlist} />;
}
