const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 모노레포 루트를 watchFolders에 추가
config.watchFolders = [monorepoRoot];

// 모노레포 루트의 node_modules도 검색 경로에 추가
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force a single copy of React/RN so workspace packages (e.g. @repo/pointer-content-renderer)
// resolve the same instance as the app. Prevents "Invalid hook call" in monorepo.
const DEDUPE_MODULES = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-webview': path.resolve(projectRoot, 'node_modules/react-native-webview'),
};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  ...DEDUPE_MODULES,
};

// WebView 용 HTML을 asset으로 다루기 위해 등록
config.resolver.assetExts = [...config.resolver.assetExts, 'html'];

// blockList에서 /dist\/.*/ 제거!
// node_modules 안의 dist 폴더는 필요하므로, 프로젝트의 dist만 차단
config.resolver.blockList = [
  /ios\/build\/.*/,
  /android\/build\/.*/,
  /apps\/native\/dist\/.*/, // 프로젝트 자체의 dist만 차단
];

// react-native-css-interop의 jsx-runtime을 직접 resolve
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-css-interop/jsx-runtime') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('react-native-css-interop/dist/runtime/jsx-runtime.js'),
    };
  }
  if (moduleName === 'react-native-css-interop/jsx-dev-runtime') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('react-native-css-interop/dist/runtime/jsx-dev-runtime.js'),
    };
  }

  // Force-dedupe React/RN regardless of which workspace package requests them.
  // Prevents multiple React instances when packages resolve from different
  // node_modules roots (monorepo + pnpm symlinks).
  if (DEDUPE_MODULES[moduleName]) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'package.json') },
      moduleName,
      platform
    );
  }
  // Handle sub-path imports like 'react/jsx-runtime' by redirecting the base.
  for (const baseName of Object.keys(DEDUPE_MODULES)) {
    if (moduleName.startsWith(`${baseName}/`)) {
      return context.resolveRequest(
        { ...context, originModulePath: path.join(projectRoot, 'package.json') },
        moduleName,
        platform
      );
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/app/providers/global.css' });
