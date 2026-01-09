import type { ExpoConfig } from 'expo/config';
import 'dotenv/config';

const iosGoogleServicesFile = process.env.IOS_GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist';

const androidGoogleServicesFile =
  process.env.ANDROID_GOOGLE_SERVICES_JSON || './google-services.json';

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
    googleServicesFile: iosGoogleServicesFile,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.math_pointer.pointer',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    googleServicesFile: androidGoogleServicesFile,
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        ios: {
          useModularHeaders: true,
        },
      },
    ],
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
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
  ],
  extra: {
    apiBaseUrl: process.env.NATIVE_API_BASE_URL,
    authRedirectUri: process.env.NATIVE_AUTH_REDIRECT_URI,
    devAccessToken: process.env.NATIVE_DEV_ACCESS_TOKEN,
    devRefreshToken: process.env.NATIVE_DEV_REFRESH_TOKEN,
    eas: {
      projectId: '76a68921-8c65-4e50-98b0-fb5ef457ab7e',
    },
  },
  experiments: {
    reactCompiler: true,
  },
};

export default config;
