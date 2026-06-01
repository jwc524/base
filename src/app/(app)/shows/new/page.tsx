import { NewShowForm } from "./new-show-form";

export const dynamic = "force-dynamic";

export default function NewShowPage() {
  return (
    <div className="flex min-h-full items-start justify-center p-6 md:p-8">
      <NewShowForm />
    </div>
  );
}
