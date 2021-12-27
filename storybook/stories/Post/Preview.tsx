//////////////////////////////////////////////////////////////////////
// Post Preview - assembled from Post Base components
import React, { useCallback, useEffect } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useCreateReloadPost, useSelectPost } from 'src/rtk/app/hooks'
import { PostId, PostWithSomeDetails } from 'src/types/subsocial'
import { ExploreStackNavigationProp } from '~comps/ExploreStackNav'
import { Divider } from '~comps/Typography'
import { Head, Body, PostOwner, PostOwnerProps } from './Post'
import { LikeAction, LikeEvent } from './Likes'
import { ReplyAction } from './Reply'
import { SharePostAction } from './Share'
import { ActionMenu, Panel as ActionPanel, ShareEvent } from '../Actions'
import { WithSize } from 'src/types'
import { start } from 'src/util/Profiler'
import { pathFromProp, ProfilingProps, timed } from 'src/util/Profiler/react'

export type PostPreviewProps = Omit<PreviewDataProps, 'data'>
export const Preview = timed(({ id, profile, ...props }: PostPreviewProps & ProfilingProps) => {
  const reloadPost = useCreateReloadPost()
  const data = useSelectPost(id)
  const path = pathFromProp(profile)
  
  useEffect(() => {
    start('reloadPost', path)
      .promise(reloadPost({ id, reload: true }))
  }, [ id ])
  
  return <PreviewData {...props} {...{ id, data }} profile={{ path: path }} />
}, {
  tag: 'PostPreview',
  memoize: true,
})


type PreviewDataProps = {
  id: PostId
  data: PostWithSomeDetails | undefined
  containerStyle?: StyleProp<ViewStyle>
  onPressMore?: (id: PostId) => void
  onPressOwner?: PostOwnerProps['onPressOwner']
  onPressSpace?: PostOwnerProps['onPressSpace']
  onPressLike?: (evt: LikeEvent) => void
  onLike?: (evt: LikeEvent) => void
  onUnlike?: (evt: LikeEvent) => void
  onPressShare?: (evt: ShareEvent) => void
  onShare?: (evt: ShareEvent) => void
}
export const PreviewData = timed(({
  id,
  data,
  containerStyle,
  onPressMore: _onPressMore,
  onPressOwner,
  onPressSpace,
  onPressLike,
  onLike,
  onUnlike,
  onPressShare,
  onShare,
}: PreviewDataProps & ProfilingProps) =>
{
  const nav = useNavigation<ExploreStackNavigationProp | undefined>()
  const renderActions = ({ size }: WithSize) => {
    return <>
      <ActionMenu.Secondary
        label="View reactions"
        icon={{
          family: 'ionicon',
          name: 'bulb-outline',
          size,
        }}
        onPress={() => alert('not yet implemented, sorry')}
      />
      <ActionMenu.Secondary
        label="View on IPFS"
        icon={{
          family: 'ionicon',
          name: 'analytics-outline',
          size,
        }}
        onPress={() => alert('not yet implemented, sorry')}
      />
    </>
  }
  
  const { title = '', body: content = '', image } = data?.post?.content ?? {}
  
  const onPressMore = useCallback((id: PostId) => {
    if (_onPressMore) {
      _onPressMore(id)
    }
    else if (nav?.push) {
      nav.push('Post', { postId: id })
    }
  }, [ _onPressMore ])
  
  return (
    <View style={[ styles.container, containerStyle ]}>
      <PostOwner
        {...{ onPressOwner, onPressSpace }}
        postId={id}
        postData={data?.post}
        actionMenuProps={{
          secondary: renderActions
        }}
      />
      <Head {...{ title, image }} preview />
      <Body content={content} preview onPressMore={() => onPressMore?.(id)} />
      
      <Divider style={{ marginTop: 16 }} />
      
      <ActionPanel style={{ marginVertical: 16 }}>
        <LikeAction
          postId={id}
          onPress={onPressLike}
          onLike={onLike}
          onUnlike={onUnlike}
        />
        <ReplyAction postId={id} />
        <SharePostAction
          postId={id}
          onPress={onPressShare}
          onShare={onShare}
        />
        <ActionPanel.TipItem />
      </ActionPanel>
    </View>
  )
}, {
  tag: 'PostData',
  memoize: true,
  withContext: true,
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleWrapper: {
    paddingTop: 6,
  },
  title: {
    fontWeight: 'bold',
    textAlignVertical: 'bottom',
  },
  italic: {
    fontStyle: 'italic',
  },
})
