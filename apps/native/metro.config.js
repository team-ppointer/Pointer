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

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/app/providers/global.css' });
