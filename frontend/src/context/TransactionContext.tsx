import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, MOCK_TRANSACTIONS } from '../data/mockData';
import {
  requestSmsPermission,
  fetchHistoricTransactions,
  subscribeToNewSms,
} from '../services/smsParser';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  permissionGranted: boolean;
  importPeriodDays: number;
  setImportPeriodDays: (days: number) => void;
  importFromSms: (days?: number) => Promise<number>;
  addManualTransaction: (txn: Transaction) => void;
  updateTransaction: (updated: Transaction) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  isLoading: false,
  permissionGranted: false,
  importPeriodDays: 30,
  setImportPeriodDays: () => {},
  importFromSms: async () => 0,
  addManualTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  clearAllTransactions: () => {},
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [importPeriodDays, setImportPeriodDays] = useState(30);

  // Listen to new incoming SMS live
  useEffect(() => {
    const unsubscribe = subscribeToNewSms((newTxn) => {
      setTransactions((prev) => [newTxn, ...prev]);
    });
    return () => unsubscribe();
  }, []);

  const importFromSms = async (days: number = importPeriodDays): Promise<number> => {
    setIsLoading(true);
    try {
      const granted = await requestSmsPermission();
      setPermissionGranted(granted);
      if (granted) {
        const realTxns = await fetchHistoricTransactions(days);
        if (realTxns.length > 0) {
          setTransactions(realTxns);
          return realTxns.length;
        } else {
          setTransactions([]);
          return 0;
        }
      }
      return 0;
    } catch (err) {
      console.warn('Import error', err);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  const addManualTransaction = (txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        permissionGranted,
        importPeriodDays,
        setImportPeriodDays,
        importFromSms,
        addManualTransaction,
        updateTransaction,
        deleteTransaction,
        clearAllTransactions,
      }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
