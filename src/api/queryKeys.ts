import { GetOrdersParams } from "./orderServicesTypes";
import {
  GetEarningsDailyParams,
  GetEarningsGraphParams,
  GetEarningsHistoryParams,
  GetEarningsSummaryParams,
} from "./earningsServiceTypes";
import { GetWalletHistoryParams } from "./walletServicesTypes";

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// Base key for all order‑related queries
export const ordersKeys = {
  all: ["orders"] as const,
  new: () => [...ordersKeys.all, "new"] as const,
  inProgress: () => [...ordersKeys.all, "inProgress"] as const,
  ready: () => [...ordersKeys.all, "ready"] as const,
  pickup: () => [...ordersKeys.all, "pickup"] as const,
  completed: () => [...ordersKeys.all, "completed"] as const,
  scheduled: () => [...ordersKeys.all, "scheduled"] as const,
};

// For infinite lists with params
export const newOrdersKeys = {
  all: ordersKeys.new,
  lists: () => [...ordersKeys.new(), "list"] as const,
  list: (params: GetOrdersParams) =>
    [...newOrdersKeys.lists(), params] as const,
};

export const inProgressOrdersKeys = {
  all: ordersKeys.inProgress,
  lists: () => [...ordersKeys.inProgress(), "list"] as const,
  list: (params: GetOrdersParams) =>
    [...inProgressOrdersKeys.lists(), params] as const,
};

export const readyOrdersKeys = {
  all: ordersKeys.ready,
  lists: () => [...ordersKeys.ready(), "list"] as const,
  list: (params: GetOrdersParams) =>
    [...readyOrdersKeys.lists(), params] as const,
};

export const pickupOrdersKeys = {
  all: ordersKeys.pickup,
  lists: () => [...ordersKeys.pickup(), "list"] as const,
  list: (params: GetOrdersParams) =>
    [...pickupOrdersKeys.lists(), params] as const,
};

export const completedOrdersKeys = {
  all: ordersKeys.completed,
  lists: () => [...ordersKeys.completed(), "list"] as const,
  list: (params: GetOrdersParams) =>
    [...completedOrdersKeys.lists(), params] as const,
};

export const scheduledOrdersKeys = {
  all: ordersKeys.scheduled,
  lists: () => [...ordersKeys.scheduled(), "list"] as const,
  list: (params: Pick<GetOrdersParams, "limit">) =>
    [...scheduledOrdersKeys.lists(), params] as const,
};

export const earningsKeys = {
  all: ["earnings"] as const,
  graph: () => [...earningsKeys.all, "graph"] as const,
  graphList: (params: GetEarningsGraphParams) =>
    [...earningsKeys.graph(), params] as const,
  daily: () => [...earningsKeys.all, "daily"] as const,
  dailyList: (params: GetEarningsDailyParams) =>
    [...earningsKeys.daily(), params] as const,
  summary: () => [...earningsKeys.all, "summary"] as const,
  summaryDetail: (params: GetEarningsSummaryParams) =>
    [...earningsKeys.summary(), params] as const,
  history: () => [...earningsKeys.all, "history"] as const,
  historyList: (params: GetEarningsHistoryParams) =>
    [...earningsKeys.history(), params] as const,
};


export const walletKeys = {
  all: ["wallet"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
  history: () => [...walletKeys.all, "history"] as const,
  historyList: (params: GetWalletHistoryParams) =>
    [...walletKeys.history(), params] as const,
};

export const currencyKeys = {
  all: ["currency"] as const,
  config: () => [...currencyKeys.all, "config"] as const,
};

export const appSettingsKeys = {
  all: ['app-settings'] as const,
  store: () => [...appSettingsKeys.all, 'store'] as const,
};

export const supportChatKeys = {
  all: ["support-chat"] as const,
  messages: () => [...supportChatKeys.all, "messages"] as const,
  messagesByChatBox: (chatBoxId: string) =>
    [...supportChatKeys.messages(), chatBoxId] as const,
};

export const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'me'] as const,
  availability: () => [...profileKeys.all, 'availability'] as const,
  workSchedule: () => [...profileKeys.all, 'workSchedule'] as const,
  language: () => [...profileKeys.all, 'language'] as const,
  bankManagement: () => [...profileKeys.all, 'bankManagement'] as const,
};
