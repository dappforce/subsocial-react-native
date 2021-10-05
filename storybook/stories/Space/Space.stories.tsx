import React from 'react';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { Text } from 'react-native';
import Space from '.';
import CenterView from '../CenterView';

storiesOf('Space', module)
  .addDecorator((getStory) => <CenterView>{getStory()}</CenterView>)
  .add('space overview', () => {
    return <></>
  })
