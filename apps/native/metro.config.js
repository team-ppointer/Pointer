const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [/ios\/build\/.*/, /android\/build\/.*/, /dist\/.*/];

config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: './src/app/providers/global.css' });
