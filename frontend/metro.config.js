const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const ext = platform === 'ios' ? 'ios' : 'android';
  if (
    moduleName === 'react-native-webview' ||
    moduleName === './lib/WebView'
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        `node_modules/react-native-webview/lib/WebView.${ext}.js`
      ),
      type: 'sourceFile',
    };
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
