import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: Props) {
  // Motion values
  const screenScale = useRef(new Animated.Value(0.94)).current;
  const screenFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 600ms entrance settle matching motion storyboard Panel 1
    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(screenScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlide, {
        toValue: 0,
        duration: 500,
        delay: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [screenScale, screenFade, buttonSlide, buttonFade]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Whole screen tap or button tap moves to next screen */}
      <Pressable style={styles.fullTouchArea} onPress={onGetStarted}>
        {/* The Exact PNG Storyboard Artwork */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: screenFade,
              transform: [{ scale: screenScale }],
            },
          ]}>
          <Image
            source={require('../../assets/landing_storyboard_hires.png')}
            style={styles.landingImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Bottom Interactive CTA & Privacy Badges overlaid over wave */}
        <Animated.View
          style={[
            styles.bottomControls,
            {
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            },
          ]}>
          {/* Primary Get Started Button */}
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={onGetStarted}>
            <Text style={styles.ctaText}>Get started →</Text>
          </Pressable>

          {/* Privacy Trust Badge */}
          <View style={styles.privacyRow}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.privacyText}>Your data stays on your device</Text>
          </View>

          {/* Page Indicator Dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5EE',
  },
  fullTouchArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  landingImage: {
    width: '100%',
    height: '100%',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#163D32',
    width: '100%',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(232, 166, 58, 0.45)', // Saffron accent edge
    marginBottom: 14,
  },
  ctaButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: '#FAF7F0',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  lockIcon: {
    fontSize: 12,
  },
  privacyText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    backgroundColor: '#29B879',
    width: 18,
    borderRadius: 4,
  },
});
