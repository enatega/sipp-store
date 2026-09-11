import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { MainStackParamList } from "../navigation/types";
import ScreenHeader from "../components/ScreenHeader";
import DayScheduleCard from "../components/DayScheduleCard";
import Button from "../components/Button";
import { useWorkScheduleScreen } from "../hooks/useWorkScheduleScreen";

type Props = NativeStackScreenProps<MainStackParamList, "WorkSchedule">;

type BackendDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAY_ORDER: BackendDayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function WorkScheduleScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    schedule,
    isLoading,
    isSaving,
    toggleDay,
    updateSlot,
    addSlot,
    removeSlot,
    handleSave,
  } = useWorkScheduleScreen({ onSuccess: () => navigation.goBack() });

  if (isLoading || !schedule) {
    return (
      <View
        style={[
          styles.flex,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Work Schedule" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {DAY_ORDER.map((day) => {
          const dayData = schedule[day];
          if (!dayData) return null;
          return (
            <DayScheduleCard
              key={day}
              day={day}
              enabled={dayData.is_active}
              slots={dayData.slots}
              onToggle={(enabled) => toggleDay(day, enabled)}
              onSlotChange={(slotIndex, field, value) =>
                updateSlot(day, slotIndex, field, value)
              }
              onAddSlot={() => addSlot(day)}
              onRemoveSlot={(slotIndex) => removeSlot(day, slotIndex)}
            />
          );
        })}
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.gray200,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <Button
          label="Update Schedule"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  footer: { padding: 16, borderTopWidth: 1 },
});
