const path = require('path');

module.exports = {
  dependencies: {
    // react-native-worklets lacks react-native.config.js,
    // so we register it manually for auto-linking & codegen.
    'react-native-worklets': {
      root: path.resolve(__dirname, 'node_modules/react-native-worklets'),
    },
  },
};
