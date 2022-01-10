module.exports = function(api) {
  api.cache(false);
  return {
    presets: ['expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          'crypto': 'crypto-browserify',
          'stream': 'stream-browserify',
          '@emotion/core': '@emotion/react',
        },
      }],
      'react-native-reanimated/plugin', // must be listed last
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
