import * as fs from 'fs';
import * as path from 'path';

import type { ExpoConfig } from 'expo/config';
import { withDangerousMod, withAndroidManifest, type ConfigPlugin } from 'expo/config-plugins';

import 'dotenv/config';

/**
 * Config Plugin: Foldable 기기(Galaxy Fold 등)에서 화면 접기/펼기 시 Activity 재생성 방지.
 * smallestScreenSize, density를 configChanges에 추가.
 */
const withFoldableConfigChanges: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application?.[0]?.activity?.find(
      (a) => a.$?.['android:name'] === '.MainActivity'
    );
    if (mainActivity) {
      const existing = mainActivity.$['android:configChanges'] ?? '';
      const required = ['smallestScreenSize', 'density'];
      const current = existing.split('|').filter(Boolean);
      const merged = [...new Set([...current, ...required])].join('|');
      mainActivity.$['android:configChanges'] = merged;
    }
    return config;
  });
};

/**
 * Custom Expo Config Plugin to enforce modular headers for Firebase dependencies.
 * This fixes the "Module 'FirebaseCore' not found" error by ensuring critical Firebase pods
 * use modular headers, allowing Swift/Obj-C interop without global useFrameworks: 'static'.
 */
const withFirebaseModularHeaders: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        return config;
      }

      let podfileContent = await fs.promises.readFile(podfilePath, 'utf-8');

      // Force modular headers for key Firebase pods
      // We inject this just before `use_react_native!` to ensure it overrides or sits alongside Expo's definitions
      const modularHeadersPatch = `
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseMessaging', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
`;

      if (!podfileContent.includes("pod 'FirebaseCore', :modular_headers => true")) {
        podfileContent = podfileContent.replace(
          /use_react_native!/g,
          `${modularHeadersPatch}\n  use_react_native!`
        );
      }

      await fs.promises.writeFile(podfilePath, podfileContent);
      return config;
    },
  ]);
};

const androidGoogleServicesFile =
  process.env.ANDROID_GOOGLE_SERVICES_JSON || './google-services.json';

const iosGoogleServicesFile = process.env.IOS_GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist';

const isDev =
  process.env.APP_VARIANT === 'development' || process.env.EAS_BUILD_PROFILE === 'development';

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
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['remote-notification'],
    },
    googleServicesFile: iosGoogleServicesFile,
    icon: './assets/ios-pointer.icon',
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
          deploymentTarget: '15.1',
        },
        android: {
          extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
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
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: 'com.googleusercontent.apps.743865706187-4aj7gacd57ucldfarm5ton9ko9tm044l',
      },
    ],
    [
      '@react-native-kakao/core',
      {
        nativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
        android: {
          authCodeHandlerActivity: true,
        },
        ios: {
          handleKakaoOpenUrl: true,
        },
      },
    ],
    ['expo-apple-authentication'],
    'expo-notifications',
    '@react-native-firebase/app',
  ],
  extra: {
    apiBaseUrl: process.env.NATIVE_API_BASE_URL,
    authRedirectUri: process.env.NATIVE_AUTH_REDIRECT_URI,
    devAccessToken: process.env.NATIVE_DEV_ACCESS_TOKEN,
    devRefreshToken: process.env.NATIVE_DEV_REFRESH_TOKEN,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    kakaoNativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
    eas: {
      projectId: '76a68921-8c65-4e50-98b0-fb5ef457ab7e',
    },
  },
  experiments: {
    reactCompiler: true,
  },
};

export default withFoldableConfigChanges(withFirebaseModularHeaders(config));
