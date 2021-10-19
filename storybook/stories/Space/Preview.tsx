//////////////////////////////////////////////////////////////////////
// Space "Summary" - shortened version of the space with less details
// for display in other locations, such as post details or space
// explorer.
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { SpaceData } from '@subsocial/types'
import { SubsocialInitializerState } from '~comps/SubsocialContext'
import { Markdown, Text } from '~comps/Typography'
import { UnifiedSpaceId, useSpace } from './util'
import { Header, Socials, Tags } from '~stories/Misc'
import { ActionMenu, FollowButton } from '../Actions'
import { summarizeMd } from '@subsocial/utils'

export type PreviewProps = Omit<DataProps, 'data' | 'state'> & {
  id: UnifiedSpaceId
}
export function Preview({id, preview, ...props}: PreviewProps) {
  const [state, data] = useSpace(id);
  return <Preview.Data {...props} titlePlaceholder={id.toString()} {...{data, state, preview}} />
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
  containerStyle?: StyleProp<ViewStyle>
};
Preview.Data = function({data, state = 'READY', titlePlaceholder, showFollowButton, showAbout, showSocials, showTags, preview = false, containerStyle}: DataProps) {
  return (
    <View style={[{width: '100%'}, containerStyle]}>
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
  
  const renderPrimaryActions = useCallback(() => {
    return <>
      {showFollowButton && (
        <ActionMenu.Primary>
          <FollowButton
            id={data?.struct?.id ?? 0}
            isFollowing={false}
            onPress={() => alert('not yet implemented, sorry!')}
            hideIcon
          />
        </ActionMenu.Primary>
      )}
    </>
  }, []);
  
  const renderSecondaryActions = useCallback(() => {
    return <>
      <ActionMenu.Secondary label="Share Space"  icon={{name: 'share-social-outline', family: 'ionicon'}} onPress={() => {}} disabled />
      <ActionMenu.Secondary label="View on IPFS" icon={{name: 'analytics-outline',    family: 'ionicon'}} onPress={() => {}} disabled />
    </>
  }, []);
  
  return (
    <Header
      title={data?.content?.name ?? titlePlaceholder}
      subtitle={loading ? 'loading...' : `${data?.struct?.posts_count || 0} Posts · ${data?.struct?.followers_count || 0} Followers`}
      avatar={data?.content?.image}
      actionMenuProps={{
        primary: renderPrimaryActions,
        secondary: renderSecondaryActions
      }}
    />
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
    return null;
  }
  if (preview) {
    const {summary, isShowMore} = summarizeMd(data!.content!.about!);
    return (
      <Text>
        {summary}
        {isShowMore && <Text style={{fontWeight: 'bold'}}>{' '}Read more</Text>}
      </Text>
    )
  }
  else {
    return <Markdown style={mdStyles}>{data!.content!.about!}</Markdown>
  }
}

const styles = StyleSheet.create({
  italic: {
    fontStyle: 'italic',
  },
});

const mdStyles = StyleSheet.create({
  paragraph: {},
});
