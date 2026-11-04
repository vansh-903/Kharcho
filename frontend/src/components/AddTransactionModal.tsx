import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, layout, typography } from '../theme';
import { Category, CATEGORY_ICONS, PaymentMethod, Transaction } from '../data/mockData';
import { useTransactions } from '../context/TransactionContext';

const QUICK_CATEGORIES: Category[] = [
  'Food & Dining',
  'Shopping',
  'Groceries',
  'Transport',
  'Bills & Utilities',
  'Entertainment',
  'Health',
  'Other',
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTransactionModal({ visible, onClose, onSuccess }: Props) {
  const { addManualTransaction } = useTransactions();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<Category>('Food & Dining');
  const [direction, setDirection] = useState<'debit' | 'credit'>('debit');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  // Motion storyboard animation: card pop and fly-in
  const popAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(popAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      popAnim.setValue(0);
      slideAnim.setValue(100);
    }
  }, [visible, popAnim, slideAnim]);

  const handleAdd = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTxn: Transaction = {
      id: `manual-${Date.now()}`,
      amountPaise: Math.round(parsedAmount * 100),
      direction,
      merchant: merchant.trim() || (direction === 'credit' ? 'Income' : 'Expense'),
      accountSuffix: 'Cash/UPI',
      paymentMethod,
      category,
      occurredAt: new Date().toISOString(),
      source: 'manual',
      confidence: 'high',
    };

    addManualTransaction(newTxn);
    setAmount('');
    setMerchant('');
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [
                { scale: popAnim },
                { translateY: slideAnim },
              ],
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Expense</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Direction toggle */}
          <View style={styles.directionToggle}>
            <Pressable
              style={[
                styles.dirBtn,
                direction === 'debit' && styles.dirBtnDebitActive,
              ]}
              onPress={() => setDirection('debit')}>
              <Text
                style={[
                  styles.dirText,
                  direction === 'debit' && styles.dirTextActive,
                ]}>
                ↓ Expense
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.dirBtn,
                direction === 'credit' && styles.dirBtnCreditActive,
              ]}
              onPress={() => setDirection('credit')}>
              <Text
                style={[
                  styles.dirText,
                  direction === 'credit' && styles.dirTextActive,
                ]}>
                ↑ Income
              </Text>
            </Pressable>
          </View>

          {/* Amount Input */}
          <View style={styles.amountBox}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(22, 61, 50, 0.25)"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* Merchant Input */}
          <TextInput
            style={styles.input}
            placeholder="Merchant name (e.g. Starbucks, Uber)"
            placeholderTextColor="rgba(23, 32, 28, 0.4)"
            value={merchant}
            onChangeText={setMerchant}
          />

          {/* Category Chips */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipsWrap}>
            {QUICK_CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}>
                <Text style={styles.chipText}>
                  {CATEGORY_ICONS[cat]} {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Add Button */}
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.9 },
            ]}
            onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add to expenses ＋</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 61, 50, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.deepForest,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.paleSage,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.deepForest,
  },
  directionToggle: {
    flexDirection: 'row',
    backgroundColor: colors.paleSage,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  dirBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  dirBtnDebitActive: {
    backgroundColor: colors.mutedCoral,
  },
  dirBtnCreditActive: {
    backgroundColor: colors.emerald,
  },
  dirText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.6,
  },
  dirTextActive: {
    color: '#FAF7F0',
    opacity: 1,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rupeeSymbol: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.deepForest,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.deepForest,
    minWidth: 100,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.paleSage,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.deepForest,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.paleSage,
  },
  categoryChipActive: {
    backgroundColor: colors.deepForest,
    borderColor: colors.deepForest,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  addButton: {
    backgroundColor: colors.deepForest,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.deepForest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: colors.ivory,
    fontSize: 16,
    fontWeight: '700',
  },
});
