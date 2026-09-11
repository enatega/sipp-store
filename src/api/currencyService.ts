import apiClient from "./apiClient";
import { CurrencyConfig } from "./currencyTypes";

const BASE_PATH = "/apps/deliveries/currency";

export const currencyService = {
  getCurrencyConfig: () => apiClient.get<CurrencyConfig>(BASE_PATH),
};
