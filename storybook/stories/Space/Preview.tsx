//////////////////////////////////////////////////////////////////////
// Space "Summary" - shortened version of the space with less details
// for display in other locations, such as post details or space
// explorer.
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useCreateReloadSpace, useResolvedSpaceHandle, useSelectSpace } from 'src/rtk/app/hooks'
import { useNavigation } from '@react-navigation/native'
import { useInit } from '~comps/hooks'
import { SpaceId, SpaceWithSomeDetails } from 'src/types/subsocial'
import { SuperStackNavigationProp } from '~comps/SuperStackNav'
import { Markdown, Text } from '~comps/Typography'
import { Header, SocialLinks as Socials, Tags } from '~stories/Misc'
import { ActionMenu, FollowButton } from '../Actions'
import { summarizeMd } from '@subsocial/utils'

const SUMMARY_LIMIT = 120

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
  onPressSpace?: (id: SpaceId) => void
}
export const PreviewData = React.memo(({
  data,
  titlePlaceholder,
  showFollowButton,
  showAbout,
  showSocials,
  showTags,
  preview = false,
  containerStyle,
  onPressSpace: _onPressSpace,
}: DataProps) =>
{
  const nav = useNavigation<SuperStackNavigationProp | undefined>()
  const onPressSpace = useCallback(() => {
    const spaceId = data?.struct?.id
    
    if (spaceId) {
      if (_onPressSpace) {
        _onPressSpace(data.struct.id)
      }
      else if (preview && nav?.push) {
        nav.push('Space', { spaceId })
      }
    }
  }, [ data, _onPressSpace ])
  
  return (
    <View style={[{width: '100%'}, containerStyle]}>
      <Head {...{titlePlaceholder, data, showFollowButton}} onPressTitle={onPressSpace} />
      {showAbout   && <About {...{data, preview}} onPressMore={onPressSpace} />}
      {showSocials && <Socials links={data?.content?.links??[]} />}
      {showTags    && <Tags tags={data?.content?.tags??[]} />}
    </View>
  )
})

export type HeadProps = {
  titlePlaceholder?: string
  data?: SpaceWithSomeDetails
  showFollowButton?: boolean
  onPressTitle?: () => void
}
export function Head({titlePlaceholder = '', data, showFollowButton, onPressTitle}: HeadProps) {
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
      onPressTitle={onPressTitle}
      subtitle={loading ? 'loading...' : `${data?.struct?.postsCount || 0} Posts · ${data?.struct?.followersCount || 0} Followers`}
      avatar={data?.content?.image}
      onPressAvatar={onPressTitle}
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
  onPressMore?: (id: SpaceId) => void
}
export function About({data, preview, onPressMore: _onPressMore}: AboutProps) {
  const onPressMore = useCallback(() => {
    if (data?.id) {
      _onPressMore?.(data.id)
    }
  }, [ data, _onPressMore ])
  
  if (!data?.content?.about) {
    return null;
  }
  if (preview) {
    const {summary, isShowMore} = summarizeMd(data!.content!.about!, {limit: SUMMARY_LIMIT});
    return (
      <Text onPress={onPressMore}>
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
