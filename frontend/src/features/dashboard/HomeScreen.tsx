import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
} from 'react-native';
import { colors, spacing, layout } from '../../theme';
import { TransactionRow } from '../../components/TransactionRow';
import { BottomTabBar, TabName } from '../../components/BottomTabBar';
import { AddTransactionModal } from '../../components/AddTransactionModal';
import { useTransactions } from '../../context/TransactionContext';
import { formatFullAmount } from '../../data/mockData';

interface Props {
  onNavigate: (tab: TabName) => void;
  onTransactionPress: (id: string) => void;
  activeTab: TabName;
}

export function HomeScreen({ onNavigate, onTransactionPress, activeTab }: Props) {
  const { transactions } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month

  // Compute target month
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
  const currentMonthName = targetDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Filter transactions for selected month
  const monthlyTransactions = transactions.filter(t => {
    const tDate = new Date(t.occurredAt);
    return (
      tDate.getMonth() === targetDate.getMonth() &&
      tDate.getFullYear() === targetDate.getFullYear()
    );
  });

  // Calculate monthly totals
  const totalIncome = monthlyTransactions
    .filter(t => t.direction === 'credit')
    .reduce((sum, t) => sum + t.amountPaise, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.direction === 'debit')
    .reduce((sum, t) => sum + t.amountPaise, 0);

  const netBalance = totalIncome - totalExpense;

  // Recent transactions
  const displayTransactions = monthlyTransactions.length > 0 ? monthlyTransactions : transactions;
  const recent = displayTransactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header from v1-screens.png Screen 3: "Kharcho" left, Bell 🔔 right */}
      <View style={styles.screenHeader}>
        <Text style={styles.appWordmark}>Kharcho</Text>
        <Pressable
          style={styles.bellButton}
          onPress={() => onNavigate('Profile')}
          hitSlop={8}>
          <Text style={styles.bellIcon}>🔔</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Balance Card (Deep Forest with 3D Coin & Leaf) ── */}
        <View style={styles.balanceCard}>
          <View style={styles.cardTopRow}>
            {/* Balance info & Month selector */}
            <View style={styles.balanceInfoCol}>
              <View style={styles.balanceLabelRow}>
                <Text style={styles.cardTitle}>Total balance</Text>
                <Text style={styles.eyeIcon}>👁️</Text>
              </View>

              {/* Month selector pill */}
              <View style={styles.monthPillRow}>
                <Pressable
                  onPress={() => setSelectedMonthOffset(prev => prev - 1)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.monthArrow}>‹</Text>
                </Pressable>
                <Text style={styles.cardMonth}>{currentMonthName}</Text>
                {selectedMonthOffset < 0 && (
                  <Pressable
                    onPress={() => setSelectedMonthOffset(prev => prev + 1)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.monthArrow}>›</Text>
                  </Pressable>
                )}
              </View>

              {/* Net Balance Amount */}
              <Text style={styles.balanceAmount}>
                {formatFullAmount(netBalance)}
              </Text>
            </View>

            {/* 3D Coin with Leaf from v1-screens.png */}
            <Image
              source={require('../../assets/card_coin_leaf_3d.png')}
              style={styles.cardCoin}
              resizeMode="contain"
            />
          </View>

          {/* Income / Expense Breakdown */}
          <View style={styles.balanceBreakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.incomeArrow}>↑</Text>
                <Text style={styles.breakdownValue}>
                  {formatFullAmount(totalIncome)}
                </Text>
              </View>
              <Text style={styles.breakdownLabel}>Income</Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.expenseArrow}>↓</Text>
                <Text style={styles.breakdownValue}>
                  {formatFullAmount(totalExpense)}
                </Text>
              </View>
              <Text style={styles.breakdownLabel}>Expenses</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <Pressable
              onPress={() => onNavigate('Transactions')}
              hitSlop={8}>
              <Text style={styles.sectionLink}>›</Text>
            </Pressable>
          </View>

          {recent.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No expenses recorded yet</Text>
              <Text style={styles.emptySub}>
                Tap the central ＋ button below to add your first expense!
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {recent.map((t, i) => (
                <View key={t.id}>
                  <TransactionRow
                    transaction={t}
                    onPress={() => onTransactionPress(t.id)}
                  />
                  {i < recent.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar with Central Hero Add Button */}
      <BottomTabBar
        active={activeTab}
        onPress={onNavigate}
        onAddPress={() => setShowAddModal(true)}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F0' },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 10,
  },
  appWordmark: {
    fontSize: 26,
    fontWeight: '800',
    color: '#163D32',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },

  // Balance Card
  balanceCard: {
    backgroundColor: '#163D32',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: spacing.xl,
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowColor: '#163D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceInfoCol: {
    flex: 1,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 13,
    color: '#FAF7F0',
    opacity: 0.75,
    fontWeight: '500',
  },
  eyeIcon: {
    fontSize: 12,
    opacity: 0.75,
  },
  monthPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  monthArrow: {
    color: '#29B879',
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  cardMonth: {
    fontSize: 12,
    color: '#29B879',
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FAF7F0',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  cardCoin: {
    width: 72,
    height: 72,
    marginTop: -4,
    marginRight: -4,
  },
  balanceBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(250, 247, 240, 0.12)',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incomeArrow: {
    fontSize: 14,
    fontWeight: '800',
    color: '#29B879',
  },
  expenseArrow: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E66A5C',
  },
  breakdownValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FAF7F0',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#FAF7F0',
    opacity: 0.65,
    marginTop: 2,
    marginLeft: 14,
  },
  cardDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(250, 247, 240, 0.15)',
    marginHorizontal: 12,
  },

  // Recent Section
  recentSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  sectionLink: {
    fontSize: 22,
    color: colors.ink,
    opacity: 0.4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.paleSage,
    marginLeft: 20 + 44 + 12,
  },
  emptyCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    elevation: 1,
  },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  emptySub: {
    fontSize: 13,
    color: colors.ink,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
