import type { ExpoConfig } from 'expo/config';
import 'dotenv/config';

const config: ExpoConfig = {
  name: 'Pointer',
  slug: 'pointer',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pointer',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.math-pointer.pointer',
    supportsTablet: true,
  },
  android: {
    package: 'com.math-pointer.pointer',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.NATIVE_API_BASE_URL,
    authRedirectUri: process.env.NATIVE_AUTH_REDIRECT_URI,
  },
  experiments: {
    reactCompiler: true,
  },
};

export default config;
