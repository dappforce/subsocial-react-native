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
        },
      }],
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
