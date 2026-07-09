import { EventForm } from "@/components/global/EventForm";

type OrganizerEventFormPageProps = {
  params: Promise<{ id: string }>;
};

const CreateEventPage = async ({ params }: OrganizerEventFormPageProps) => {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create Event</h1>
        <p className="text-muted-foreground">
          Start building a new event experience.
        </p>
      </div>

      <EventForm eventId={id} mode={id === "new" ? "create" : "edit"} />
    </div>
  );
};

export default CreateEventPage;
