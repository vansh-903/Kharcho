import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, layout, spacing } from '../theme';

export type TabName = 'Home' | 'Transactions' | 'Add' | 'Insights' | 'Profile';

interface Props {
  active: TabName;
  onPress: (tab: TabName) => void;
  onAddPress: () => void;
}

export function BottomTabBar({ active, onPress, onAddPress }: Props) {
  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <Pressable
        style={styles.tab}
        onPress={() => onPress('Home')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.tabIcon, active === 'Home' && styles.tabIconActive]}>
          🏠
        </Text>
        <Text style={[styles.tabLabel, active === 'Home' && styles.tabLabelActive]}>
          Home
        </Text>
      </Pressable>

      {/* Transactions Tab */}
      <Pressable
        style={styles.tab}
        onPress={() => onPress('Transactions')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.tabIcon, active === 'Transactions' && styles.tabIconActive]}>
          ≡
        </Text>
        <Text style={[styles.tabLabel, active === 'Transactions' && styles.tabLabelActive]}>
          Transactions
        </Text>
      </Pressable>

      {/* Central Hero Add Button */}
      <View style={styles.addWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.addCircle,
            pressed && { transform: [{ scale: 0.94 }], opacity: 0.9 },
          ]}
          onPress={onAddPress}>
          <Text style={styles.addPlus}>＋</Text>
        </Pressable>
      </View>

      {/* Insights Tab */}
      <Pressable
        style={styles.tab}
        onPress={() => onPress('Insights')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.tabIcon, active === 'Insights' && styles.tabIconActive]}>
          📊
        </Text>
        <Text style={[styles.tabLabel, active === 'Insights' && styles.tabLabelActive]}>
          Insights
        </Text>
      </Pressable>

      {/* Profile/Settings Tab */}
      <Pressable
        style={styles.tab}
        onPress={() => onPress('Profile')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.tabIcon, active === 'Profile' && styles.tabIconActive]}>
          ⚙️
        </Text>
        <Text style={[styles.tabLabel, active === 'Profile' && styles.tabLabelActive]}>
          Settings
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 61, 50, 0.08)',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.ink,
    opacity: 0.45,
  },
  tabLabelActive: {
    color: colors.deepForest,
    fontWeight: '700',
    opacity: 1,
  },
  addWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  addCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.deepForest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.deepForest,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.ivory,
  },
  addPlus: {
    fontSize: 28,
    color: colors.ivory,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
});
