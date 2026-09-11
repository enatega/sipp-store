import { useState, useEffect } from "react";
import { useWorkScheduleQuery } from "../hooks/useProfileQueries";
import { useUpdateWorkSchedule } from "../hooks/useProfileMutations";

type BackendDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type StoreTimings = Record<
  BackendDayKey,
  { slots: { open: string; close: string }[]; is_active: boolean }
>;

interface UseWorkScheduleOptions {
  onSuccess?: () => void;
}

export function useWorkScheduleScreen({
  onSuccess,
}: UseWorkScheduleOptions = {}) {
  const { data: scheduleData, isLoading } = useWorkScheduleQuery();
  const updateScheduleMutation = useUpdateWorkSchedule();

  const [schedule, setSchedule] = useState<StoreTimings | null>(null);

  useEffect(() => {
    if (scheduleData?.store_timings) {
      setSchedule(scheduleData.store_timings);
    }
  }, [scheduleData]);

  const toggleDay = (day: BackendDayKey, enabled: boolean) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      return { ...prev, [day]: { ...prev[day], is_active: enabled } };
    });
  };

  const updateSlot = (
    day: BackendDayKey,
    slotIndex: number,
    field: "open" | "close",
    value: string,
  ) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const dayData = prev[day];
      if (!dayData) return prev;
      const updatedSlots = dayData.slots.map((slot, idx) =>
        idx === slotIndex ? { ...slot, [field]: value } : slot,
      );
      return { ...prev, [day]: { ...dayData, slots: updatedSlots } };
    });
  };

  const addSlot = (day: BackendDayKey) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const dayData = prev[day];
      if (!dayData) return prev;
      return {
        ...prev,
        [day]: {
          ...dayData,
          slots: [...dayData.slots, { open: "00:00", close: "23:59" }],
        },
      };
    });
  };

  const removeSlot = (day: BackendDayKey, slotIndex: number) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const dayData = prev[day];
      if (!dayData || dayData.slots.length <= 1) return prev;
      const updatedSlots = dayData.slots.filter((_, idx) => idx !== slotIndex);
      return { ...prev, [day]: { ...dayData, slots: updatedSlots } };
    });
  };

  const handleSave = () => {
    if (!schedule) return;
    updateScheduleMutation.mutate(
      { storeTimings: JSON.stringify(schedule) },
      {
        onSuccess: () => onSuccess?.(),
        onError: (error) =>
          console.error("Failed to update work schedule", error),
      },
    );
  };

  return {
    schedule,
    isLoading,
    isSaving: updateScheduleMutation.isPending,
    toggleDay,
    updateSlot,
    addSlot,
    removeSlot,
    handleSave,
  };
}
