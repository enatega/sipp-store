import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Text from "./Text";
import ToggleSwitch from "./ToggleSwitch";
import { useAppTheme } from "../theme/ThemeProvider";
import TimePickerModal from "./TimePickerModal";

export type TimeSlot = {
  open: string;
  close: string;
};

type Props = {
  day: string; // e.g. "monday" (backend key)
  enabled: boolean;
  slots: TimeSlot[]; // each slot: { open, close } (no id)
  onToggle: (enabled: boolean) => void;
  onSlotChange: (
    slotIndex: number,
    field: "open" | "close",
    value: string,
  ) => void;
  onAddSlot: () => void;
  onRemoveSlot: (slotIndex: number) => void;
};

export default function DayScheduleCard({
  day,
  enabled,
  slots,
  onToggle,
  onSlotChange,
  onAddSlot,
  onRemoveSlot,
}: Props) {
  const { theme } = useAppTheme();
  const [editingSlot, setEditingSlot] = useState<{
    index: number;
    field: "open" | "close";
  } | null>(null);
  // Format day for display: capitalize first letter, show first 3 letters
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1, 3);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.gray200,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          variant="body"
          weight="bold"
          color={theme.colors.text}
          style={styles.dayLabel}
        >
          {dayLabel}
        </Text>
        <ToggleSwitch value={enabled} onValueChange={onToggle} />
      </View>

      {enabled && (
        <View style={styles.slotsContainer}>
          {slots.map((slot, idx) => (
            <View key={idx} style={styles.slotRow}>
              <Pressable
                style={[
                  styles.timeBox,
                  {
                    borderColor: theme.colors.gray300,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                accessibilityRole="button"
                onPress={() => setEditingSlot({ index: idx, field: "open" })}
              >
                <Text
                  variant="body"
                  color={theme.colors.text}
                  style={styles.timeText}
                >
                  {slot.open}
                </Text>
              </Pressable>
              <View
                style={[styles.dash, { backgroundColor: theme.colors.gray400 }]}
              />
              <Pressable
                style={[
                  styles.timeBox,
                  {
                    borderColor: theme.colors.gray300,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                accessibilityRole="button"
                onPress={() => setEditingSlot({ index: idx, field: "close" })}
              >
                <Text
                  variant="body"
                  color={theme.colors.text}
                  style={styles.timeText}
                >
                  {slot.close}
                </Text>
              </Pressable>
              {slots.length > 1 ? (
                <Pressable
                  onPress={() => onRemoveSlot(idx)}
                  style={[styles.addBtn, { backgroundColor: "#EF4444" }]}
                >
                  <Text style={styles.addBtnText} color="#FFFFFF">
                    −
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={onAddSlot}
                  style={[
                    styles.addBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.addBtnText} color={theme.colors.buttonText}>
                    +
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
          {slots.length > 1 && (
            <Pressable
              onPress={onAddSlot}
              style={[
                styles.addExtraBtn,
                { borderColor: theme.colors.primary },
              ]}
            >
              <Text
                variant="caption"
                color={theme.colors.primary}
                weight="semiBold"
              >
                + Add slot
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <TimePickerModal
        value={
          editingSlot
            ? slots[editingSlot.index]?.[editingSlot.field] ?? "00:00"
            : "00:00"
        }
        visible={editingSlot !== null}
        onClose={() => setEditingSlot(null)}
        onConfirm={(value) => {
          if (editingSlot) {
            onSlotChange(editingSlot.index, editingSlot.field, value);
          }
          setEditingSlot(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayLabel: { fontSize: 15, letterSpacing: 0.5 },
  slotsContainer: { gap: 10 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: { fontSize: 15, textAlign: "center" },
  dash: { width: 12, height: 2, borderRadius: 1 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 20, lineHeight: 24, fontWeight: "600" },
  addExtraBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderStyle: "dashed",
  },
});
