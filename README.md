# Subsocial RN Example App
Example app demonstrating how to use the Subsocial JS SDK with React Native to build custom Subsocial UI.

# Dev Notes
Notes pertaining to the development of this example app.

## Storybook
Storybook supports React Native **however** the release cycle is separate from the 3 core packages (React, Vue, Angular). See [@storybook/react-native README](https://github.com/storybookjs/react-native/blob/next-6.0/README.md) for more details.

## Node Core Shims
Metro does not provide shims for most node core modules, yet [polkadot.js](https://github.com/polkadot-js/) depends on some (such as `crypto` and `stream`). We need to provide our own. Forunately, many shims we can simply lend from [browserify](https://github.com/browserify) (including `crypto` and `stream`).

For shimming, we can use [babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver). When adjusting shims (add, modify, remove), run `yarn start --reset-cache` as Metro otherwise caches shims regardless of `babel.config.json`'s `api.cache(false)` setting. Immediately close (ctrl-c) metro. You will most likely also need to delete `node_modules` and run `yarn install` again. Strange black magic happens that installs deprecated versions of packages.
