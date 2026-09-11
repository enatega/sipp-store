import { useState, useEffect } from "react";
import { useTranslations } from "../localization/LocalizationProvider";
import { useBankManagementQuery } from "../hooks/useProfileQueries";
import { useUpdateBankManagement } from "../hooks/useProfileMutations";
import { useCurrencyQuery } from "./useCurrency";

interface UseBankManagementProps {
  onSuccess: () => void;
}

export function useBankManagementScreen({ onSuccess }: UseBankManagementProps) {
  const { t } = useTranslations("app");

  // Fetch existing bank details from API
  const { data: bankData, isLoading: isLoadingBank } = useBankManagementQuery();
  const { data: currencyConfig } = useCurrencyQuery();
  const updateBankManagement = useUpdateBankManagement();

  // Form state
  const [currency, setCurrency] = useState("USD");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
  });

  // Pre-fill form when bank data loads
  useEffect(() => {
    if (bankData) {
      setAccountHolder(bankData.account_holder_name ?? "");
      setBankName(bankData.bank_name ?? "");
      setAccountNumber(bankData.account_number ?? "");
      setBranchCode(bankData.branch_code ?? "");
    }
  }, [bankData]);

  useEffect(() => {
    if (currencyConfig?.code) {
      setCurrency(currencyConfig.code);
    }
  }, [currencyConfig?.code]);

  const currencyOptions = currencyConfig
    ? [
        {
          value: currencyConfig.code,
          label: `${currencyConfig.code} (${currencyConfig.symbol})`,
        },
      ]
    : [{ value: currency, label: currency }];

  const validate = (): boolean => {
    const next = {
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      branchCode: "",
    };
    let valid = true;

    if (!accountHolder.trim()) {
      next.accountHolder = t("bank_holder_required");
      valid = false;
    }
    if (!bankName.trim()) {
      next.bankName = t("bank_name_required");
      valid = false;
    }
    if (!accountNumber.trim()) {
      next.accountNumber = t("bank_account_required");
      valid = false;
    }
    if (!branchCode.trim()) {
      next.branchCode = t("bank_branch_code_required");
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    updateBankManagement.mutate(
      {
        bankName,
        accountHolderName: accountHolder,
        accountNumber,
        branchCode,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (error) => {
          console.error("Bank update failed:", error);
        },
      },
    );
  };

  return {
    isLoadingBank,
    isPending: updateBankManagement.isPending,
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
  };
}
