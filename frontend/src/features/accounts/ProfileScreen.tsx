import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, layout } from '../../theme';
import { BottomTabBar, TabName } from '../../components/BottomTabBar';
import { AddTransactionModal } from '../../components/AddTransactionModal';
import { useTransactions } from '../../context/TransactionContext';
import { formatFullAmount } from '../../data/mockData';

interface Props {
  onNavigate: (tab: TabName) => void;
  activeTab: TabName;
}

export function ProfileScreen({ onNavigate, activeTab }: Props) {
  const {
    transactions,
    importFromSms,
    isLoading,
    clearAllTransactions,
  } = useTransactions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [listenerActive, setListenerActive] = useState(true);

  // Group transactions by account
  const accountStats: Record<string, { count: number; spend: number }> = {};
  transactions.forEach(t => {
    const key = t.accountSuffix ? `A/c ···· ${t.accountSuffix}` : 'General Account';
    if (!accountStats[key]) {
      accountStats[key] = { count: 0, spend: 0 };
    }
    accountStats[key].count += 1;
    if (t.direction === 'debit') {
      accountStats[key].spend += t.amountPaise;
    }
  });

  const handleImport = async (days: number) => {
    setShowImportModal(false);
    const count = await importFromSms(days);
    const rangeLabel = days > 0 ? `the last ${days} days` : 'all time';
    Alert.alert(
      'SMS Import Complete',
      count > 0
        ? `Successfully parsed and loaded ${count} bank transactions from ${rangeLabel}.`
        : `No new bank transaction SMS found from ${rangeLabel}. Ensure SMS permission is granted in Android Settings.`,
      [{ text: 'OK' }],
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Local Data',
      'This will erase all transactions stored locally on this phone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            clearAllTransactions();
            Alert.alert('Reset Complete', 'All local transaction data has been removed.');
          },
        },
      ],
    );
  };

  const handleNotificationToggle = () => {
    const nextState = !listenerActive;
    setListenerActive(nextState);
    Alert.alert(
      'SMS Listener',
      nextState
        ? 'Real-time SMS detection is active. New bank transactions will appear automatically.'
        : 'Background SMS tracking paused.',
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* App brand card */}
        <View style={styles.appCard}>
          <Text style={styles.appName}>Kharcho</Text>
          <Text style={styles.appTagline}>Your expenses, more clarity.</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100% On-Device · Zero Cloud Tracking</Text>
          </View>
        </View>

        {/* Settings items */}
        <View style={styles.card}>
          {/* 1. SMS Import */}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setShowImportModal(true)}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>📱</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>SMS Import</Text>
              <Text style={styles.rowSub}>Scan & parse bank messages</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          {/* 2. Discovered Bank Accounts */}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setShowAccountsModal(true)}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>🏦</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Discovered Accounts</Text>
              <Text style={styles.rowSub}>
                {Object.keys(accountStats).length} accounts detected
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          {/* 3. Real-Time SMS Listener */}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleNotificationToggle}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>🔔</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Live SMS Detection</Text>
              <Text style={styles.rowSub}>
                {listenerActive ? 'Active (Auto-parsing incoming SMS)' : 'Paused'}
              </Text>
            </View>
            <Text style={[styles.statusPill, listenerActive ? styles.pillActive : styles.pillInactive]}>
              {listenerActive ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          <View style={styles.divider} />

          {/* 4. Privacy Charter */}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setShowPrivacyModal(true)}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>🔒</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Privacy Charter</Text>
              <Text style={styles.rowSub}>How your data stays strictly offline</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          {/* 5. Clear Local Data */}
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleClearData}>
            <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.rowIconText}>🗑️</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.mutedCoral }]}>
                Clear All Data
              </Text>
              <Text style={styles.rowSub}>Erase all local transactions</Text>
            </View>
            <Text style={[styles.chevron, { color: colors.mutedCoral }]}>›</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── SMS Import Modal ── */}
      <Modal visible={showImportModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowImportModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Bank SMS</Text>
            <Text style={styles.modalDesc}>
              Kharcho reads only transaction messages locally on your device to create your expense dashboard.
            </Text>

            <View style={styles.importButtons}>
              <Pressable style={styles.importBtn} onPress={() => handleImport(30)}>
                <Text style={styles.importBtnText}>Last 30 Days</Text>
              </Pressable>
              <Pressable style={styles.importBtn} onPress={() => handleImport(90)}>
                <Text style={styles.importBtnText}>Last 90 Days</Text>
              </Pressable>
              <Pressable style={[styles.importBtn, styles.importBtnPrimary]} onPress={() => handleImport(0)}>
                <Text style={[styles.importBtnText, styles.importBtnPrimaryText]}>
                  All Time (Recommended)
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.cancelBtn} onPress={() => setShowImportModal(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ── Discovered Accounts Modal ── */}
      <Modal visible={showAccountsModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAccountsModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Discovered Accounts</Text>
            <Text style={styles.modalDesc}>
              Accounts and cards identified from your parsed transaction SMS:
            </Text>

            <ScrollView style={{ maxHeight: 250 }}>
              {Object.keys(accountStats).length === 0 ? (
                <Text style={styles.emptyAccountsText}>No accounts identified yet.</Text>
              ) : (
                Object.entries(accountStats).map(([acct, stats]) => (
                  <View key={acct} style={styles.accountRow}>
                    <View>
                      <Text style={styles.accountName}>{acct}</Text>
                      <Text style={styles.accountCount}>{stats.count} transactions</Text>
                    </View>
                    <Text style={styles.accountSpend}>{formatFullAmount(stats.spend)}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable style={styles.cancelBtn} onPress={() => setShowAccountsModal(false)}>
              <Text style={styles.cancelBtnText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ── Privacy Modal ── */}
      <Modal visible={showPrivacyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔒 100% Private & Offline</Text>
            <Text style={styles.privacyBody}>
              • All SMS processing runs 100% on this Android device.{'\n\n'}
              • No bank logins, passwords, or credentials are required.{'\n\n'}
              • No cloud servers, no analytics, no third-party tracking.{'\n\n'}
              • Raw SMS text is discarded immediately after extracting amount, date, and merchant.{'\n\n'}
              • You can erase all data anytime with the "Clear All Data" button.
            </Text>
            <Pressable
              style={[styles.importBtn, styles.importBtnPrimary, { marginTop: 16 }]}
              onPress={() => setShowPrivacyModal(false)}>
              <Text style={[styles.importBtnText, styles.importBtnPrimaryText]}>
                Understood
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Loading overlay for SMS scan */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.emerald} />
          <Text style={styles.loadingText}>Scanning SMS inbox on device...</Text>
        </View>
      )}

      {/* Bottom Bar with Central Hero Add Button */}
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
  container: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingBottom: spacing.xl },
  header: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 52,
    paddingBottom: spacing.lg,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  appCard: {
    backgroundColor: colors.deepForest,
    marginHorizontal: layout.screenGutter,
    borderRadius: layout.cardRadius,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: 6,
    elevation: 3,
  },
  appName: { fontSize: 26, fontWeight: '800', color: colors.ivory, letterSpacing: -0.5 },
  appTagline: { fontSize: 14, color: colors.ivory, opacity: 0.7 },
  badge: {
    marginTop: 6,
    backgroundColor: 'rgba(41, 184, 121, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, color: colors.emerald, fontWeight: '600' },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenGutter,
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 18,
    gap: spacing.md,
  },
  rowPressed: { backgroundColor: colors.paleSage },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconText: { fontSize: 20 },
  rowContent: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowSub: { fontSize: 12, color: colors.ink, opacity: 0.5 },
  chevron: { fontSize: 20, color: colors.ink, opacity: 0.3 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  pillActive: { backgroundColor: colors.paleSage, color: colors.emerald },
  pillInactive: { backgroundColor: '#FEE2E2', color: colors.mutedCoral },
  divider: {
    height: 1,
    backgroundColor: colors.paleSage,
    marginLeft: spacing.xl + 42 + spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: colors.ink, opacity: 0.65, lineHeight: 20, marginBottom: 18 },
  importButtons: { gap: 10, marginBottom: 14 },
  importBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
  },
  importBtnPrimary: {
    backgroundColor: colors.deepForest,
  },
  importBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  importBtnPrimaryText: {
    color: colors.ivory,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.5,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.paleSage,
  },
  accountName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  accountCount: { fontSize: 12, color: colors.ink, opacity: 0.5 },
  accountSpend: { fontSize: 15, fontWeight: '700', color: colors.mutedCoral },
  emptyAccountsText: { paddingVertical: 20, textAlign: 'center', color: colors.ink, opacity: 0.5 },
  privacyBody: { fontSize: 14, color: colors.ink, lineHeight: 22 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    gap: 12,
  },
  loadingText: { fontSize: 15, fontWeight: '600', color: colors.deepForest },
});
