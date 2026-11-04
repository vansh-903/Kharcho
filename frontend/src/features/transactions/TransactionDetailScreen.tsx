import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { colors, spacing, layout } from '../../theme';
import {
  CATEGORY_ICONS,
  formatFullAmount,
  Category,
  Transaction,
} from '../../data/mockData';
import { useTransactions } from '../../context/TransactionContext';

const { width } = Dimensions.get('window');

const ALL_CATEGORIES: Category[] = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Income',
  'Other',
];

interface Props {
  transactionId: string;
  onBack: () => void;
}

export function TransactionDetailScreen({ transactionId, onBack }: Props) {
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const txn = transactions.find(t => t.id === transactionId);

  const [selectedCategory, setSelectedCategory] = useState<Category>(
    txn?.category ?? 'Other',
  );
  const [note, setNote] = useState(txn?.note ?? '');
  const [showCategories, setShowCategories] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  if (!txn) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.ink, fontSize: 16 }}>Transaction not found</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  const isCredit = txn.direction === 'credit';

  const handleSave = () => {
    const updated: Transaction = {
      ...txn,
      category: selectedCategory,
      note: note.trim() || undefined,
    };
    updateTransaction(updated);
    Alert.alert('Saved', 'Transaction updated successfully!', [
      { text: 'OK', onPress: onBack },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete transaction',
      `Remove ${txn.merchant} from your history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(txn.id);
            onBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header from v1-screens.png: ← left, ⋮ right */}
      <View style={styles.screenHeader}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          hitSlop={14}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Pressable hitSlop={14} onPress={handleDelete}>
          <Text style={styles.menuIcon}>⋮</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 3D Hero Banner: Noodle Platter from v1-screens.png (or icon bubble) */}
        <View style={styles.heroBannerContainer}>
          <Image
            source={require('../../assets/food_dish_3d.png')}
            style={styles.heroBannerImage}
            resizeMode="contain"
          />
        </View>

        {/* Merchant & Amount Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroMerchant}>{txn.merchant}</Text>
          <Text
            style={[
              styles.heroAmount,
              isCredit ? styles.creditAmount : styles.debitAmount,
            ]}>
            {isCredit ? '+' : '-'}{formatFullAmount(txn.amountPaise)}
          </Text>
          <Text style={styles.heroDate}>
            {new Date(txn.occurredAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Detail rows Card */}
        <View style={styles.card}>
          {/* Category */}
          <Pressable
            style={styles.row}
            onPress={() => setShowCategories(!showCategories)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLeftIcon}>🔔</Text>
              <Text style={styles.rowLabel}>Category</Text>
            </View>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>
                {CATEGORY_ICONS[selectedCategory]} {selectedCategory}
              </Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </Pressable>

          {/* Category picker grid */}
          {showCategories && (
            <View style={styles.categoryGrid}>
              {ALL_CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategories(false);
                  }}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && { color: colors.ivory },
                    ]}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Date */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLeftIcon}>📅</Text>
              <Text style={styles.rowLabel}>Date</Text>
            </View>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>
                {new Date(txn.occurredAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Account */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLeftIcon}>🏦</Text>
              <Text style={styles.rowLabel}>Account</Text>
            </View>
            <Text style={styles.rowValueText}>
              ···· {txn.accountSuffix || 'Bank'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Note Input */}
          <Pressable
            style={styles.row}
            onPress={() => setIsEditingNote(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLeftIcon}>📝</Text>
              <Text style={styles.rowLabel}>Note</Text>
            </View>
            {isEditingNote ? (
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add note..."
                autoFocus
                onBlur={() => setIsEditingNote(false)}
              />
            ) : (
              <View style={styles.rowValue}>
                <Text style={[styles.rowValueText, !note && styles.placeholder]}>
                  {note || 'Add note'}
                </Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Action Buttons: Delete (pink/red pill) and Save changes (deep forest green pill) */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleDelete}>
            <Text style={styles.deleteText}>🗑 Delete</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.88 },
            ]}
            onPress={handleSave}>
            <Text style={styles.saveText}>Save changes</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#163D32', fontWeight: '700' },
  menuIcon: { fontSize: 24, color: '#163D32', fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  heroBannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  heroBannerImage: {
    width: width * 0.88,
    height: 150,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: layout.screenGutter,
  },
  heroMerchant: {
    fontSize: 24,
    fontWeight: '800',
    color: '#163D32',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  creditAmount: { color: colors.emerald },
  debitAmount: { color: colors.mutedCoral },
  heroDate: { fontSize: 13, color: colors.ink, opacity: 0.5 },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLeftIcon: {
    fontSize: 18,
  },
  rowLabel: { fontSize: 15, color: colors.ink, opacity: 0.7, fontWeight: '500' },
  rowValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValueText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  rowChevron: { fontSize: 18, color: colors.ink, opacity: 0.3 },
  placeholder: { color: colors.emerald, fontWeight: '500' },
  noteInput: {
    fontSize: 14,
    color: colors.ink,
    minWidth: 150,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: colors.emerald,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.paleSage,
    marginHorizontal: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: '#F7FBF9',
    borderTopWidth: 1,
    borderTopColor: colors.paleSage,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.paleSage,
  },
  categoryChipActive: { backgroundColor: colors.deepForest },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  deleteButton: {
    flex: 1,
    height: 54,
    borderRadius: 20,
    backgroundColor: '#FDE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { fontSize: 15, fontWeight: '700', color: colors.mutedCoral },
  saveButton: {
    flex: 2,
    height: 54,
    borderRadius: 20,
    backgroundColor: colors.deepForest,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  saveText: { fontSize: 15, fontWeight: '700', color: colors.ivory },
});
