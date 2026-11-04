import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing } from '../theme';
import {
  Transaction,
  CATEGORY_ICONS,
  formatFullAmount,
} from '../data/mockData';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: Props) {
  const isCredit = transaction.direction === 'credit';
  const icon = CATEGORY_ICONS[transaction.category];
  const time = new Date(transaction.occurredAt).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      android_ripple={{ color: colors.paleSage }}>
      {/* Icon bubble */}
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={styles.meta}>
          {time} · {transaction.paymentMethod.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Amount */}
      <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
        {isCredit ? '+' : '-'}
        {formatFullAmount(transaction.amountPaise)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.ivory,
    gap: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.paleSage,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  details: {
    flex: 1,
    gap: 3,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
  meta: {
    fontSize: 12,
    color: colors.ink,
    opacity: 0.45,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  credit: {
    color: colors.emerald,
  },
  debit: {
    color: colors.mutedCoral,
  },
});
