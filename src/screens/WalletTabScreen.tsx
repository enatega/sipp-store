import React from 'react';
import WalletScreen from './WalletScreen';
import TabShell from '../components/TabShell';

export default function WalletTabScreen() {
  return (
    <TabShell titleKey="nav_wallet">
      <WalletScreen />
    </TabShell>
  );
}
