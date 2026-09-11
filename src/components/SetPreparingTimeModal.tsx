import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";

const { width } = Dimensions.get("window");
const CHIP_WIDTH = 82;
const ROW_GAP = 15;

type Props = {
  visible: boolean;
  onClose: () => void;
  onDone: (minutes: number) => void;
};

export default function SetPreparingTimeModal({
  visible,
  onClose,
  onDone,
}: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const timeOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  const handleDone = () => {
    if (selectedTime !== null) {
      console.log("[SetPreparingTimeModal] Done clicked", {
        selectedTimeInMinutes: selectedTime,
      });
      onDone(selectedTime);
      setSelectedTime(null);
    }
  };

  const handleClose = () => {
    setSelectedTime(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={modalStyles.overlay} onPress={handleClose}>
        <View
          style={[
            modalStyles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header: center title, close button on right */}
          <View style={modalStyles.header}>
            <View style={modalStyles.leftSpacer} />
            <Text style={modalStyles.title}>{t("set_preparing_time")}</Text>
            <Pressable
              style={modalStyles.closeButton}
              onPress={handleClose}
              hitSlop={10}
            >
              <AntDesign name="close-circle" size={24} color={theme.colors.gray600} />
            </Pressable>
          </View>

          {/* Chips grid */}
          <View style={modalStyles.grid}>
            {timeOptions?.map((min) => {
              const isSelected = selectedTime === min;
              return (
                <Pressable
                  key={min}
                  style={[
                    modalStyles.timeButton,
                    {
                      width: CHIP_WIDTH,
                      borderColor: "transparent",
                      backgroundColor: isSelected ? "#111827" : theme.colors.gray200,
                    },
                  ]}
                  onPress={() => {
                    console.log("[SetPreparingTimeModal] Time selected", {
                      selectedTimeInMinutes: min,
                    });
                    setSelectedTime(min);
                  }}
                >
                  <Text
                    style={[
                      modalStyles.timeText,
                      { color: isSelected ? theme.colors.buttonText : theme.colors.gray600 },
                    ]}
                  >
                    {min} min
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Full‑width Done button */}
          <Pressable
            style={[
              modalStyles.doneButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: selectedTime !== null ? 1 : 0.6,
              },
            ]}
            onPress={handleDone}
            disabled={selectedTime === null}
          >
            <Text
              style={[
                modalStyles.doneText,
                { color: selectedTime !== null ? theme.colors.buttonText : theme.colors.gray500 },
              ]}
            >
              {t("done")}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    width: width,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  leftSpacer: {
    width: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: ROW_GAP,
    marginBottom: 30,
  },
  timeButton: {
    width: CHIP_WIDTH,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  doneButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: "center",
  },
  doneText: {
    fontWeight: "500",
    fontSize: 16,
  },
});
