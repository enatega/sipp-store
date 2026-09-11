import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EarningsScreen from './EarningsScreen';
import TabShell from '../components/TabShell';
import { MainStackParamList } from '../navigation/types';

export default function EarningsTabScreen() {
  const stackNavigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <TabShell titleKey="nav_earnings">
      <EarningsScreen navigation={stackNavigation} />
    </TabShell>
  );
}
