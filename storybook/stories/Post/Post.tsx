//////////////////////////////////////////////////////////////////////
// Underlying Post from data Component
import React, { useCallback, useEffect } from 'react'
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ImageStyle } from 'react-native-fast-image'
import { PostData, PostId, ProfileId, SpaceId } from 'src/types/subsocial'
import { useCreateReloadProfile, useCreateReloadSpace, useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Header } from '~stories/Misc'
import { ActionMenuProps } from '~stories/Actions'
import { Link, Markdown, Text, Title } from '~comps/Typography'
import { IpfsBanner, IpfsImage } from '~comps/IpfsImage'
import { summarizeMd } from '@subsocial/utils'
import { Age } from 'src/util'

const SUMMARY_LIMIT = 120
const IMAGE_PREVIEW_HEIGHT = 160

export class PostNotFoundError extends Error {
  constructor(postId: number) {
    super(`Subsocial Post ${postId} not found`);
  }
}

export type PostOwnerProps = {
  postId: PostId
  postData?: PostData
  actionMenuProps?: ActionMenuProps
  onPressOwner?: (id: PostId, ownerId: ProfileId) => void
  onPressSpace?: (id: PostId, spaceId: SpaceId) => void
}
export const PostOwner = React.memo(({postId, postData, actionMenuProps, onPressOwner: _onPressOwner, onPressSpace: _onPressSpace}: PostOwnerProps) => {
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
  
  useEffect(() => {
    if (!spaceData && reloadSpace && spaceId) reloadSpace({id: spaceId})
    if (!ownerData && reloadOwner && ownerId) reloadOwner({id: ownerId})
  }, [postData, spaceData, reloadSpace, ownerData, reloadOwner])
  
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
  imageStyle?: StyleProp<ImageStyle>
  previewImageStyle?: StyleProp<ImageStyle>
  titleStyle?: StyleProp<TextStyle>
}
export function Head({title, titleStyle, image, imageStyle, previewImageStyle, preview = false}: HeadProps) {
  return (
    <View>
      {preview
      ? <IpfsImage cid={image} style={[styles.previewBanner, previewImageStyle]} />
      : <IpfsBanner cid={image} style={[styles.banner, imageStyle]} />
      }
      {!!title && <Title preview={preview} style={[styles.title, titleStyle]}>{title}</Title>}
    </View>
  )
}

export type BodyProps = {
  content: string
  preview?: boolean
  previewStyle?: StyleProp<TextStyle>
}
export function Body({content, previewStyle, preview = false}: BodyProps) {
  if (preview) {
    const {summary, isShowMore} = summarizeAndStrip(content, {limit: SUMMARY_LIMIT})
    
    return (
      <Text style={previewStyle}>
        {summary}
        {isShowMore && <Link style={{fontWeight: 'bold'}}> Read more</Link>}
      </Text>
    )
  }
  else {
    return <Markdown>{content}</Markdown>
  }
}

function summarizeAndStrip(content: string, opts?: {limit: number}): {summary: string, isShowMore: boolean} {
  let {summary, isShowMore} = summarizeMd(content, opts)
  
  if (summary)
    summary = summary.replace(/(\n\r|\r\n|\n|\r)+/g, ' ')
  
  return {
    summary,
    isShowMore,
  }
}

const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  previewBanner: {
    width: '100%',
    height: IMAGE_PREVIEW_HEIGHT,
    borderRadius: 10,
  },
  banner: {
    borderRadius: 10,
  },
});
