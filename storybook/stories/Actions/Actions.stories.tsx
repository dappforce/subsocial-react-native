import React, { useState } from 'react'
import { storiesOf } from '@storybook/react-native'
import { boolean, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { ActionMenu, Panel } from './index'
import { LoginPrompt } from './LoginPrompt'
import { LogoutButton } from './LogoutButton'
import { Button } from '~comps/Typography'
import CenterView from '~stories/CenterView'
import { FollowButtonBase } from './FollowButton'

storiesOf('Actions', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Follow Button', () => (
    <CenterView>
      <FollowButtonBase
        isFollowing={boolean('Is Following', false)}
        showIcon={boolean('Show Icon', true)}
        onPress={action('onPress')}
      />
    </CenterView>
  ))
  .add('Action Menu', () => {
    const renderPrimary = () => <>
      <ActionMenu.Primary>
        <FollowButtonBase
          isFollowing={boolean('isFollowing', false)}
          onPress={action('Press Follow')}
        />
      </ActionMenu.Primary>
    </>;
    const renderSecondary = () => <>
      <ActionMenu.Secondary label="Undo"  onPress={action('undo')} icon={{name: "arrow-undo-outline", family: "ionicon"}} />
      <ActionMenu.Secondary label="Redo"  onPress={action('redo')} icon={{name: "arrow-redo-outline", family: "ionicon"}} />
      <ActionMenu.Secondary label="Dummy" onPress={action('dummy')} />
    </>;
    return <SubsocialProvider><ActionMenu primary={renderPrimary} secondary={renderSecondary} /></SubsocialProvider>
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
  .add('Login', () => (
    <CenterView style={{display: 'flex', flexDirection: 'column'}}>
      <ModalWrapper label="Login">
        {(visible, setVisible) => (
          <LoginPrompt visible={visible} onClose={() => setVisible(false)} />
        )}
      </ModalWrapper>
      <LogoutButton />
    </CenterView>
  ))


// need dedicated component for hooks
type ModalWrapperProps = {
  children: (visible: boolean, setVisible: (v: boolean) => void) => React.ReactElement
  label?: string
}
function ModalWrapper({ children, label = 'Show Prompt' }: ModalWrapperProps) {
  const [ visible, setVisible ] = useState(false)
  
  return <>
    <Button mode="contained" onPress={() => setVisible(true)} style={{marginBottom: 4}}>{label}</Button>
    {children(visible, setVisible)}
  </>
}
