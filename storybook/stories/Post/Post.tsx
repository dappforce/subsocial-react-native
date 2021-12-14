//////////////////////////////////////////////////////////////////////
// Underlying Post from data Component
import React, { useCallback } from 'react'
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ImageStyle } from 'react-native-fast-image'
import { PostData, PostId, ProfileId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadProfile, useCreateReloadSpace, useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Header } from '~stories/Misc'
import { ActionMenuProps } from '~stories/Actions'
import { Markdown } from '~stories/Misc'
import { Title } from '~comps/Typography'
import { IpfsBanner, IpfsImage } from '~comps/IpfsImage'
import { useInit } from '~comps/hooks'
import Age from 'src/util/Age'

const IMAGE_PREVIEW_HEIGHT = 160

export type PostOwnerProps = {
  postId: PostId
  postData?: PostData
  actionMenuProps?: ActionMenuProps
  onPressOwner?: (id: PostId, ownerId: ProfileId) => void
  onPressSpace?: (id: PostId, spaceId: SpaceId) => void
}
export const PostOwner = React.memo(({
  postId,
  postData,
  actionMenuProps,
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
  const age = new Age(postData?.struct?.createdAtTime ?? 0)
  
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
  
  return (
    <Header
      title={ownerData?.content?.name??''}
      subtitle={`${spaceData?.content?.name??'some space'} · ${age}`}
      avatar={ownerData?.content?.avatar}
      actionMenuProps={actionMenuProps}
      onPressTitle={() => onPressOwner()}
      onPressSubtitle={() => onPressSpace()}
      onPressAvatar={() => onPressOwner()}
    />
  )
})

export type HeadProps = {
  /** IPFS CID */
  image?: string
  title?: string
  preview?: boolean
  bannerStyle?: StyleProp<ImageStyle>
  previewBannerStyle?: StyleProp<ImageStyle>
  titleStyle?: StyleProp<TextStyle>
}
export function Head({ title, titleStyle, image, bannerStyle, previewBannerStyle, preview = false }: HeadProps) {
  return (
    <View>
      <Banner cid={image} style={bannerStyle} previewStyle={previewBannerStyle} preview={preview} />
      {!!title && <Title preview={preview} style={[ styles.title, titleStyle ]}>
        {title}
      </Title>}
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
  previewStyle?: StyleProp<TextStyle>
  onPressMore?: () => void
}
export function Body({ content, previewStyle, onPressMore, preview = false }: BodyProps) {
  return (
    <Markdown summary={preview} summaryStyle={previewStyle} onPressMore={onPressMore}>{content}</Markdown>
  )
}

const styles = StyleSheet.create({
  title: {
    marginTop: 0,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  previewBanner: {
    width: '100%',
    height: IMAGE_PREVIEW_HEIGHT,
    borderRadius: 10,
    marginBottom: 10,
  },
  banner: {
    borderRadius: 10,
    marginBottom: 10,
  },
});
