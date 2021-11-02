import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { boolean, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { ActionMenu, FollowButton, Panel } from './index'
import CenterView from '~stories/CenterView'

storiesOf('Actions', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Follow Button', () => (
    <FollowButton
      id={number('id', 1)}
      isFollowing={boolean('Following', false)}
      loading={boolean('Loading', false)}
      onPress={action('press')}
      showIcon={boolean('Show Icon', false)}
    />
  ))
  .add('Action Menu', () => {
    const renderPrimary = () => <>
      <ActionMenu.Primary>
        <FollowButton id={1} isFollowing={boolean('Following', false)} onPress={action('follow')} />
      </ActionMenu.Primary>
    </>;
    const renderSecondary = () => <>
      <ActionMenu.Secondary label="Undo"  onPress={action('undo')} icon={{name: "arrow-undo-outline", family: "ionicon"}} />
      <ActionMenu.Secondary label="Redo"  onPress={action('redo')} icon={{name: "arrow-redo-outline", family: "ionicon"}} />
      <ActionMenu.Secondary label="Dummy" onPress={action('dummy')} />
    </>;
    return <ActionMenu primary={renderPrimary} secondary={renderSecondary} />
  })
  .add('Action Panel', () => (
    <CenterView>
      <Panel style={{width: '100%'}}>
        <Panel.LikeItem
          liked={boolean('Liked', false)}
          likesCount={number('Likes Count', 0)}
          onPress={action('pressLike')}
        />
        {boolean('Show Reply Item', true) && <Panel.ReplyItem
          replyCount={number('Reply Count', 0)}
          onPress={action('pressReply')}
        />}
        <Panel.ShareItem
          onPress={action('pressShare')}
        />
      </Panel>
    </CenterView>
  ))
