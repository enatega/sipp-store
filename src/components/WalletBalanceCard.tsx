import React from "react";
import { StyleSheet, View } from "react-native";
import Text from "./Text";
import Button from "./Button";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";
import { useCurrencyFormatter } from "../hooks/useCurrency";

type Props = {
  currentBalance: number;
  availableAmount: number;
  onWithdraw: () => void;
};

export default function WalletBalanceCard({
  currentBalance,
  availableAmount,
  onWithdraw,
}: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const { formatAmount } = useCurrencyFormatter();

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
      <Text variant="body" color={theme.colors.mutedText} style={styles.label}>
        {t("wallet_current_balance")}
      </Text>
      <Text weight="bold" color={theme.colors.text} style={styles.amount}>
        {formatAmount(currentBalance, 2)}
      </Text>
      <View style={styles.availableRow}>
        <Text variant="caption" color={theme.colors.mutedText}>
          {t("wallet_available_for_withdrawal")}
        </Text>
        <Text variant="caption" weight="bold" color={theme.colors.text}>
          {formatAmount(availableAmount, 2)}
        </Text>
      </View>
      <Button label={t("wallet_withdraw_now")} onPress={onWithdraw} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    textAlign: "center",
  },
  amount: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: "center",
  },
  availableRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
});
