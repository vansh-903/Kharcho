import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet, BackHandler } from 'react-native';

import { WelcomeScreen } from '../features/onboarding/WelcomeScreen';
import { SmsPermissionScreen } from '../features/onboarding/SmsPermissionScreen';
import { HomeScreen } from '../features/dashboard/HomeScreen';
import { TransactionsScreen } from '../features/transactions/TransactionsScreen';
import { TransactionDetailScreen } from '../features/transactions/TransactionDetailScreen';
import { InsightsScreen } from '../features/insights/InsightsScreen';
import { ProfileScreen } from '../features/accounts/ProfileScreen';
import { TabName } from '../components/BottomTabBar';
import { colors } from '../theme';
import { useTransactions } from '../context/TransactionContext';

type AppScreen =
  | 'Welcome'
  | 'SmsPermission'
  | 'Home'
  | 'Transactions'
  | 'TransactionDetail'
  | 'Insights'
  | 'Profile';

export function AppNavigator() {
  const [screenStack, setScreenStack] = useState<AppScreen[]>(['Welcome']);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const { importFromSms } = useTransactions();

  const currentScreen = screenStack[screenStack.length - 1];

  // Hardware Back Button & Gesture Navigation Support
  useEffect(() => {
    const onBackPress = () => {
      if (screenStack.length > 1) {
        setScreenStack(prev => prev.slice(0, prev.length - 1));
        return true; // handled
      }
      return false; // let Android minimize app
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [screenStack]);

  const pushScreen = (screen: AppScreen) => {
    setScreenStack(prev => [...prev, screen]);
  };

  const goBack = () => {
    if (screenStack.length > 1) {
      setScreenStack(prev => prev.slice(0, prev.length - 1));
    }
  };

  function navigateTab(tab: TabName) {
    setActiveTab(tab);
    if (tab === 'Home') setScreenStack(['Home']);
    else if (tab === 'Transactions') setScreenStack(['Home', 'Transactions']);
    else if (tab === 'Insights') setScreenStack(['Home', 'Insights']);
    else if (tab === 'Profile') setScreenStack(['Home', 'Profile']);
  }

  function openTransaction(id: string) {
    setSelectedTxnId(id);
    pushScreen('TransactionDetail');
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return (
          <WelcomeScreen onGetStarted={() => pushScreen('SmsPermission')} />
        );
      case 'SmsPermission':
        return (
          <SmsPermissionScreen
            onAllow={() => {
              setScreenStack(['Home']);
            }}
            onSkip={() => setScreenStack(['Home'])}
          />
        );
      case 'Home':
        return (
          <HomeScreen
            onNavigate={navigateTab}
            onTransactionPress={openTransaction}
            activeTab="Home"
          />
        );
      case 'Transactions':
        return (
          <TransactionsScreen
            onNavigate={navigateTab}
            onTransactionPress={openTransaction}
            activeTab="Transactions"
          />
        );
      case 'TransactionDetail':
        return selectedTxnId ? (
          <TransactionDetailScreen
            transactionId={selectedTxnId}
            onBack={goBack}
          />
        ) : null;
      case 'Insights':
        return (
          <InsightsScreen onNavigate={navigateTab} activeTab="Insights" />
        );
      case 'Profile':
        return (
          <ProfileScreen onNavigate={navigateTab} activeTab="Profile" />
        );
      default:
        return null;
    }
  };

  return (
    <NavigationContainer>
      <View style={styles.root}>{renderScreen()}</View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivory },
});
