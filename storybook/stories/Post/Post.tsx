//////////////////////////////////////////////////////////////////////
// Underlying Post from data Component
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ImageStyle } from 'react-native-fast-image'
import { PostData, PostId, ProfileId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadProfile, useCreateReloadSpace, useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Header } from '~stories/Misc'
import { ActionMenuItem, ActionMenuProps } from '~stories/Actions'
import { Markdown } from '~stories/Misc'
import { createThemedStylesHook } from '~comps/Theming'
import { Title } from '~comps/Typography'
import { IpfsBanner, IpfsImage } from '~comps/IpfsImage'
import { useInit } from '~comps/hooks'
import Age from 'src/util/Age'
import strings from 'src/util/localization'

const IMAGE_PREVIEW_HEIGHT = 160

export type PostOwnerProps = {
  postId: PostId
  postData?: PostData
  loading: boolean
  actionMenuProps?: ActionMenuProps
  style?: StyleProp<ViewStyle>
  onPressOwner?: (id: PostId, ownerId: ProfileId) => void
  onPressSpace?: (id: PostId, spaceId: SpaceId) => void
}
export const PostOwner = React.memo(({
  postId,
  postData,
  loading,
  actionMenuProps,
  style,
  onPressOwner: _onPressOwner,
  onPressSpace: _onPressSpace
}: PostOwnerProps) =>
{
  const nav = useNavigation<ExploreStackNavigationProp | undefined>()
  const reloadSpace = useCreateReloadSpace()
  const reloadOwner = useCreateReloadProfile()
  
  const spaceId = postData?.struct?.spaceId
  const ownerId = postData?.struct?.ownerId
  const spaceData = useSelectSpace(spaceId)
  const ownerData = useSelectProfile(ownerId)
  
  const onPressOwner = useCallback(() => {
    if (ownerId) {
      if (_onPressOwner) {
        _onPressOwner(postId, ownerId)
      }
      else if (nav?.push) {
        nav.push('Account', { accountId: ownerId })
      }
    }
  }, [ _onPressOwner, ownerId ])
  
  const onPressSpace = useCallback(() => {
    if (spaceId) {
      if (_onPressSpace) {
        _onPressSpace(postId, spaceId)
      }
      else if (nav?.push) {
        nav.push('Space', { spaceId })
      }
    }
  }, [ _onPressSpace, spaceId ])
  
  useInit(async () => {
    if (spaceData) return true
    
    if (!reloadSpace || !spaceId) return false
    
    await reloadSpace({ id: spaceId })
    return true
  }, [ postId ], [ spaceId ])
  
  useInit(async () => {
    if (ownerData) return true
    
    if (!reloadOwner || !ownerId) return false
    
    await reloadOwner({ id: ownerId })
    return true
  }, [ postId ], [ ownerId ])
  
  const author = loading ? strings().post.skeleton.author  : ownerData?.content?.name ?? strings().post.skeleton.unknownAuthor
  const space  = loading ? strings().post.skeleton.space   : spaceData?.content?.name ?? strings().post.skeleton.unknownSpace
  const avatar = loading ? undefined : ownerData?.content?.avatar
  const age    = loading ? strings().post.skeleton.someTimeAgo : new Age(postData?.struct?.createdAtTime ?? 0)
  
  return (
    <Header
      title={author}
      subtitle={`${space} · ${age}`}
      avatar={avatar}
      actionMenuProps={actionMenuProps}
      onPressTitle={() => onPressOwner()}
      onPressSubtitle={() => onPressSpace()}
      onPressAvatar={() => onPressOwner()}
      containerStyle={style}
    />
  )
})

export type HeadProps = {
  /** IPFS CID */
  image?: string
  title?: string
  preview?: boolean
  loading: boolean
  bannerStyle?: StyleProp<ImageStyle>
  previewBannerStyle?: StyleProp<ImageStyle>
  titleStyle?: StyleProp<TextStyle>
}
export function Head({ title, titleStyle, image, bannerStyle, previewBannerStyle, preview = false, loading }: HeadProps) {
  const styles = useThemedStyles()
  
  if (loading) {
    title = strings().post.skeleton.title
  }
  
  return (
    <View>
      <Banner cid={image} style={bannerStyle} previewStyle={previewBannerStyle} preview={preview} />
      {!!title &&
        <Title preview={preview} style={[ styles.title, titleStyle ]}>
          {title}
        </Title>
      }
    </View>
  )
}

export type BannerProps = {
  cid?: string
  preview?: boolean
  style?: StyleProp<ImageStyle>
  previewStyle?: StyleProp<ImageStyle>
}
export const Banner = React.memo(({ cid, preview, style, previewStyle }: BannerProps) => {
  const styles = useThemedStyles()
  
  if (!cid) return null
  
  if (preview) {
    return (
      <IpfsImage cid={cid} style={[styles.previewBanner, previewStyle]} />
    )
  }
  
  else {
    return (
      <IpfsBanner cid={cid} style={[styles.banner, style]} />
    )
  }
})

export type BodyProps = {
  content: string
  preview?: boolean
  loading: boolean
  previewStyle?: StyleProp<TextStyle>
  onPressMore?: () => void
}
export function Body({ content, previewStyle, onPressMore, preview = false, loading }: BodyProps) {
  return (
    <Markdown summary={preview} summaryStyle={previewStyle} onPressMore={onPressMore}>
      {loading ? strings().general.loadingContent : content}
    </Markdown>
  )
}

export type PostActionMenuProps = {
  isMyPost?: boolean
  iconSize?: number
}
export const PostActionMenu = React.memo(({ isMyPost, iconSize = 24 }: PostActionMenuProps) => {
  return <>
      <ActionMenuItem
        label={strings().post.viewReactions}
        icon={{
          family: 'ionicon',
          name: 'heart-outline',
          size: iconSize,
        }}
        onPress={() => alert(strings().general.notYetImplemented)}
      />
      <ActionMenuItem
        label={strings().general.viewOnIPFS}
        icon={{
          family: 'ionicon',
          name: 'analytics-outline',
          size: iconSize,
        }}
        onPress={() => alert(strings().general.notYetImplemented)}
      />
      {isMyPost && <>
        <ActionMenuItem
          label={strings().post.edit}
          icon={{
            family: 'ionicon',
            name: 'create',
            size: iconSize,
          }}
          onPress={() => alert(strings().general.notYetImplemented)}
        />
        <ActionMenuItem
          label={strings().post.hide}
          icon={{
            family: 'ionicon',
            name: 'trash-outline',
            size: iconSize,
          }}
          onPress={() => alert(strings().general.notYetImplemented)}
        />
      </>}
    </>
})

const useThemedStyles = createThemedStylesHook(({ colors, consts }) => StyleSheet.create({
  title: {
    marginTop: 0,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  previewBanner: {
    width: '100%',
    height: IMAGE_PREVIEW_HEIGHT,
    borderRadius: consts.roundness,
    marginBottom: consts.spacing,
  },
  banner: {
    borderRadius: consts.roundness,
    marginBottom: consts.spacing,
  },
}))
