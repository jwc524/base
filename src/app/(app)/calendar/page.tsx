import { glassCard } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Calendar
      </h1>
      <div className={cn(glassCard, "mt-8 flex items-center justify-center p-16")}>
        <p className="text-white/60">Calendar view coming soon</p>
      </div>
    </div>
  );
}
