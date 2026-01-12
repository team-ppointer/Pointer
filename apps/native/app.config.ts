import type { ExpoConfig } from 'expo/config';
import 'dotenv/config';

const androidGoogleServicesFile =
  process.env.ANDROID_GOOGLE_SERVICES_JSON || './google-services.json';

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
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
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
          extraMavenRepos: [
            'https://devrepo.kakao.com/nexus/content/groups/public/'
          ]
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
    ["expo-apple-authentication"]
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

export default config;
