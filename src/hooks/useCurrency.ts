import { useQuery } from "@tanstack/react-query";
import { currencyService } from "../api/currencyService";
import { currencyKeys } from "../api/queryKeys";

export function useCurrencyQuery() {
  return useQuery({
    queryKey: currencyKeys.config(),
    queryFn: currencyService.getCurrencyConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrencyFormatter() {
  const { data } = useCurrencyQuery();

  const symbol = data?.symbol ?? "$";
  const code = data?.code ?? "USD";

  const formatAmount = (value: number, fractionDigits = 2) => {
    const numericValue = Number(value ?? 0);
    return `${symbol} ${numericValue.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  };

  return { symbol, code, formatAmount };
}
