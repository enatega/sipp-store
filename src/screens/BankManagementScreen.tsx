import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";
import { MainStackParamList } from "../navigation/types";
import ScreenHeader from "../components/ScreenHeader";
import TextInput from "../components/TextInput";
import SelectField from "../components/SelectField";
import Button from "../components/Button";
import { useBankManagementScreen } from "../hooks/useBankManagementScreen";

type Props = NativeStackScreenProps<MainStackParamList, "BankManagement">;

export default function BankManagementScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");

  const {
    isLoadingBank,
    isPending,
    currency,
    setCurrency,
    currencyOptions,
    accountHolder,
    setAccountHolder,
    bankName,
    setBankName,
    accountNumber,
    setAccountNumber,
    branchCode,
    setBranchCode,
    errors,
    setErrors,
    handleConfirm,
  } = useBankManagementScreen({ onSuccess: () => navigation.goBack() });

  if (isLoadingBank) {
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
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScreenHeader
        title={t("bank_title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SelectField
          label={t("bank_currency")}
          value={currency}
          options={currencyOptions}
          onSelect={setCurrency}
        />

        <TextInput
          label={t("bank_holder_label")}
          placeholder={t("bank_holder_placeholder")}
          value={accountHolder}
          onChangeText={(v) => {
            setAccountHolder(v);
            if (errors.accountHolder)
              setErrors((e) => ({ ...e, accountHolder: "" }));
          }}
          error={errors.accountHolder}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <TextInput
          label={t("bank_name_label")}
          placeholder={t("bank_name_placeholder")}
          value={bankName}
          onChangeText={(v) => {
            setBankName(v);
            if (errors.bankName) setErrors((e) => ({ ...e, bankName: "" }));
          }}
          error={errors.bankName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <TextInput
          label={t("bank_account_label")}
          placeholder={t("bank_account_placeholder")}
          value={accountNumber}
          onChangeText={(v) => {
            setAccountNumber(v);
            if (errors.accountNumber)
              setErrors((e) => ({ ...e, accountNumber: "" }));
          }}
          error={errors.accountNumber}
          keyboardType="number-pad"
          returnKeyType="next"
        />

        <TextInput
          label={t("bank_branch_code_label")}
          placeholder={t("bank_branch_code_placeholder")}
          value={branchCode}
          onChangeText={(v) => {
            setBranchCode(v);
            if (errors.branchCode) setErrors((e) => ({ ...e, branchCode: "" }));
          }}
          error={errors.branchCode}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />

        <View style={styles.actions}>
          <Button
            label={t("bank_confirm")}
            onPress={handleConfirm}
            loading={isPending}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    flexGrow: 1,
  },
  actions: {
    marginTop: 8,
  },
});
