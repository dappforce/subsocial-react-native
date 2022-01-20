# Subsocial RN Example App
Example app demonstrating how to use the Subsocial JS SDK with React Native to build custom Subsocial UI.

# Dev Notes
Notes pertaining to the development of this example app.

## Running Dev Build
Run a dev build on an emulator or physical device, run `expo run:android` or `expo run:ios` respectively.

- Running on an android emulator requires Android Studio and a preinstalled emulator.
- Running on an iOS emulator/simulator requires XCode.

## Storybook
Storybook supports React Native **however** the release cycle is separate from the 3 core packages (React, Vue, Angular). See [@storybook/react-native README](https://github.com/storybookjs/react-native/blob/next-6.0/README.md) for more details.

## Node Core Shims
Metro does not provide shims for most node core modules, yet [polkadot.js](https://github.com/polkadot-js/) depends on some (such as `crypto` and `stream`). We need to provide our own. Forunately, many shims we can simply lend from [browserify](https://github.com/browserify) (including `crypto` and `stream`).

For shimming, we can use [babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver). When adjusting shims (add, modify, remove), run `yarn start --reset-cache` as Metro otherwise caches shims regardless of `babel.config.json`'s `api.cache(false)` setting. Immediately close (ctrl-c) metro and rerun with `expo run:android`.
