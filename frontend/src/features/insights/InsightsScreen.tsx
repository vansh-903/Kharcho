import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Image,
} from 'react-native';
import { colors, spacing, layout } from '../../theme';
import { BottomTabBar, TabName } from '../../components/BottomTabBar';
import { AddTransactionModal } from '../../components/AddTransactionModal';
import { useTransactions } from '../../context/TransactionContext';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  formatFullAmount,
  Category,
} from '../../data/mockData';

interface Props {
  onNavigate: (tab: TabName) => void;
  activeTab: TabName;
}

type InsightTab = 'Insights' | 'Budgets';

const BUDGETS: { category: Category; budgetPaise: number }[] = [
  { category: 'Food & Dining', budgetPaise: 400000 },
  { category: 'Shopping', budgetPaise: 500000 },
  { category: 'Transport', budgetPaise: 300000 },
];

export function InsightsScreen({ onNavigate, activeTab }: Props) {
  const { transactions } = useTransactions();
  const [insightTab, setInsightTab] = useState<InsightTab>('Insights');
  const [showAddModal, setShowAddModal] = useState(false);

  // Compute spending by category dynamically from live data
  const spendingByCategory: Partial<Record<Category, number>> = {};
  transactions
    .filter(t => t.direction === 'debit')
    .forEach(t => {
      spendingByCategory[t.category] =
        (spendingByCategory[t.category] ?? 0) + t.amountPaise;
    });

  const totalSpend = Object.values(spendingByCategory).reduce(
    (s, v) => s + (v ?? 0),
    0,
  );

  const categories = (Object.entries(spendingByCategory) as [Category, number][])
    .sort((a, b) => b[1] - a[1]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header from v1-screens.png: "Kharcho" left, "This month ⌵" right */}
      <View style={styles.screenHeader}>
        <Text style={styles.appWordmark}>Kharcho</Text>
        <View style={styles.monthBadge}>
          <Text style={styles.monthText}>This month ⌵</Text>
        </View>
      </View>

      {/* Segmented Insight / Budget toggle */}
      <View style={styles.tabRow}>
        {(['Insights', 'Budgets'] as InsightTab[]).map(t => (
          <Pressable
            key={t}
            style={[styles.tabBtn, insightTab === t && styles.tabBtnActive]}
            onPress={() => setInsightTab(t)}>
            <Text style={[styles.tabBtnText, insightTab === t && styles.tabBtnTextActive]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Spending by Category Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending by category</Text>

          {totalSpend === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No expenses recorded yet.</Text>
            </View>
          ) : (
            <View style={styles.chartAndLegendRow}>
              {/* Donut Chart Visual */}
              <View style={styles.donutContainer}>
                <Image
                  source={require('../../assets/donut_chart_clean.png')}
                  style={styles.donutImage}
                  resizeMode="contain"
                />
              </View>

              {/* Legend with percentages */}
              <View style={styles.legend}>
                {categories.map(([cat, amount]) => (
                  <View key={cat} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: CATEGORY_COLORS[cat] || colors.deepForest },
                      ]}
                    />
                    <Text style={styles.legendName} numberOfLines={1}>
                      {cat}
                    </Text>
                    <Text style={styles.legendPct}>
                      {Math.round((amount / totalSpend) * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Budgets Card */}
        <View style={styles.card}>
          <View style={styles.budgetsSectionHeader}>
            <Text style={styles.cardTitle}>Budgets</Text>
            <Pressable onPress={() => {}}>
              <Text style={styles.seeAllLink}>See all</Text>
            </Pressable>
          </View>

          {BUDGETS.map(({ category, budgetPaise }) => {
            const spent = spendingByCategory[category] ?? 0;
            const pct = Math.min(spent / budgetPaise, 1);
            const isUnder = pct < 0.8;
            return (
              <View key={category} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetName}>
                    {CATEGORY_ICONS[category]} {category}
                  </Text>
                  <Text style={styles.budgetAmounts}>
                    {formatFullAmount(spent)} / {formatFullAmount(budgetPaise)}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.round(pct * 100)}%`,
                        backgroundColor: isUnder
                          ? colors.emerald
                          : colors.mutedCoral,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.budgetPct}>
                  {Math.round(pct * 100)}% used
                  {isUnder ? '  ✓ On track' : '  ⚠ Over budget'}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Bar with Central Add */}
      <BottomTabBar
        active={activeTab}
        onPress={onNavigate}
        onAddPress={() => setShowAddModal(true)}
      />

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
    paddingBottom: 12,
  },
  appWordmark: {
    fontSize: 26,
    fontWeight: '800',
    color: '#163D32',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  monthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBE6DC',
    borderRadius: 16,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#163D32',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: spacing.md,
    backgroundColor: '#E5ECE7',
    borderRadius: 16,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: '#163D32' },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: '#163D32', opacity: 0.6 },
  tabBtnTextActive: { opacity: 1, color: '#FAF7F0', fontWeight: '700' },
  content: { paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  emptyWrap: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: colors.ink, opacity: 0.5, fontSize: 14 },
  chartAndLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  donutContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutImage: {
    width: 130,
    height: 130,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { flex: 1, fontSize: 12, color: colors.ink, fontWeight: '500' },
  legendPct: { fontSize: 12, fontWeight: '700', color: colors.ink, opacity: 0.7 },
  budgetsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#29B879',
  },
  budgetItem: { marginBottom: spacing.md },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetName: { fontSize: 14, fontWeight: '600', color: colors.ink },
  budgetAmounts: { fontSize: 12, color: colors.ink, opacity: 0.55 },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5ECE7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  budgetPct: { fontSize: 11, color: colors.ink, opacity: 0.5 },
});
