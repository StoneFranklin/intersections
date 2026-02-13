import { useThemeScheme } from '@/contexts/theme-context';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, Linking, Image } from 'react-native';

const APP_STORE_URL = 'https://apps.apple.com/us/app/intersections-daily-trivia/id6756741688';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.stonefranklin.intersections';

export function AppDownloadModal() {
  const [visible, setVisible] = useState(false);
  const { colorScheme } = useThemeScheme();

  useEffect(() => {
    // Only show on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    // Detect if user is on mobile
    const userAgent = navigator.userAgent || navigator.vendor;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

    if (isMobile) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const handleAppStorePress = () => {
    Linking.openURL(APP_STORE_URL);
  };

  const handlePlayStorePress = () => {
    Linking.openURL(PLAY_STORE_URL);
  };

  if (!visible) {
    return null;
  }

  // Detect platform for appropriate button
  const userAgent = Platform.OS === 'web' ? (navigator.userAgent || navigator.vendor) : '';
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colorScheme.backgroundPrimary }]}>
          {/* Close button */}
          <Pressable
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={10}
          >
            <AntDesign name="close" size={24} color={colorScheme.textSecondary} />
          </Pressable>

          {/* App Logo */}
          <Image
            source={require('@/assets/images/intersections-logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={[styles.title, { color: colorScheme.textPrimary }]}>
            Get the Intersections App
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colorScheme.textSecondary }]}>
            Download our native app for the best experience, offline play, and exclusive features!
          </Text>

          {/* Store buttons */}
          <View style={styles.buttonsContainer}>
            {(isIOS || !isAndroid) && (
              <Pressable
                style={[styles.storeButton, { backgroundColor: '#000000' }]}
                onPress={handleAppStorePress}
              >
                <MaterialCommunityIcons name="apple" size={24} color="#ffffff" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonSubtext}>Download on the</Text>
                  <Text style={styles.buttonText}>App Store</Text>
                </View>
              </Pressable>
            )}

            {(isAndroid || !isIOS) && (
              <Pressable
                style={[styles.storeButton, { backgroundColor: '#000000' }]}
                onPress={handlePlayStorePress}
              >
                <MaterialCommunityIcons name="google" size={24} color="#ffffff" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonSubtext}>Get it on</Text>
                  <Text style={styles.buttonText}>Google Play</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Continue to web button */}
          <Pressable
            style={styles.continueButton}
            onPress={handleClose}
          >
            <Text style={[styles.continueText, { color: colorScheme.textSecondary }]}>
              Continue to web version
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  appLogo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  buttonTextContainer: {
    alignItems: 'flex-start',
  },
  buttonSubtext: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '400',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  continueText: {
    fontSize: 14,
    textDecoration: 'underline',
  },
});
