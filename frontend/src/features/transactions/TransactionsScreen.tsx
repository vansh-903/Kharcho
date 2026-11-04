import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  StatusBar,
} from 'react-native';
import { colors, spacing, layout } from '../../theme';
import { TransactionRow } from '../../components/TransactionRow';
import { BottomTabBar, TabName } from '../../components/BottomTabBar';
import { AddTransactionModal } from '../../components/AddTransactionModal';
import { useTransactions } from '../../context/TransactionContext';
import { groupByDate } from '../../data/mockData';

type Filter = 'All' | 'Income' | 'Expenses' | 'Bills';

const FILTERS: Filter[] = ['All', 'Income', 'Expenses', 'Bills'];

interface Props {
  onNavigate: (tab: TabName) => void;
  onTransactionPress: (id: string) => void;
  activeTab: TabName;
}

export function TransactionsScreen({ onNavigate, onTransactionPress, activeTab }: Props) {
  const { transactions } = useTransactions();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = transactions.filter(t => {
    if (activeFilter === 'Income') return t.direction === 'credit';
    if (activeFilter === 'Expenses') return t.direction === 'debit';
    if (activeFilter === 'Bills') return t.category === 'Bills & Utilities';
    return true;
  });

  const sections = groupByDate(filtered);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header from v1-screens.png: "Kharcho" left, 🔍 and ⋮ right */}
      <View style={styles.screenHeader}>
        <Text style={styles.appWordmark}>Kharcho</Text>
        <View style={styles.headerIconsRow}>
          <Pressable style={styles.iconBtn} hitSlop={8}>
            <Text style={styles.headerIcon}>🔍</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} hitSlop={8}>
            <Text style={styles.headerIcon}>⋮</Text>
          </Pressable>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}>
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptySub}>Add an expense or import from SMS</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View style={styles.cardWrapper}>
              <TransactionRow
                transaction={item}
                onPress={() => onTransactionPress(item.id)}
              />
              {index < section.data.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Bottom Bar with Central Add */}
      <BottomTabBar
        active={activeTab}
        onPress={onNavigate}
        onAddPress={() => setShowAddModal(true)}
      />

      {/* Add Modal */}
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
    paddingBottom: 6,
  },
  appWordmark: {
    fontSize: 26,
    fontWeight: '800',
    color: '#163D32',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  headerIcon: {
    fontSize: 18,
    color: '#163D32',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#EBE6DC',
  },
  chipActive: {
    backgroundColor: '#163D32',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#163D32',
  },
  chipTextActive: {
    color: '#FAF7F0',
  },
  sectionHeader: {
    paddingHorizontal: 22,
    paddingTop: spacing.md,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#163D32',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardWrapper: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 2,
    elevation: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.paleSage,
    marginLeft: 20 + 44 + 12,
  },
  listContent: { paddingBottom: spacing.xl },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  emptySub: { fontSize: 13, color: colors.ink, opacity: 0.5 },
});
