import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from '../components/BottomTabBar';
import HomeTabScreen from '../screens/HomeTabScreen';
import WalletTabScreen from '../screens/WalletTabScreen';
import EarningsTabScreen from '../screens/EarningsTabScreen';
import ProfileMainTabScreen from '../screens/ProfileMainTabScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  WalletTab: undefined;
  EarningsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeTabScreen} />
      <Tab.Screen name="WalletTab" component={WalletTabScreen} />
      <Tab.Screen name="EarningsTab" component={EarningsTabScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileMainTabScreen} />
    </Tab.Navigator>
  );
}
