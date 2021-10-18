//////////////////////////////////////////////////////////////////////
// Underlying Post from data Component
import React from 'react'
import { ImageStyle, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { Link, Markdown, Text, Title } from '~comps/Typography'
import { IpfsBanner, IpfsImage } from '~comps/IpfsImage'
import { summarizeMd } from '@subsocial/utils'
import { AnyPostId } from '@subsocial/types'
import { useSubsocialInitializer } from '~src/components/SubsocialContext'
import BN from 'bn.js'

const SUMMARY_LIMIT = 120
const IMAGE_PREVIEW_HEIGHT = 160

export class PostNotFoundError extends Error {
  constructor(postId: number) {
    super(`Subsocial Post ${postId} not found`);
  }
}

export type HeadProps = {
  /** IPFS CID */
  image?: string
  title: string
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
    const {summary, isShowMore} = summarizeMd(content, {limit: SUMMARY_LIMIT});
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

export const usePost = (id: AnyPostId) => useSubsocialInitializer(async api => {
  const data = await api.findPost({id: new BN(id)});
  if (!data) throw new PostNotFoundError(id.toNumber());
  return data;
}, [id]);

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
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
