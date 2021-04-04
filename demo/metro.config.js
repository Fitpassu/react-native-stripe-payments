const { resolve, join } = require('path');

const rootDir = resolve(__dirname, '..');

module.exports = {
  projectRoot: __dirname,
  resolver: {
    blockList: [
      new RegExp(`^${escape(resolve(rootDir, 'example/ios'))}\\/.*$`),
    ],
    extraNodeModules: {
      'react-native-stripe-payments': '../'
    }
  },
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  watchFolders: [rootDir]
};
