import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTranslations } from "../localization/LocalizationProvider";
import { useAppTheme } from "../theme/ThemeProvider";
import Text from "./Text";

type Props = {
  value: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export default function TimePickerModal({
  value,
  visible,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");

  useEffect(() => {
    if (!visible) return;
    const [nextHours = "00", nextMinutes = "00"] = value.split(":");
    setHours(nextHours);
    setMinutes(nextMinutes);
  }, [value, visible]);

  const hoursNumber = Number(hours);
  const minutesNumber = Number(minutes);
  const isValid =
    hours.length > 0 &&
    minutes.length > 0 &&
    Number.isInteger(hoursNumber) &&
    Number.isInteger(minutesNumber) &&
    hoursNumber >= 0 &&
    hoursNumber <= 23 &&
    minutesNumber >= 0 &&
    minutesNumber <= 59;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="body" weight="bold" color={theme.colors.text}>
            {t("work_schedule_select_time")}
          </Text>

          <View style={styles.timeRow}>
            <View style={styles.field}>
              <Text variant="caption" color={theme.colors.mutedText}>
                {t("work_schedule_hour")}
              </Text>
              <TextInput
                accessibilityLabel={t("work_schedule_hour")}
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={setHours}
                selectTextOnFocus
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.gray300,
                    color: theme.colors.text,
                  },
                ]}
                value={hours}
              />
            </View>
            <Text style={styles.separator} color={theme.colors.text}>
              :
            </Text>
            <View style={styles.field}>
              <Text variant="caption" color={theme.colors.mutedText}>
                {t("work_schedule_minute")}
              </Text>
              <TextInput
                accessibilityLabel={t("work_schedule_minute")}
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={setMinutes}
                selectTextOnFocus
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.gray300,
                    color: theme.colors.text,
                  },
                ]}
                value={minutes}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={[styles.action, { borderColor: theme.colors.gray300 }]}
            >
              <Text color={theme.colors.text} weight="medium">
                {t("cancel")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!isValid}
              onPress={() =>
                onConfirm(
                  `${String(hoursNumber).padStart(2, "0")}:${String(minutesNumber).padStart(2, "0")}`,
                )
              }
              style={[
                styles.action,
                { backgroundColor: theme.colors.primary },
                !isValid && styles.disabled,
              ]}
            >
              <Text color={theme.colors.buttonText} weight="medium">
                {t("done")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  card: { borderRadius: 16, padding: 20, gap: 20 },
  timeRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  field: { flex: 1, gap: 6 },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 22,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  separator: { fontSize: 24, paddingBottom: 12 },
  actions: { flexDirection: "row", gap: 12 },
  action: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.5 },
});
