//////////////////////////////////////////////////////////////////////
// Underlying Post from data Component
import React from 'react'
import { ImageStyle, StyleProp, StyleSheet, TextStyle, View } from 'react-native'
import { Link, Markdown, Text, Title } from '~comps/Typography'
import { IpfsBanner, IpfsImage } from '~comps/IpfsImage'
import { summarizeMd } from '@subsocial/utils'
import { AnyPostId, PostData } from '@subsocial/types'
import { SubsocialApi } from '@subsocial/api'
import { Visibility } from '@subsocial/api/filters'
import { useSubsocialEffect } from '~comps/SubsocialContext'
import { cachePosts, queryPostCache } from 'src/IpfsCache'
import { keys, partition } from 'src/util'

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

export const usePost = (id: AnyPostId) => useSubsocialEffect(async api => {
  const [data] = await loadPosts(api, [id]);
  if (!data) throw new PostNotFoundError(id.toNumber());
  return data;
}, [id]);

export async function loadPosts(api: SubsocialApi, ids: AnyPostId[], {visibility = 'onlyPublic'}: {visibility?: Visibility} = {}): Promise<PostData[]> {
  const structs = await api.substrate.findPosts({ids, visibility});
  const [withCid, withoutCid] = partition(structs, struct => struct.content.isIpfs);
  if (withoutCid.length) {
    console.warn('some posts have non-IPFS CIDs:', withoutCid);
  }
  
  const cached = await queryPostCache(withCid.map(struct => struct.content.asIpfs.toString()));
  
  // fetch uncached contents & cache them - if possible
  const missing = withCid.filter(struct => !(struct.content.asIpfs.toString() in cached));
  const fetched = await api.ipfs.findPosts(missing.map(struct => struct.content.asIpfs.toString()));
  cachePosts(fetched);
  
  return withCid.map(struct => {
    const cid = struct.content.asIpfs.toString();
    return {
      struct,
      content: cached[cid] ?? fetched[cid], // note: both cached & fetched may be empty
    }
  })
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
