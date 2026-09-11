import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Text from "./Text";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";

type Props = {
  visible: boolean;
  orderCode?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const MAX_REASON_LENGTH = 200;

export default function RejectOrderModal({
  visible,
  orderCode,
  isSubmitting,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const [reason, setReason] = useState("");

  const suggestedReasons = useMemo(
    () => [
      t("reject_reason_item_out_of_stock"),
      t("reject_reason_kitchen_busy"),
      t("reject_reason_cannot_deliver"),
      t("reject_reason_ingredient_unavailable"),
      t("reject_reason_closing_soon"),
      t("reject_reason_order_too_large"),
      t("reject_reason_other"),
    ],
    [t],
  );
  const otherReasonLabel = t("reject_reason_other");
  const isOtherSelected = reason.trim() === otherReasonLabel;
  const customOtherReason = reason === otherReasonLabel ? "" : reason.trim();

  const trimmedReason = reason.trim();
  const disableConfirm =
    trimmedReason.length === 0
    || (isOtherSelected && customOtherReason.length === 0)
    || Boolean(isSubmitting);

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    if (disableConfirm) return;
    onConfirm(trimmedReason);
    setReason("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={[styles.container, { backgroundColor: theme.colors.white }]}> 
          <View style={[styles.header, { borderBottomColor: theme.colors.gray200 }]}> 
            <View style={styles.headerLeft}>
              <View style={styles.alertIconWrap}>
                <Feather name="alert-triangle" size={18} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.title} weight="medium">{t("reject_modal_title")}</Text>
                <Text style={styles.subtitle} color={theme.colors.gray500}>
                  {orderCode ? `${t("reject_modal_order_prefix")} ${orderCode}` : ""}
                </Text>
              </View>
            </View>

            <Pressable style={[styles.closeBtn, { borderColor: theme.colors.gray200 }]} onPress={handleClose}>
              <Feather name="x" size={18} color={theme.colors.gray500} />
            </Pressable>
          </View>

          <View style={[styles.body, { borderBottomColor: theme.colors.gray200 }]}> 
            <Text style={styles.bodyText} color={theme.colors.gray500}>
              {t("reject_modal_description")}
            </Text>

            <Text style={styles.suggestedLabel} color={theme.colors.gray500}>
              {t("reject_modal_suggested_reasons")}
            </Text>

            <View style={styles.chipsWrap}>
              {suggestedReasons.map((item) => {
                const selected = trimmedReason === item;
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? theme.colors.primary : theme.colors.gray300,
                        backgroundColor: selected ? theme.colors.green50 : theme.colors.white,
                      },
                    ]}
                    onPress={() => setReason(item)}
                  >
                    <Text style={styles.chipText} color={theme.colors.gray600}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isOtherSelected ? (
              <>
                <View style={[styles.reasonInputWrap, { backgroundColor: theme.colors.gray50 }]}> 
                  <TextInput
                    value={reason === otherReasonLabel ? "" : reason}
                    onChangeText={(value) => setReason(value.slice(0, MAX_REASON_LENGTH))}
                    placeholder={t("reject_modal_reason_placeholder")}
                    placeholderTextColor={theme.colors.gray500}
                    multiline
                    maxLength={MAX_REASON_LENGTH}
                    style={[styles.reasonInput, { color: theme.colors.gray900 }]}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.counterText} color={theme.colors.gray500}>
                  {`${customOtherReason.length}/${MAX_REASON_LENGTH}`}
                </Text>
              </>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: theme.colors.gray300 }]}
              onPress={handleClose}
              disabled={Boolean(isSubmitting)}
            >
              <Text style={styles.cancelBtnText} weight="medium">
                {t("cancel")}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.rejectBtn, disableConfirm && styles.rejectBtnDisabled]}
              onPress={handleConfirm}
              disabled={disableConfirm}
            >
              <Text style={styles.rejectBtnText} weight="medium">
                {t("reject_modal_confirm")}
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alertIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    color: "#18181B",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 16,
    borderBottomWidth: 1,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  suggestedLabel: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 18,
  },
  reasonInputWrap: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 80,
  },
  reasonInput: {
    fontSize: 12,
    lineHeight: 18,
    minHeight: 64,
  },
  counterText: {
    textAlign: "right",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#18181B",
  },
  rejectBtn: {
    flex: 1,
    borderRadius: 40,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
  },
  rejectBtnDisabled: {
    opacity: 0.55,
  },
  rejectBtnText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
