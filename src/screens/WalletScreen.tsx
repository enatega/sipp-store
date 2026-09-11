import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";
import WalletBalanceCard from "../components/WalletBalanceCard";
import WalletTransactionRow from "../components/WalletTransactionRow";
import WithdrawBottomSheet from "../components/WithdrawBottomSheet";
import WithdrawMessageModal from "../components/WithdrawMessageModal";
import Text from "../components/Text";
import { useWalletBalance, useWalletHistory } from "../hooks/useWalletQueries";
import { useWithdraw } from "../hooks/useWalletMutations";
import { WithdrawSuccessResponse } from "../api/walletServicesTypes";
import { ApiError } from "../api/apiClient";
import { useTranslations } from "../localization/LocalizationProvider";
import { useCurrencyFormatter } from "../hooks/useCurrency";

export default function WalletScreen() {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const { formatAmount } = useCurrencyFormatter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [successData, setSuccessData] =
    useState<WithdrawSuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real data
  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useWalletBalance();
  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useWalletHistory({ params: { limit: 10, page: 1 } });
  const withdrawMutation = useWithdraw();

  const handleWithdrawConfirm = (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    withdrawMutation.mutate(
      { amount: numericAmount, notes: "Withdrawal request from store app" },
      {
        onSuccess: (response) => {
          setSuccessData(response);
          setErrorMessage(null);
          setWithdrawOpen(false);
        },
        onError: (error: ApiError) => {
          // Extract error message from API response
          const msg =
            typeof error.message === "string"
              ? error.message
              : error.message?.join(", ") ||
                "Withdrawal failed. Please try again.";
          setErrorMessage(msg);
          setWithdrawOpen(false);
        },
      },
    );
  };

  const closeModal = () => {
    setSuccessData(null);
    setErrorMessage(null);
  };

  const isLoading = balanceLoading || historyLoading;
  const isRefreshing = withdrawMutation.isPending;

  const onRefresh = () => {
    refetchBalance();
    refetchHistory();
  };

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isLoading && !balanceData) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const currentBalance = balanceData?.current_balance ?? 0;
  const availableAmount = balanceData?.available_amount ?? 0;
  const pendingRequest = balanceData?.pending_request;
  const transactions = historyData?.data ?? [];

  // Decide modal visibility and content
  const isSuccessModalVisible = !!successData && !withdrawMutation.isPending;
  const isErrorModalVisible = !!errorMessage && !withdrawMutation.isPending;

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <WalletBalanceCard
          currentBalance={currentBalance}
          availableAmount={availableAmount}
          onWithdraw={() => setWithdrawOpen(true)}
        />

        {pendingRequest && (
          <View style={styles.section}>
            <Text
              variant="subtitle"
              weight="bold"
              color={theme.colors.text}
              style={styles.sectionTitle}
            >
              {t("wallet_pending_request")}
            </Text>
            <WalletTransactionRow
              iconType="pending"
              label="Requested"
              date={formatDate(pendingRequest.requested_at)}
              amount={formatAmount(pendingRequest.amount, 2)}
              amountColor="#EF4444"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text
            variant="subtitle"
            weight="bold"
            color={theme.colors.text}
            style={styles.sectionTitle}
          >
            {t("wallet_recent_transactions")}
          </Text>
          {transactions.length === 0 ? (
            <Text
              variant="body"
              color={theme.colors.mutedText}
              style={styles.emptyText}
            >
              {t("wallet_no_transactions")}
            </Text>
          ) : (
            transactions.map((item) => (
              <WalletTransactionRow
                key={item.transaction_id}
                iconType={item.type === "debit" ? "cashout" : "pending"}
                label={item.label}
                date={formatDate(item.created_at)}
                amount={formatAmount(item.amount, 2)}
                amountColor={item.type === "debit" ? undefined : "#10B981"}
              />
            ))
          )}
        </View>
      </ScrollView>

      <WithdrawBottomSheet
        visible={withdrawOpen}
        availableAmount={formatAmount(availableAmount, 2)}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={handleWithdrawConfirm}
        isSubmitting={withdrawMutation.isPending}
      />

      {/* Success Modal */}
      {isSuccessModalVisible && (
        <WithdrawMessageModal
          visible={true}
          title={successData.message || t("wallet_withdrawal_submitted")}
          message={successData.eta_message || t("wallet_withdrawal_eta")}
          onClose={closeModal}
          isError={false}
        />
      )}

      {/* Error Modal */}
      {isErrorModalVisible && (
        <WithdrawMessageModal
          visible={true}
          title={t("wallet_withdrawal_failed")}
          message={errorMessage}
          onClose={closeModal}
          isError={true}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 3,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: { marginBottom: 8 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
