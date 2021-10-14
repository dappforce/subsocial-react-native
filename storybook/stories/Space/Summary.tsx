//////////////////////////////////////////////////////////////////////
// Space "Summary" - shortened version of the space with less details
// for display in other locations, such as post details or space
// explorer.
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { Card, Menu, Text } from 'react-native-paper'
import { AnySpaceId, SpaceData } from '@subsocial/types'
import { SubsocialInitializerState } from '~comps/SubsocialContext'
import { useTheme } from '~comps/Theming'
import { Button, Markdown } from '~comps/Typography'
import { IpfsAvatar } from '~comps/IpfsImage'
import { useSpace } from './util'
import { Socials, Tags } from '~stories/Misc'
import { SpaceId } from './util'
import Preview from '~src/components/Preview'

export type SummaryProps = Omit<DataProps, 'data' | 'state'> & {
  id: SpaceId
}
export default function Summary({id, preview, ...props}: SummaryProps) {
  const [state, data] = useSpace(id);
  return <Summary.Data {...props} titlePlaceholder={id.toString()} {...{data, state, preview}} />
}

type DataProps = {
  data?: SpaceData
  state?: SubsocialInitializerState
  titlePlaceholder?: string
  showFollowButton?: boolean
  showAbout?: boolean
  showSocials?: boolean
  showTags?: boolean
  preview?: boolean
};
Summary.Data = function({data, state = 'READY', titlePlaceholder, showFollowButton, showAbout, showSocials, showTags, preview = false}: DataProps) {
  return (
    <View style={{width: '100%'}}>
      <Head {...{titlePlaceholder, data, showFollowButton}} />
      {showAbout   && <About {...{state, data, preview}} />}
      {showSocials && <Socials links={data?.content?.links??[]} />}
      {showTags    && <Tags tags={data?.content?.tags??[]} accented />}
    </View>
  )
}

export type HeadProps = {
  titlePlaceholder?: string
  data?: SpaceData
  showFollowButton?: boolean
}
export function Head({titlePlaceholder = '', data, showFollowButton}: HeadProps) {
  const loading = !data;
  return (
    <Card.Title
      title={data?.content?.name ?? titlePlaceholder}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} Posts · ${data?.struct?.followers_count || 0} Followers`}
      left={props => <IpfsAvatar {...props} cid={data?.content?.image} />}
      right={props => <Actions showFollowButton={!!showFollowButton} {...props} />}
    />
  )
}

type ActionsProps = {
  size: number
  showFollowButton: boolean
}
function Actions({size, showFollowButton}: ActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const theme = useTheme();
  
  return (
    <View style={styles.actions}>
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={<Icon name="more-horizontal" type="feather" color={theme.colors.textSecondary} size={size} onPress={() => setShowMenu(true)} style={styles.action} />}
      >
        <Menu.Item icon="share" title="share" onPress={() => alert('not yet implemented, sorry')} />
      </Menu>
      {showFollowButton && <Button mode="contained" style={styles.action} onPress={() => alert('not yet implemented, sorry')}>
        follow
      </Button>}
    </View>
  )
}

export type AboutProps = {
  state: SubsocialInitializerState
  data?: SpaceData
  preview: boolean
}
export function About({state, data, preview}: AboutProps) {
  const isLoading = state === 'PENDING' || state === 'LOADING'
  const isError   = state === 'ERROR'
  
  if (isLoading) {
    return <Text style={styles.italic}>loading ...</Text>
  }
  if (isError) {
    return <Text style={styles.italic}>An error occurred while loading Space's About.</Text>
  }
  if (!data?.content?.about) {
    return <Text style={styles.italic}>no about info specified</Text>
  }
  if (preview) {
    return <Preview height={100}><Markdown>{data!.content!.about!}</Markdown></Preview>
  }
  else {
    return <Markdown>{data!.content!.about!}</Markdown>
  }
}

const styles = StyleSheet.create({
  italic: {
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    marginHorizontal: 5,
  },
});

