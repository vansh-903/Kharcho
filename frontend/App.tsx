import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { TransactionProvider } from './src/context/TransactionContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TransactionProvider>
        <AppNavigator />
      </TransactionProvider>
    </SafeAreaProvider>
  );
}
