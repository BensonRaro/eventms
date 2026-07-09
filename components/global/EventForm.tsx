"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ImageIcon,
  Link2,
  MapPin,
  Ticket,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CustomInput } from "@/components/global/CustomInput";
import { CustomSelect } from "./CustomSelect";
import { UploadThingUploader } from "./UploadThingUploader";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const eventCategories = [
  { id: "music", name: "Music" },
  { id: "sports", name: "Sports" },
  { id: "arts", name: "Arts & Culture" },
  { id: "food", name: "Food & Drink" },
  { id: "tech", name: "Technology" },
  { id: "business", name: "Business" },
  { id: "education", name: "Education" },
  { id: "other", name: "Other" },
] as const;

type EventFormValues = {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  location: string;
  imageUrl: string;
  categoryId: string;
  price: number;
  isFree: boolean;
  url: string;
};

type EventFormProps = {
  eventId?: string;
  mode?: "create" | "edit";
};

const defaultValues: EventFormValues = {
  name: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
  location: "",
  imageUrl: "",
  categoryId: "",
  price: 0,
  isFree: false,
  url: "",
};

export function EventForm({ eventId, mode = "create" }: EventFormProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();

  const { control, handleSubmit, reset, setValue, watch, formState } =
    useForm<EventFormValues>({
      defaultValues,
    });

  const isFree = watch("isFree");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const selectedRange = useMemo<DateRange | undefined>(() => {
    return {
      from: startDate ? new Date(startDate) : undefined,
      to: endDate ? new Date(endDate) : undefined,
    };
  }, [startDate, endDate]);

  useEffect(() => {
    if (mode !== "edit" || !eventId || eventId === "new") {
      return;
    }

    const loadEvent = async () => {
      setIsLoadingEvent(true);
      setFormError(null);

      try {
        const response = await fetch(
          `/api/events/${encodeURIComponent(eventId)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.error || "Unable to load event details.");
        }

        const event = await response.json();
        console.log("Loaded event details:", event);
        reset({
          name: event.name ?? "",
          description: event.description ?? "",
          startDate: event.startDate ? new Date(event.startDate) : new Date(),
          endDate: event.endDate ? new Date(event.endDate) : new Date(),
          location: event.location ?? "",
          imageUrl: event.imageUrl ?? "",
          categoryId: event.categoryId ?? "",
          price: event.price ?? 0,
          isFree: event.isFree ?? false,
          url: event.url ?? "",
        });
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Failed to load event details.",
        );
      } finally {
        setIsLoadingEvent(false);
      }
    };

    loadEvent();
  }, [eventId, mode, reset]);

  const onSubmit = async (values: EventFormValues) => {
    if (!sessionData?.user?.id) {
      setFormError("Sign in to create or edit events.");
      return;
    }

    setFormError(null);

    const payload = {
      ...values,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
      price: values.isFree ? 0 : Number(values.price ?? 0),
      organizerId: sessionData.user.id,
    } as const;

    const endpoint =
      mode === "edit" && eventId && eventId !== "new"
        ? `/api/events/${eventId}`
        : "/api/events";
    const method = mode === "edit" ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        toast.error(
          errorBody?.error || "Unable to save event. Please try again.",
        );
        throw new Error(
          errorBody?.error || "Unable to save event. Please try again.",
        );
      } else {
        toast.success(
          mode === "edit"
            ? "Event updated successfully!"
            : "Event created successfully!",
        );
        router.push("/organizer/events");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save event. Please try again.",
      );
    }
  };

  const isSubmitting = formState.isSubmitting || isLoadingEvent;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setValue("startDate", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("endDate", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setValue("startDate", range.from, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("endDate", range.to ?? range.from, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === "edit" ? "Edit event" : "Create event"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "edit"
                ? "Update your event details below."
                : "Fill in the event details to publish your experience."}
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {mode === "edit" ? "Save changes" : "Create event"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <CustomInput
              control={control}
              name="name"
              label="Event Name"
              placeholder="Summer Launch Party"
              description="Give your event a clear and memorable title."
              disabled={isSubmitting}
            />

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Event Dates
              </label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between rounded-xl border-input bg-background py-6 text-left shadow-sm"
                  onClick={() => setIsDatePickerOpen((value) => !value)}
                  disabled={isSubmitting}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    {selectedRange?.from ? (
                      selectedRange.to ? (
                        <>
                          {selectedRange.from.toLocaleDateString()} -{" "}
                          {selectedRange.to.toLocaleDateString()}
                        </>
                      ) : (
                        selectedRange.from.toLocaleDateString()
                      )
                    ) : (
                      "Choose event dates"
                    )}
                  </span>
                </Button>

                {isDatePickerOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border bg-background p-3 shadow-xl">
                    <Calendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>

            <CustomInput
              control={control}
              name="location"
              label="Location"
              placeholder="Nairobi, Kenya"
              description="Where should people go?"
              startIcon={<MapPin className="h-4 w-4" />}
              disabled={isSubmitting}
            />

            <div className="space-y-3">
              <CustomInput
                control={control}
                name="imageUrl"
                label="Image URL"
                placeholder="https://example.com/banner.jpg"
                description="Optional cover image for the event."
                startIcon={<ImageIcon className="h-4 w-4" />}
                disabled={isSubmitting}
              />

              <div className="rounded-xl border border-dashed border-input bg-background/60 p-4">
                <p className="mb-3 text-sm font-medium">Upload event image</p>
                <UploadThingUploader
                  value={watch("imageUrl")}
                  onUploadComplete={(url) => {
                    setValue("imageUrl", url, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Description
              </label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Tell guests what to expect..."
                    className="min-h-36 rounded-xl border-input shadow-sm"
                  />
                )}
              />
            </div>

            <CustomSelect
              control={control}
              name="categoryId"
              label="Category"
              placeholder="Select a category"
              options={eventCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              disabled={isSubmitting}
            />

            <CustomInput
              control={control}
              name="url"
              label="Event URL"
              placeholder="https://your-event.com"
              description="Link attendees to a registration page or landing page."
              startIcon={<Link2 className="h-4 w-4" />}
              disabled={isSubmitting}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <CustomInput
                control={control}
                name="price"
                label="Price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                description="Set a ticket price."
                startIcon={<Ticket className="h-4 w-4" />}
                disabled={isFree || isSubmitting}
              />

              <div className="flex items-center gap-2 rounded-xl border border-input bg-input p-2 shadow-sm h-12 mt-8">
                <Controller
                  control={control}
                  name="isFree"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isFree"
                      disabled={isSubmitting}
                    />
                  )}
                />
                <label htmlFor="isFree" className="text-sm font-medium">
                  This event is free
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
