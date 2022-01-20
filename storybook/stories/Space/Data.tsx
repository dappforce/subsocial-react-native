import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SpaceId, SpaceWithSomeDetails } from 'src/types/subsocial'
import { useCreateReloadSpace, useResolvedSpaceHandle, useSelectSpace } from 'src/rtk/app/hooks'
import { useInit } from '~comps/hooks'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Header, Markdown, SocialLinks as Socials, Tags } from '~stories/Misc'
import { ActionMenu, ActionMenuItem, FollowSpaceButton } from '~stories/Actions'

export type DataProps = Omit<DataRawProps, 'data' | 'loading'> & {
  id: SpaceId
}
export const Data = React.memo(({ id, ...props }: DataProps) => {
  const { id: realid } = useResolvedSpaceHandle(id)
  const data = useSelectSpace(realid)
  const reloadSpace = useCreateReloadSpace()
  
  const loading = !useInit(async () => {
    if (data) return true
    
    if (!reloadSpace) return false
    
    await reloadSpace({ id })
    return true
  }, [ id ], [ reloadSpace ])
  
  return (
    <DataRaw
      data={data}
      loading={loading}
      {...props}
    />
  )
})

export type DataRawProps = {
  data?: SpaceWithSomeDetails
  loading: boolean
  titlePlaceholder?: string
  showFollowButton?: boolean
  showAbout?: boolean
  showSocials?: boolean
  showTags?: boolean
  preview?: boolean
  containerStyle?: StyleProp<ViewStyle>
  onPressSpace?: (id: SpaceId) => void
}
export const DataRaw = React.memo(({
  data,
  loading,
  titlePlaceholder,
  showFollowButton,
  showAbout,
  showSocials,
  showTags,
  preview = false,
  containerStyle,
  onPressSpace: _onPressSpace,
}: DataRawProps) =>
{
  const nav = useNavigation<ExploreStackNavigationProp | undefined>()
  const onPressSpace = useCallback(() => {
    const spaceId = data?.id
    
    if (spaceId) {
      if (_onPressSpace) {
        _onPressSpace(spaceId)
      }
      else if (preview && nav?.push) {
        nav.push('Space', { spaceId })
      }
    }
  }, [ data?.id, _onPressSpace ])
  
  const socials = data?.content?.links ?? []
  const tags    = data?.content?.tags  ?? []
  
  return (
    <View style={[ { width: '100%' }, containerStyle ]}>
      <Head {...{ titlePlaceholder, data, showFollowButton }} onPressSpace={onPressSpace} />
      
      {showAbout   && <About {...{data, preview}} onPressMore={onPressSpace} containerStyle={styles.about} />}
      {showSocials && <Socials links={socials} containerStyle={styles.socials} />}
      {showTags    && <Tags tags={tags} style={styles.tags} tagStyle={styles.tag} />}
    </View>
  )
})

export type HeadProps = {
  titlePlaceholder?: string
  data?: SpaceWithSomeDetails
  showFollowButton?: boolean
  onPressSpace?: () => void
}
export function Head({ titlePlaceholder = '', data, showFollowButton, onPressSpace }: HeadProps) {
  const id = data?.id ?? '0'
  
  const renderPrimaryActions = useCallback(() => {
    return <>
      {showFollowButton && (
        <ActionMenu.Primary>
          <FollowSpaceButton id={id} />
        </ActionMenu.Primary>
      )}
    </>
  }, [ id ])
  
  return (
    <Header
      title={data?.content?.name ?? titlePlaceholder}
      onPressTitle={onPressSpace}
      subtitle={`${data?.struct?.postsCount || 0} Posts · ${data?.struct?.followersCount || 0} Followers`}
      avatar={data?.content?.image}
      onPressAvatar={onPressSpace}
      actionMenuProps={{
        primary: renderPrimaryActions,
        secondary: ({ size }) => (
          <>
            <ActionMenuItem
              label="Share Space"
              icon={{
                family: 'subicon',
                name: 'share',
                size,
              }}
              onPress={() => alert('Sorry, not yet implemented')}
            />
            <ActionMenuItem
              label="View on IPFS"
              icon={{
                family: 'ionicon',
                name: 'analytics-outline',
                size,
              }}
              onPress={() => alert('Sorry, not yet implemented')}
            />
          </>
        )
      }}
    />
  )
}

export type AboutProps = {
  data?: SpaceWithSomeDetails
  preview: boolean
  containerStyle?: StyleProp<ViewStyle>
  onPressMore?: (id: SpaceId) => void
}
export function About({ data, preview, containerStyle, onPressMore: _onPressMore }: AboutProps) {
  const onPressMore = useCallback(() => {
    if (data?.id) {
      _onPressMore?.(data.id)
    }
  }, [ data, _onPressMore ])
  
  if (!data?.content?.about) return null
  
  return (
    <Markdown
      style={mdStyles}
      summary={preview}
      containerStyle={containerStyle}
      onPressMore={onPressMore}
    >
      {data.content.about}
    </Markdown>
  )
}

const styles = StyleSheet.create({
  about: {
    marginTop: 10,
  },
  socials: {
    marginTop: 10,
  },
  tags: {
    marginTop: 2,
  },
  tag: {
    marginTop: 8,
    marginBottom: 0,
  },
})

const mdStyles = StyleSheet.create({
  paragraph: {}, // Do not delete - this tells MarkdownIt to not apply any styles!
})
