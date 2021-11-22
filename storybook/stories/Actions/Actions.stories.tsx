import React, { useState } from 'react'
import { storiesOf } from '@storybook/react-native'
import { boolean, number, text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { SubsocialProvider } from '~comps/SubsocialContext'
import { ActionMenu, FollowAccountButton, FollowSpaceButton, Panel } from './index'
import { LoginPrompt } from './LoginPrompt'
import { LogoutButton } from './LogoutButton'
import { Button } from '~comps/Typography'
import CenterView from '~stories/CenterView'

storiesOf('Actions', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Follow Account Button', () => (
    <SubsocialProvider>
      <FollowAccountButton
        id={text('Address', '3tiKakuy6RaHWThsHts23De8XwpaNdvw8PwwXcJqeVSN6w8w')}
        showIcon={boolean('Show Icon', false)}
      />
      <LogoutButton />
    </SubsocialProvider>
  ))
  .add('Follow Space Button', () => (
    <SubsocialProvider>
      <FollowSpaceButton
        id={text('ID', '1')}
        showIcon={boolean('Show Icon', false)}
      />
      <LogoutButton />
    </SubsocialProvider>
  ))
  .add('Action Menu', () => {
    const renderPrimary = () => <>
      <ActionMenu.Primary>
        <FollowAccountButton
          id={text('Follow Address', '3tiKakuy6RaHWThsHts23De8XwpaNdvw8PwwXcJqeVSN6w8w')}
          onFollow={action('follow')}
          onUnfollow={action('unfollow')}
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
