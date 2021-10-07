import { getStorybookUI, configure, addDecorator } from '@storybook/react-native'
import { withKnobs } from '@storybook/addon-knobs'

import './rn-addons'

// global decorators
[withKnobs].forEach(deco => addDecorator(deco));

// import stories
configure(() => {
  require('./stories');
}, module);

export default getStorybookUI({
    asyncStorage: null,
});
