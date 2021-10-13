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

export type SummaryProps = {
  id: AnySpaceId | string
  showSocials?: boolean
  showTags?: boolean
}
export default function Summary({id, showSocials, showTags}: SummaryProps) {
  const [state, data] = useSpace(id);
  return (
    <View style={{width: '100%'}}>
      <Head id={id} data={data} />
      <About state={state} data={data} />
      {showSocials && <Socials links={data?.content?.links??[]} />}
      {showTags    && <Tags tags={data?.content?.tags??[]} accented />}
    </View>
  )
}

export type HeadProps = {
  id: AnySpaceId | string
  data?: SpaceData
}
export function Head({id, data}: HeadProps) {
  const loading = !data;
  return (
    <Card.Title
      title={data?.content?.name ?? id}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} Posts · ${data?.struct?.followers_count || 0} Followers`}
      left={props => <IpfsAvatar {...props} cid={data?.content?.image} />}
      right={props => <Actions {...props} />}
    />
  )
}

type ActionsProps = {
  size: number
}
function Actions({size}: ActionsProps) {
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
      <Button mode="contained" style={styles.action} onPress={() => alert('not yet implemented, sorry')}>
        follow
      </Button>
    </View>
  )
}

export type AboutProps = {
  state: SubsocialInitializerState
  data?: SpaceData
}
export function About({state, data}: AboutProps) {
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
  return <Markdown>{data!.content!.about!}</Markdown>
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

