//////////////////////////////////////////////////////////////////////
// Space "Summary" - shortened version of the space with less details
// for display in other locations, such as post details or space
// explorer.
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useCreateReloadSpace, useResolvedSpaceHandle, useSelectSpace } from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { SpaceId, SpaceWithSomeDetails } from 'src/types/subsocial'
import { Markdown, Text } from '~comps/Typography'
import { Header, Socials, Tags } from '~stories/Misc'
import { ActionMenu, FollowButton } from '../Actions'
import { summarizeMd } from '@subsocial/utils'

export type PreviewProps = Omit<DataProps, 'data' | 'state'> & {
  id: SpaceId
}
export const Preview = React.memo(({id, preview, ...props}: PreviewProps) => {
  const resolvedId = useResolvedSpaceHandle(id)
  const reloadSpace = useCreateReloadSpace()
  const data = useSelectSpace(resolvedId)
  
  useInit(() => {
    if (data) return true
    if (!reloadSpace) return false
    reloadSpace({id: resolvedId})
    return true
  }, [resolvedId], [reloadSpace])
  
  return <PreviewData {...props} titlePlaceholder={id.toString()} {...{data, preview}} />
})

type DataProps = {
  data?: SpaceWithSomeDetails
  titlePlaceholder?: string
  showFollowButton?: boolean
  showAbout?: boolean
  showSocials?: boolean
  showTags?: boolean
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
};
function PreviewData({data, titlePlaceholder, showFollowButton, showAbout, showSocials, showTags, preview = false, containerStyle}: DataProps) {
  return (
    <View style={[{width: '100%'}, containerStyle]}>
      <Head {...{titlePlaceholder, data, showFollowButton}} />
      {showAbout   && <About {...{data, preview}} />}
      {showSocials && <Socials links={data?.content?.links??[]} />}
      {showTags    && <Tags tags={data?.content?.tags??[]} accented />}
    </View>
  )
}

export type HeadProps = {
  titlePlaceholder?: string
  data?: SpaceWithSomeDetails
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
      subtitle={loading ? 'loading...' : `${data?.struct?.postsCount || 0} Posts · ${data?.struct?.followersCount || 0} Followers`}
      avatar={data?.content?.image}
      actionMenuProps={{
        primary: renderPrimaryActions,
        secondary: renderSecondaryActions
      }}
    />
  )
}

export type AboutProps = {
  data?: SpaceWithSomeDetails
  preview: boolean
}
export function About({data, preview}: AboutProps) {
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

const mdStyles = StyleSheet.create({
  paragraph: {}, // Do not delete - this tells MarkdownIt to not apply any styles!
});
