import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "./Text";
import TextInput from "./TextInput";
import Button from "./Button";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";

type Props = {
  visible: boolean;
  availableAmount: string;
  onClose: () => void;
  onConfirm: (amount: string) => void;
  isSubmitting?: boolean;
};

/**
 * Bottom sheet for entering a withdrawal amount.
 */
export default function WithdrawBottomSheet({
  visible,
  availableAmount,
  onClose,
  onConfirm,
  isSubmitting,
}: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const handleConfirm = () => {
    if (isSubmitting) return;
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    onConfirm(amount);
    setAmount("");
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  useEffect(() => {
    const handleShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    };

    const handleHide = () => {
      setKeyboardHeight(0);
    };

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, handleShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          style={styles.kvWrapper}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.background,
                  paddingBottom: insets.bottom + 16,
                  marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
                },
              ]}
            >
              {/* Handle */}
              <View
                style={[styles.handle, { backgroundColor: theme.colors.gray300 }]}
              />

              {/* Available amount row */}
              <View
                style={[
                  styles.availableRow,
                  { borderBottomColor: theme.colors.gray200 },
                ]}
              >
                <Text variant="body" color={theme.colors.text}>
                  {t("wallet_available_amount_label")}
                </Text>
                <Text variant="body" weight="bold" color={theme.colors.text}>
                  {availableAmount}
                </Text>
              </View>

              {/* Amount input */}
              <View style={styles.inputSection}>
                <TextInput
                  label={t("wallet_enter_amount")}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={(v) => {
                    setAmount(v);
                    if (error) setError("");
                  }}
                  error={error}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                />
              </View>

              {/* Confirm button */}
              <View style={styles.actions}>
                <Button
                  label={t("wallet_confirm_withdraw")}
                  onPress={handleConfirm}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  kvWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  availableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  actions: {},
});
