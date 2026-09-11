import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MainTabParamList } from './MainTabsNavigator';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Home: NavigatorScreenParams<MainTabParamList> | undefined;
  Language: undefined;
  ProfileDetails: undefined;
  ProfileFieldEdit: {
    field: 'address' | 'phone';
    value: string;
  };
  BankManagement: undefined;
  WorkSchedule: undefined;
  ScheduledOrders: undefined;
  EarningsDetail: undefined;
  EarningsOrderDetail: { date: string };
  StoreChat: {
    chatBoxId?: string | null;
    receiverId?: string | null;
    riderName?: string | null;
    orderId?: string;
  };
};
