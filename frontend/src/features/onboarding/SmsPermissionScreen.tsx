import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, layout } from '../../theme';
import { useTransactions } from '../../context/TransactionContext';

const { width } = Dimensions.get('window');

const TRUST_POINTS = [
  { icon: '🛡️', title: 'Private', subtitle: 'on device' },
  { icon: '📵', title: 'No data', subtitle: 'leaves your phone' },
  { icon: '👁️', title: 'Read', subtitle: 'only SMS' },
];

interface Props {
  onAllow: () => void;
  onSkip: () => void;
}

export function SmsPermissionScreen({ onAllow, onSkip }: Props) {
  const { importFromSms, isLoading } = useTransactions();
  const [importing, setImporting] = useState(false);

  const handleStartImport = async () => {
    setImporting(true);
    try {
      await importFromSms(0); // Full scan to ensure all bank SMS are parsed
      onAllow();
    } catch {
      onAllow();
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>Kharcho</Text>
        <Text style={styles.title}>Import from your SMS</Text>
        <Text style={styles.subtitle}>
          Automatically find and import{'\n'}transaction messages from the last 30 days.
        </Text>
      </View>

      {/* 3D Illustration: Phone with Padlock & Floating Expense Badges (from v1-screens.png) */}
      <View style={styles.illustrationSection}>
        <Image
          source={require('../../assets/sms_illustration_3d.png')}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Area: Trust Badges, Buttons */}
      <View style={styles.bottomSection}>
        {/* 3 Trust Columns */}
        <View style={styles.trustRow}>
          {TRUST_POINTS.map((pt, i) => (
            <View key={i} style={styles.trustItem}>
              <Text style={styles.trustIcon}>{pt.icon}</Text>
              <Text style={styles.trustTitle}>{pt.title}</Text>
              <Text style={styles.trustSubtitle}>{pt.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Allow & Import CTA */}
        <Pressable
          disabled={importing || isLoading}
          style={({ pressed }) => [
            styles.allowButton,
            pressed && styles.allowButtonPressed,
          ]}
          onPress={handleStartImport}>
          {importing || isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.ivory} size="small" />
              <Text style={styles.allowButtonText}>Scanning messages...</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.allowButtonText}>Allow and import</Text>
              <Text style={styles.btnArrow}>›</Text>
            </View>
          )}
        </Pressable>

        {/* Skip button */}
        <Pressable onPress={onSkip} hitSlop={12} style={styles.skipBtn}>
          <Text style={styles.skipText}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '800',
    color: '#163D32',
    fontFamily: 'serif',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#163D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#163D32',
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  illustrationSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  illustrationImage: {
    width: width * 0.82,
    height: width * 0.62,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 18,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#163D32',
  },
  trustSubtitle: {
    fontSize: 11,
    color: '#163D32',
    opacity: 0.6,
  },
  allowButton: {
    backgroundColor: '#163D32',
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#163D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  allowButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allowButtonText: {
    color: '#FAF7F0',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnArrow: {
    color: '#FAF7F0',
    fontSize: 22,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skipBtn: {
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: '#163D32',
    opacity: 0.6,
    fontWeight: '600',
  },
});
