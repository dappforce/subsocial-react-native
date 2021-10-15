import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { boolean, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { ActionMenu, FollowButton } from './index'
import CenterView from '~stories/CenterView'

storiesOf('Actions', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Follow Button', () => (
    <FollowButton
      id={number('id', 1)}
      isFollowing={boolean('Following', false)}
      loading={boolean('Loading', false)}
      onPress={action('press')}
      hideIcon={boolean('Hide Icon', false)}
    />
  ))
  .add('Action Menu', () => {
    const renderPrimary = () => <>
      <ActionMenu.Primary>
        <FollowButton id={1} isFollowing={boolean('Following', false)} onPress={action('follow')} hideIcon />
      </ActionMenu.Primary>
    </>;
    const renderSecondary = () => <>
      <ActionMenu.Secondary label="Undo"  onPress={action('undo')} icon={{name: "arrow-undo-outline", family: "ionicon"}} />
      <ActionMenu.Secondary label="Redo"  onPress={action('redo')} icon={{name: "arrow-redo-outline", family: "ionicon"}} />
      <ActionMenu.Secondary label="Dummy" onPress={action('dummy')} />
    </>;
    return <ActionMenu primary={renderPrimary} secondary={renderSecondary} />
  })
