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

  const code = data?.code?.trim() || "CRC";
  const configured = data?.symbol?.trim();
  let symbol = configured && configured.toUpperCase() !== code.toUpperCase()
    ? configured === "¡" ? "₡" : configured
    : "₡";
  if ((!configured || configured.toUpperCase() === code.toUpperCase()) && code.toUpperCase() !== "CRC") {
    try {
      const resolved = new Intl.NumberFormat("en", {
        style: "currency", currency: code, currencyDisplay: "narrowSymbol",
      }).formatToParts(0).find((part) => part.type === "currency")?.value;
      symbol = resolved && resolved.toUpperCase() !== code.toUpperCase() ? resolved : "¤";
    } catch {
      symbol = "¤";
    }
  }

  const formatAmount = (value: number, fractionDigits = 2) => {
    const numericValue = Number(value ?? 0);
    return `${symbol} ${numericValue.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  };

  return { symbol, code, formatAmount };
}
